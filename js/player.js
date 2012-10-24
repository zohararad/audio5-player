(function($, $win){
  "use strict";

  require(["modules/audio_player"], function(AudioPlayer) {
    var audioPlayer = new AudioPlayer();
    audioPlayer.on('play', function(){
      console.log('play start');
    });
    audioPlayer.on('playTimeUpdate', function(position, duration){
      console.log(position, duration);
    });
    audioPlayer.on('downloadProgress', function(percent){
      console.log(percent);
    });
    audioPlayer.load('http://pod.icast.co.il/Media/Index/Files/331730-23-10-2012.mp3');
  });

})(jQuery, this);