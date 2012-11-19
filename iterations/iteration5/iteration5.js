(function(){
  "use strict";

  // normalize vendor-prefixed functionality
  window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
  window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

  var audio = document.querySelector('#my_audio');
  var input = document.querySelector('#file_input');
  var rate = document.querySelector('#audio_rate');
  var playlist = document.querySelector('#playlist');
  var files = [];
  var fs;
  var rootDir = 'my_audio';

  function initFS(){
    // Request persistent storage quota from FS API
    window.webkitStorageInfo.requestQuota(
      PERSISTENT,
      50*1024*1024,
      onQuotaGranted,
      onFSError
    );
  }

  function onQuotaGranted(bytes){
    window.requestFileSystem(
      PERSISTENT,
      bytes,
      onFSReady,
      onFSError
    );
  }

  function onFSReady(fileSystem){
    fs = fileSystem;
    input.addEventListener('change', onFileSelect);

    rate.addEventListener('change', function(event){
      this.setAttribute('data-value', this.value);
      audio.playbackRate = event.target.value;
    }, false);

    audio.addEventListener('ended', playFiles);
  }

  function onFSError(err){
    var msg = 'FileSystem Error #' + err.code + '. Lookup here: http://bit.ly/FileErrors';
    console.error(msg, err);
  }

  function writeFS(f){
    fs.root.getDirectory(rootDir, {create: true}, function(dirEntry) {

      var fileName = [rootDir, f.name].join('/');
      fs.root.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {

        fileEntry.createWriter(function(fileWriter) {

          fileWriter.write(f);

        }, onFSError);

      }, onFSError);

    }, onFSError);
  }

  function onFileSelect(e){
    files = Array.prototype.slice.call(e.target.files, 0);
    var fragment = document.createDocumentFragment();
    files.forEach(function(file){
      var li = document.createElement('li');
      li.innerText = file.name;
      fragment.appendChild(li);
      writeFS(file);
    });
    playlist.appendChild(fragment);
    playFiles();
  }

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

  initFS();
})();