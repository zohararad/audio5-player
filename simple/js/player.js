(function($win, $){
  "use strict";

  var Playlist = {
    Model: function(callback){
      this.init(callback);
    },
    View:  function(container){
      this.init(container);
    }
  }

  Playlist.Model.prototype = {
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

  Playlist.View.prototype = {
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

  var Player = {
    Audio: function(container){
      this.init(container);
    },
    View:  function(container){
      this.init(container);
    },
    Controller: function(container){
      this.init(container);
    }
  }

  Player.Audio.prototype = {
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

  Player.Controller.prototype = {
    dom:{},
    init: function(container){
      this.dom.container = container;
      this.dom.browse = this.dom.container.find('input[type=file]');
      this.dom.playlist = this.dom.container.find('.playlist tbody');

      this.view = new Playlist.View(this.dom.playlist);
      this.model = new Playlist.Model(this.render.bind(this));
      this.audio = new Player.Audio(container);
    },
    render: function(){
      var that = this;
      this.model.all(function(records){
        that.view.render(records);
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
        this.model.saveFile(f, function(fileEntry){
          that.view.append(fileEntry);
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
      var track = this.model.find(name);
      this.audio.load(track.url);
    },
    onRemoveTrackClick: function(evt){
      evt.stopPropagation();
      var s = $(evt.target);
      var name = s.data('name');
      this.model.remove(name, this.onTrackRemove.bind(this));
    },
    onTrackRemove: function(f){
      this.view.remove(f.name);
    }
  }

  $win.player = new Player.Controller($('#player'))
})(this, jQuery);