var Player = function(){

var that = this;
var $that = $(that);
this.input = document.querySelector('input[type=file]');
this.audio = document.querySelector('audio');
this.range = document.querySelector('input[type=range]');

this.input.addEventListener('change', function(event){
	$that.trigger('fileSelected');
    var file = event.target.files[0];
	var reader = new FileReader();
	reader.onload = function(){
		that.audio.src = this.result;
        that.audio.play();
        $that.trigger('played');
	};
	reader.readAsDataURL(file);
}, false);

this.range.addEventListener('change', function(event){
  $that.trigger('changedPlaybackRate');
  this.setAttribute('data-value', this.value);
  that.audio.playbackRate = this.value;
}, false)

return this;

};

var player = new Player();