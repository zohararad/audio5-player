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
      this.dom.browse = container.find('input[type=file]');
      this.dom.audio = container.find('audio').get(0);
      this.setupEvents();
    },
    setupEvents: function(){
      this.dom.browse.on('change', this.onFilePick.bind(this));
    },
    onFilePick: function(evt){
      var files = evt.target.files; // FileList object
      for (var i = 0, f; f = files[i]; i++) {
        this.handleFilePick(f, i);
      }
    },
    handleFilePick: function(file, index){
      var o = {
        name: file.name,
        size: parseFloat(file.size * 9.53674e-7).toFixed(2),
        type: (file.type || 'n/a')
      }
      var reader = new FileReader();
      reader.onload = function(e){
        o.fileData = e.target.result;
        this.fileList[index] = o;
        this.fileReadComplete(index);
      }.bind(this);
      reader.readAsDataURL(file);
    },
    fileReadComplete: function(index){
      if(index === 0){
        this.playFromList(index);
      }
    },
    playFromList: function(index){
      var f = this.fileList[index];
      this.dom.audio.src = f.fileData;
      this.dom.audio.play();
    }
  }

  $win.player = new Player($('#player'))
})(this, jQuery);