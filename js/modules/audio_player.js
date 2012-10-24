define(["../util/module", "../util/pubsub"], function(module, pubsub) {
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
    src: null,
    duration: 0,
    position: 0,
    volume: 100,
    timer: null,
    state: null,
    load: function(src) {
      this.audio.src = this.src = src;
      this.timer = setInterval(this.checkDownloadProgress.bind(this), 500);
    },
    play: function() {
      this.audio.play();
    },
    pause: function(){
      this.audio.pause();
    },
    stop: function(){
      this.pause();
      try{
        this.audio.currentTime = 0;
      } catch(e) {}
    },
    seek: function(position){
      this.audio.currentTime = position / 1000;
      this.play();
    },
    complete: function(){
      this.clearTimer();
    },
    onPlayerEvent: function(evt){
      this.state = evt.type;
      this.trigger(evt.type, this);
    },
    onTimeUpdate: function(){
      if(this.audio.buffered.length > 0 && this.audio.duration > 0){
        this.trigger('playTimeUpdate', this.audio.currentTime * 1000, this.audio.duration * 1000);
      }
    },
    checkDownloadProgress: function(){
      var loaded = parseInt(((this.audio.buffered.end(this.audio.buffered.length-1) / this.audio.duration) * 100), 10);
      this.trigger('downloadProgress', loaded);
      if(loaded === 100){
        this.clearTimer();
      }
    },
    clearTimer: function(){
      if(this.timer !== null){
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  };

  module.include(AudioPlayer, pubsub);
  return AudioPlayer;
});
