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
  var currentIndex = -1;

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
    readFS();
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

  function readFS(){
    fs.root.getDirectory(rootDir, {create: true}, function(dirEntry) {
      var dirReader = dirEntry.createReader();
      dirReader.readEntries(function(results) {
        files = Array.prototype.slice.call(results, 0);
        renderFiles(files);
      });
    });
  }

  function onFileSelect(e){
    files = Array.prototype.slice.call(e.target.files, 0);
    renderFiles(files);
    files.forEach(writeFS);
    playFiles();
  }

  function playFile(file){
    if(typeof(file.toURL) === 'function'){
      audio.src = file.toURL();
      audio.play();
    } else {
      var reader = new FileReader();
      reader.onload = function(evt){
        audio.src = evt.target.result;
        audio.play();
      }
      reader.readAsDataURL(file);
    }
  }

  function playFiles(){
    currentIndex += 1;
    if(currentIndex < files.length){
      var file = files[currentIndex];
      playFile(file);
    }
  }

  function renderFiles(files){
    files.forEach(function(file, index){
      var cb = function(id3){
        id3.name = file.name;
        var text = [];
        for(var k in id3){
          if(id3.hasOwnProperty(k) && id3[k] !== null){
            text.push(k+': '+id3[k]);
          }
        }
        var li = document.createElement('li');
        li.innerText = text.join(' | ');
        li.setAttribute('data-index',index);
        li.addEventListener('click', onTrackClick);
        playlist.appendChild(li);
      }
      if(file.file){
        file.file(function(f){
          getID3Tags(f, cb);
        });
      } else {
        getID3Tags(file, cb);
      }
    });
  }

  function onTrackClick(e){
    var i = parseInt(e.target.getAttribute('data-index') || -1);
    if(i > -1){
      currentIndex = i;
      playFile(files[i]);
    }
  }

  function getID3Tags(file, callback){
    var reader = new FileReader();

    reader.onloadend = function(evt){
      // see http://ericbidelman.tumblr.com/post/8343485440/reading-mp3-id3-tags-in-javascript for more info
      var dv = new jDataView(evt.target.result);

      var o = {title: null, artist: null, album: null, year: null};

      if (dv.getString(3, dv.byteLength - 128) == 'TAG') {
        o.title = dv.getString(30, dv.tell());
        o.artist = dv.getString(30, dv.tell());
        o.album = dv.getString(30, dv.tell());
        o.year = dv.getString(4, dv.tell());
      }
      callback(o);
    };

    reader.readAsArrayBuffer(file);

  }

  initFS();
})();