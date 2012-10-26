(function($win, $){
  "use strict";

  var Player = function(container){
    this.init(container);
  }

  Player.prototype = {
    dom:{},
    fileList: [],
    existingFiles: [],
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
      this.fs.all(function(results){
        results.forEach(this.addFileEntry.bind(this));
      }.bind(this));
    },
    onFilePick: function(evt){
      var files = evt.target.files; // FileList object
      for (var i = 0, f; f = files[i]; i++) {
        this.handleFilePick(f, i);
      }
    },
    handleFilePick: function(file, index){
      this.fs.write(file, function(fileEntry){
        this.addFileEntry(fileEntry, index);
      }.bind(this));
    },
    addFileEntry: function(fileEntry, index){
      if(this.existingFiles.indexOf(fileEntry.name) === -1){
        this.fileList[index] = fileEntry;
        this.addToPlaylist(index);
        this.existingFiles.push(fileEntry.name);
      }
    },
    addToPlaylist: function(index){
      var f = this.fileList[index];
      var li = $('<li class="track" data-index="'+index+'">'+f.name+'</li>');
      li.appendTo(this.dom.playlist);
    },
    onTrackClick: function(evt){
      var li = $(evt.target);
      var index = parseInt(li.data('index'));
      this.playFromList(index);
    },
    playFromList: function(index){
      var f = this.fileList[index];
      this.dom.audio.src = f.toURL();
      this.dom.audio.play();
    }
  }

  $win.player = new Player($('#player'))
})(this, jQuery);