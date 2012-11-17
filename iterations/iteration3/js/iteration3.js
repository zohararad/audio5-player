(function(){
  "use strict";

  var audio = document.querySelector('#my_audio');
  var input = document.querySelector('#file_input');
  var rate = document.querySelector('#audio_rate');
  var playlist = document.querySelector('#playlist');
  var files = [];

  input.addEventListener('change', function(e){
    files = Array.prototype.slice.call(e.target.files, 0);
    var fragment = document.createDocumentFragment();
    files.forEach(function(file){
      var li = document.createElement('li');
      li.innerText = file.name;
      fragment.appendChild(li);
    });
    playlist.appendChild(fragment);
    playFiles();
  });

  rate.addEventListener('change', function(event){
    this.setAttribute('data-value', this.value);
    audio.playbackRate = event.target.value;
  }, false);

  audio.addEventListener('ended', playFiles);

  function playFile(file){
    var reader = new FileReader();
    reader.onload = function(evt){
      audio.src = evt.target.result;
      audio.play();
    }
    reader.readAsDataURL(file);
  }

  function playFiles(){
    if(files.length > 0){
      var file = files.shift();
      playFile(file);
    }
  }

})();