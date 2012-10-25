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
      /**
       * Initialize the Player instance
       * @param [DOMElement] container DOM element containing player components
       */
      init: function(container){
        this.$dom = {
          container: container,
          controls: container.find('.controls')
        }

        this.audioPlayer = new AudioPlayer();
        this.controls = new Controls(this.$dom.controls);

        this.setupEventTriggers();
      },
      /**
       * Setup event triggers per component.
       * Binds the public events each component exposes to handles on the Player instance.
       * Events are bound by convention - on + ComponentName + EventName.
       * For example, 'play' event on AudioPlayer will be bound to onAudioPlayerPlay
       */
      setupEventTriggers: function(){
        $.each(this.audioPlayer.events, function(i, evt){
          var e = 'onAudioPlayer' + util.titlize(evt);
          if(typeof(this[e]) === 'function'){
            this.audioPlayer.on(evt, this[e], this);
          }
        }.bind(this));
        $.each(this.controls.events, function(i, evt){
          var e = 'onControls' + util.titlize(evt);
          if(typeof(this[e]) === 'function'){
            this.controls.on(evt, this[e], this);
          }
        }.bind(this));
      },
      /**
       * Load an audio file to the audio player
       * @param [String] src source of audio to play
       */
      loadAudio: function(src){
        this.audioPlayer.load(src);
      },
      /**
       * Handle controls play/pause event.
       * Trigger play / pause on audio player according to its state
       */
      onControlsPlayPause: function(){
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
      onControlsVolumeChange: function(vol){
        this.audioPlayer.volume(vol);
      },
      /**
       * Dispatch onPlay event to controls when the audio is player.
       */
      onAudioPlayerPlay: function(){
        this.controls.trigger('onPlay');
      },
      /**
       * Dispatch onPause event to controls when the audio is paused.
       */
      onAudioPlayerPause: function(){
        this.controls.trigger('onPause');
      },
      /**
       * Dispatches onPlayTimeUpdate to controls whenever the audio play time changes.
       * @param [Integer] position play time position (ms)
       * @param [Integer] duration play time duration (ms)
       */
      onAudioPlayerPlayTimeUpdate: function(position, duration){
        this.controls.trigger('onPlayTimeUpdate', position, duration);
      },
      /**
       * Dispatches onVolumechange event to controls whenever the audio player's volume changes.
       */
      onAudioPlayerVolumechange: function(){
        this.controls.trigger('onVolumechange', this.audioPlayer.volume());
      }
    }

    mixin.include(Player, pubsub);

    var player = new Player($('.player'));
    player.loadAudio('http://pod.icast.co.il/Media/Index/Files/331730-23-10-2012.mp3');
  });

})(jQuery, this);