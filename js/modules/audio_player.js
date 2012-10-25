define(["../util/mixin", "../util/pubsub"], function(mixin, pubsub) {
  "use strict";

  var AudioPlayer = function(){
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.autoplay = false;
    this.state = 'ready';

    ['play', 'pause', 'ended', 'durationchange', 'canplay', 'timeupdate'].forEach(function(evt) {
      this.audio.addEventListener(evt, this.onPlayerEvent.bind(this), false);
    }.bind(this));

    this.on('timeupdate', this.onTimeUpdate.bind(this));
    this.on('ended', this.complete.bind(this));
  };

  AudioPlayer.prototype = {
    src: null, //audio source
    volume: 100, //audio volume
    timer: null, //download interval timer
    state: null, //player state
    /**
     * Load a new audio file into the player
     * @param [String] src source of the audio to play
     */
    load: function(src) {
      this.audio.src = this.src = src;
      this.timer = setInterval(this.checkDownloadProgress.bind(this), 500);
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
      this.state = evt.type;
      this.trigger(evt.type, this);
    },
    /**
     * Event handler for playback time change.
     * Triggers 'playTimeUpdate' events with current play time and playback duration.
     */
    onTimeUpdate: function(){
      if(this.audio.buffered.length > 0 && this.audio.duration > 0){
        this.trigger('playTimeUpdate', this.audio.currentTime * 1000, this.audio.duration * 1000);
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
      if(this.timer !== null){
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  };

  mixin.include(AudioPlayer, pubsub);
  return AudioPlayer;
});
