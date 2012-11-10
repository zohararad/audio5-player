var input = document.querySelector('input[type=file]');
var audio = document.querySelector('audio');

input.addEventListener('change', function(event){
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e){
		audio.src = e.target.result;
    audio.play();
	};
	reader.readAsDataURL(file);
}, false);