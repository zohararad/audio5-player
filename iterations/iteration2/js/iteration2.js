(function(){
  "use strict";

  var audio = document.querySelector('#my_audio');
  var input = document.querySelector('#file_input');
  var rate = document.querySelector('#audio_rate');

  input.addEventListener('change', function(e){
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function(evt){
      audio.src = evt.target.result;
      audio.play();
    }
    reader.readAsDataURL(file);
  });

  rate.addEventListener('change', function(event){
    this.setAttribute('data-value', this.value);
    audio.playbackRate = event.target.value;
  }, false);

})();