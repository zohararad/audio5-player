(function($, $win){
  "use strict";

  require([
    'modules/audio_player',
    'modules/controls',
    'util/util',
    'util/mixin',
    'util/pubsub'], function(AudioPlayer, Controls, util, mixin, pubsub) {

    var Player = function(container){
      this.init(container);
    }

    Player.prototype = {
      init: function(container){
        this.$dom = {
          container: container,
          controls: container.find('.controls')
        }

        this.audioPlayer = new AudioPlayer();
        this.controls = new Controls(this.$dom.controls);

        this.setupEventTriggers();
      },
      setupEventTriggers: function(){
        $.each(this.audioPlayer.events, function(i, evt){
          var e = 'onAudioPlayer' + util.titlize(evt);
          this.audioPlayer.on(evt, this.routeEvent.bind(this, e));
        }.bind(this));
        $.each(this.controls.events, function(i, evt){
          var e = 'onControls' + util.titlize(evt);
          this.controls.on(evt, this.routeEvent.bind(this, e));
        }.bind(this));
      },
      routeEvent: function(evt) {
        if(typeof(this[evt]) === 'function'){
          var args = Array.prototype.slice.call(arguments, 1);
          this[evt].apply(this, args);
        }
      },
      loadAudio: function(src){
        this.audioPlayer.load(src);
      },
      onControlsPlayPause: function(btn){
        switch(this.audioPlayer.state){
          case 'canplay':
          case 'pause':
            this.audioPlayer.play();
            break;
          case 'play':
            this.audioPlayer.pause();
            break;
        }
      },
      onAudioPlayerPlay: function(){
        this.controls.trigger('onPlay');
      },
      onAudioPlayerPause: function(){
        this.controls.trigger('onPause');
      }
    }

    mixin.include(Player, pubsub);

    var player = new Player($('.player'));
    player.loadAudio('http://pod.icast.co.il/Media/Index/Files/331730-23-10-2012.mp3');
    /**
    audioPlayer.on('play', function(){
      console.log('play start');
    });
    audioPlayer.on('playTimeUpdate', function(position, duration){
      console.log(position, duration);
    });
    audioPlayer.on('downloadProgress', function(percent){
      console.log(percent);
    });

    **/
  });

})(jQuery, this);