define(['../util/mixin', '../util/pubsub'], function(mixin, pubsub) {
  "use strict";

  var AudioPlayer = function(){
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.autoplay = false;
    this.state = 'ready';
    this.init();
  };

  AudioPlayer.prototype = {
    _src: null, //audio source
    _volume: 100, //audio volume
    _timer: null, //download interval timer
    state: null, //player state
    events: ['play', 'pause', 'ended', 'canplay', 'playTimeUpdate'], //public player events

    /**
     * Initialize the AudioPlayer instance
     */
    init: function(){
      var playerEvents = $.merge(['durationchange', 'timeupdate'], this.events);
      playerEvents.splice(playerEvents.indexOf('playTimeUpdate'),1);
      $.each(playerEvents, function(i, evt) {
        this.audio.addEventListener(evt, this.onPlayerEvent.bind(this), false);
      }.bind(this));

      this.on('timeupdate', this.onTimeUpdate, this);
      this.on('ended', this.complete, this);
    },
    /**
     * Load a new audio file into the player
     * @param [String] src source of the audio to play
     */
    load: function(src) {
      this.audio.src = this._src = src;
      this.volume(this._volume);
      this._timer = setInterval(this.checkDownloadProgress.bind(this), 500);
    },
    /**
     * Play current audio
     */
    play: function() {
      this.audio.play();
    },
    /**
     * Pause current audio
     */
    pause: function(){
      this.audio.pause();
    },
    /**
     * Stop current audio (pause and reset position to 0)
     */
    stop: function(){
      this.pause();
      try{
        this.seek(0);
      } catch(e) {}
    },
    /**
     * Seek to a given playback time
     * @param [Integer] position playback position to seek to (in ms)
     */
    seek: function(position){
      this.audio.currentTime = position / 1000;
      this.play();
    },
    /**
     * Get or set audio volume.
     * @param [Integer] vol audio volume between 0 - 100
     * @return [Integer] audio volume
     */
    volume: function(vol){
      if(vol !== undefined && parseInt(vol) !== NaN){
        this._volume = vol;
        this.audio.volume = vol / 100;
      } else if (vol === undefined){
        return this._volume;
      }
    },
    /**
     * Playback completion handler
     */
    complete: function(){
      this.clearTimer();
    },
    /**
     * Generic handler for DOM events on the audio object.
     * Dispatches events to listeners and updates player state variable
     * @param [DOMEvent] evt DOM event triggered on the audio object
     */
    onPlayerEvent: function(evt){
      switch(evt.type){
        case 'timeupdate':
          break;
        case 'durationchange':
          this.state = 'load';
          break;
        default:
          this.state = evt.type;
          break;
      }
      this.trigger(evt.type, this);
    },
    /**
     * Event handler for playback time change.
     * Triggers 'playTimeUpdate' events with current play time and playback duration.
     */
    onTimeUpdate: function(){
      if(this.audio.buffered.length > 0 && this.audio.duration > 0){
        this.trigger('playTimeUpdate', parseInt(this.audio.currentTime * 1000), parseInt(this.audio.duration * 1000));
      }
    },
    /**
     * Checks track download progress by the browser.
     * Called periodically after track is loaded to the audio object.
     * Triggers 'downloadProgress' event with percent of loaded audio
     */
    checkDownloadProgress: function(){
      var loaded = parseInt(((this.audio.buffered.end(this.audio.buffered.length-1) / this.audio.duration) * 100), 10);
      this.trigger('downloadProgress', loaded);
      if(loaded === 100){
        this.clearTimer();
      }
    },
    /**
     * Clear periodical download progress timer
     */
    clearTimer: function(){
      if(this._timer !== null){
        clearInterval(this._timer);
        this._timer = null;
      }
    }
  };

  mixin.include(AudioPlayer, pubsub);
  return AudioPlayer;
});
