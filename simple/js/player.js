(function($win, $){
  "use strict";

  var Player = function(container){
    this.init(container);
  }

  Player.prototype = {
    dom:{},
    fileList: [],
    init: function(container){
      this.dom.container = container;
      this.fs = new FS(this.setup.bind(this));
    },
    setup: function(){

      this.dom.browse = this.dom.container.find('input[type=file]');
      this.dom.audio = this.dom.container.find('audio').get(0);
      this.dom.playlist = this.dom.container.find('.playlist');
      this.dom.browse.on('change', this.onFilePick.bind(this));
      this.dom.playlist.delegate('li','click',this.onTrackClick.bind(this));
      this.dom.playlist.delegate('span[data-action=remove]','click',this.onRemoveTrackClick.bind(this));
      this.fs.all(function(results){
        results.forEach(function(fileEntry){
          if(this.getTrackIndex(fileEntry.name) === -1){
            this.addFileEntry(fileEntry, this.addToPlaylist.bind(this, fileEntry));
          }
        }.bind(this));
      }.bind(this));
    },
    onFilePick: function(evt){
      var files = evt.target.files; // FileList object
      for (var i = 0, f; f = files[i]; i++) {
        this.handleFilePick(f);
      }
      evt.target.value = '';
    },
    handleFilePick: function(file){
      if(this.getTrackIndex(file.name) === -1){
        this.fs.write(file, function(fileEntry){
          this.addFileEntry(fileEntry, this.addToPlaylist.bind(this, fileEntry));
        }.bind(this));
      }
    },
    addFileEntry: function(fileEntry, cb){
      fileEntry.file(function(file){
        var reader = new FileReader();

        reader.onloadend = function(evt) {
          var dv = new jDataView(evt.target.result);

          var title, artist, album, year;

          if (dv.getString(3, dv.byteLength - 128) == 'TAG') {
            title = dv.getString(30, dv.tell());
            artist = dv.getString(30, dv.tell());
            album = dv.getString(30, dv.tell());
            year = dv.getString(4, dv.tell());
          }

          this.fileList.push({
            file: fileEntry,
            name: fileEntry.name,
            title: title,
            artist: artist,
            album: album,
            year: year
          });
          if(cb !== undefined){
            cb();
          }
        }.bind(this);

        // Read in the image file as a data URL.
        reader.readAsArrayBuffer(file);

      }.bind(this));
    },
    renderPlayList: function(){
      var html = [];
      this.fileList.forEach(function(f){
        html.push(this.getTrackListItemHTML(f));
      }.bind(this));
      this.dom.playlist.html(html.join(''));
    },
    addToPlaylist: function(fileEntry){
      var index = this.getTrackIndex(fileEntry.name);
      if(index > -1){
        var f = this.fileList[index];
        var li = $(this.getTrackListItemHTML(f));
        li.appendTo(this.dom.playlist);
      }
    },
    getTrackListItemHTML: function(f){
      return '<li class="track" data-name="'+ f.name +'">'+ [f.name, f.album, f.artist].join(' | ') +' <span data-action="remove" data-name="'+ f.name +'">x</span></li>';
    },
    onTrackClick: function(evt){
      var li = $(evt.target);
      var name = li.data('name');
      var index = this.getTrackIndex(name);
      if(index > -1){
        this.playFromList(index);
      }
    },
    onRemoveTrackClick: function(evt){
      evt.stopPropagation();
      var s = $(evt.target);
      var name = s.data('name');
      var index = this.getTrackIndex(name);
      if(index > -1){
        this.fs.remove(this.fileList[index].file, this.onTrackRemove.bind(this, index));
      }
    },
    onTrackRemove: function(index){
      var f = this.fileList[index];
      this.dom.playlist.find('li[data-name="'+ f.name +'"]').remove();
      this.fileList.splice(index, 1);
    },
    playFromList: function(index){
      var f = this.fileList[index];
      this.dom.audio.src = f.file.toURL();
      this.dom.audio.play();
    },
    getTrackIndex: function(name){
      return $.indexOfMemberByAttr(this.fileList, 'name', name);
    }
  }

  $win.player = new Player($('#player'))
})(this, jQuery);