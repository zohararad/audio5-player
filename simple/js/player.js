(function($win, $){
  "use strict";

  var Models = {
    Playlist: function(callback){
      this.init(callback);
    },
    Audio: function(container){
      this.init(container);
    }
  }

  var Views = {
    Playlist: function(container){
      this.init(container);
    },
    Player: function(container){
      this.init(container);
    }
  }

  var Controllers = {
    Player: function(container){
      this.init(container);
    }
  }

  Models.Playlist.prototype = {
    fs:null,
    records:[],
    init: function(callback){
      this.fs = new FS(this.fsReady.bind(this, callback));
    },
    fsReady: function(callback){
      this.fs.all(this.onFilesRead.bind(this, callback));
    },
    onFilesRead: function(callback, files){
      this.savedFiles = files;
      this.parseSavedFile(callback);
    },
    parseSavedFile: function(callback){
      if(this.savedFiles.length){
        var fileEntry = this.savedFiles.shift();
        this.addFileEntry(fileEntry, this.parseSavedFile.bind(this, callback));
      } else {
        callback();
      }
    },
    addFileEntry: function(fileEntry, callback){
      var that = this;
      fileEntry.file(function(file){
        var reader = new FileReader();

        reader.onloadend = function(evt){
          var id3 = that.getFileID3(evt.target.result);
          var o = $.extend({file: fileEntry, name: fileEntry.name, url: fileEntry.toURL()}, id3);
          that.records.push(o);
          callback();
        };

        reader.readAsArrayBuffer(file);

      });
    },
    saveFile: function(file, callback){
      if(!this.entryExists(file.name)){
        this.fs.write(file, this.onFileSave.bind(this, callback));
      }
    },
    onFileSave: function(callback, fileEntry){
      var that = this;
      var f = function(){
        that.addFileEntry(fileEntry, function(){
          var entry = that.find(fileEntry.name);
          callback(entry);
        });
      };
      setTimeout(f, 5);
    },
    getFileID3: function(data){
      // see http://ericbidelman.tumblr.com/post/8343485440/reading-mp3-id3-tags-in-javascript for more info
      var dv = new jDataView(data);

      var o = {title: null, artist: null, album: null, year: null};

      if (dv.getString(3, dv.byteLength - 128) == 'TAG') {
        o.title = dv.getString(30, dv.tell());
        o.artist = dv.getString(30, dv.tell());
        o.album = dv.getString(30, dv.tell());
        o.year = dv.getString(4, dv.tell());
      }
      return o;
    },
    find: function(name){
      return this.records[this.getEntryIndex(name)];
    },
    all: function(callback){
      callback(this.records);
    },
    remove: function(name, callback){
      var that = this, r = this.find(name);
      this.fs.remove(r.file, function(){
        var i = that.getEntryIndex(name);
        that.records.splice(i,1);
        callback(r);
      });
    },
    getEntryIndex: function(name){
      return $.indexOfMemberByAttr(this.records, 'name', name);
    },
    entryExists: function(name){
      return this.getEntryIndex(name) > -1;
    },
    sort: function(field, dir, callback){
      this.records.sort(function(a,b){
        if(dir === 'asc'){
          return a[field] > b[field] ? 1 : (a[field] < b[field] ? -1 : 0);
        } else {
          return b[field] > a[field] ? 1 : (b[field] < a[field] ? -1 : 0);
        }
      });
      callback(this.records);
    }
  }

  Models.Audio.prototype = {
    init: function(container){
      this.audio = container.find('audio').get(0);
      this.audio.preload = 'metadata';
      this.audio.autoplay = false;
    },
    load: function(url){
      this.audio.src = url;
      this.play();
    },
    play: function(){
      this.audio.play();
    },
    pause: function(){
      this.audio.pause();
    }
  }

  Views.Playlist.prototype = {
    dom:{},
    init: function(playlist){
      this.dom.playlist = playlist;
    },
    render: function(items){
      var that = this, html = [];
      items.forEach(function(item){
        html.push(that.getItemHTML(item));
      });
      this.dom.playlist.html(html.join(''));
    },
    append: function(item){
      var el = $(this.getItemHTML(item));
      this.dom.playlist.append(el);
    },
    remove: function(name){
      this.dom.playlist.find('tr[data-name="'+name+'"]').remove();
    },
    getItemHTML: function(item){
      var tds = [];
      ['title', 'artist', 'album', 'year'].forEach(function(k){
        tds.push('<td>'+item[k]+'</td>');
      });
      tds.push('<td><button type="button" data-action="remove" data-name="'+ item.name +'">Remove</button></td>');
      return '<tr class="track" data-name="'+ item.name +'">' + tds.join('') + '</tr>';
    }
  }

  Views.Player.prototype = {
    dom:{},
    init: function(container){
      this.dom.title = container.find('#title');
      this.dom.artist = container.find('#artist');
    },
    render: function(track){
      var title = track.title || 'Unknown';
      var artist = track.artist || 'Unknown';
      this.dom.title.text(title);
      this.dom.artist.text(title);
    }
  }

  Controllers.Player.prototype = {
    dom:{},
    views:{
      playlist:null,
      player: null
    },
    init: function(container){
      this.dom.container = container;
      this.dom.browse = this.dom.container.find('input[type=file]');
      this.dom.playlist = this.dom.container.find('.playlist tbody');

      this.views.playlist = new Views.Playlist(this.dom.playlist);
      this.views.player = new Views.Player(container);
      this.playlist = new Models.Playlist(this.render.bind(this));
      this.audio = new Models.Audio(container);
    },
    render: function(){
      var that = this;
      this.playlist.all(function(records){
        that.views.playlist.render(records);
        that.bindEvents();
      });
    },
    bindEvents: function(){
      this.dom.browse.on('change', this.onFilePick.bind(this));
      this.dom.playlist.delegate('tr','click',this.onTrackClick.bind(this));
      this.dom.playlist.delegate('button[data-action=remove]','click',this.onRemoveTrackClick.bind(this));
    },
    onFilePick: function(evt){
      var that = this, files = evt.target.files;
      for (var i = 0, f; f = files[i]; i++) {
        this.playlist.saveFile(f, function(fileEntry){
          that.views.playlist.append(fileEntry);
        });
      }
      evt.target.value = '';
    },
    onTrackClick: function(evt){
      var tr = $(evt.target);
      if(tr.get('tag') !== 'TR'){
        tr = tr.parents('tr');
      }
      var name = tr.data('name');
      var track = this.playlist.find(name);
      this.audio.load(track.url);
      this.views.player.render(track);
    },
    onRemoveTrackClick: function(evt){
      evt.stopPropagation();
      var s = $(evt.target);
      var name = s.data('name');
      this.playlist.remove(name, this.onTrackRemove.bind(this));
    },
    onTrackRemove: function(f){
      this.views.playlist.remove(f.name);
    }
  }

  $win.player = new Controllers.Player($('#player'))
})(this, jQuery);
