var input = document.querySelector('input[type=file]');
input.addEventListener('change', function(event){
	var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function(){
		console.log(arguments);
	};
	reader.readAsDataURL(file);
}, false);