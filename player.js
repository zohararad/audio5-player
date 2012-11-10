var input = document.querySelector('input[type=file]');
var audio = document.querySelector('audio');
var range = document.querySelector('input[type=range]');

input.addEventListener('change', function(event){
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e){
		audio.src = e.target.result;
    audio.play();
	};
	reader.readAsDataURL(file);
}, false);

range.addEventListener('change', function(event){
  this.setAttribute('data-value', this.value);
    audio.playbackRate = event.target.value;
}, false)