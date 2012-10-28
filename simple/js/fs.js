// see http://www.html5rocks.com/en/tutorials/file/filesystem/ for more
(function($){
  "use strict";

  window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
  window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

  var FS = function(cb){
    window.webkitStorageInfo.requestQuota(
      PERSISTENT,
      50*1024*1024,
      this.onQuotaGranted.bind(this, cb),
      this.onFSError.bind(this));
  }

  FS.prototype = {
    rootDir: '/audio_files',
    onQuotaGranted: function(cb, bytes){
      window.requestFileSystem(
        PERSISTENT,
        bytes,
        this.onFSReady.bind(this, cb),
        this.onFSError.bind(this)
      );
    },
    onFSReady: function(cb, fs){
      this.fs = fs;
      cb();
    },
    onFSError: function(err){
      var msg = '';
      switch (err.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
          msg = 'QUOTA_EXCEEDED_ERR';
          break;
        case FileError.NOT_FOUND_ERR:
          msg = 'NOT_FOUND_ERR';
          break;
        case FileError.SECURITY_ERR:
          msg = 'SECURITY_ERR';
          break;
        case FileError.INVALID_MODIFICATION_ERR:
          msg = 'INVALID_MODIFICATION_ERR';
          break;
        case FileError.INVALID_STATE_ERR:
          msg = 'INVALID_STATE_ERR';
          break;
        default:
          msg = 'Unknown Error';
          break;
      };

      console.log('Error: ' + msg);
    },
    write: function(f, cb){
      this.fs.root.getDirectory(this.rootDir, {create: true}, function(dirEntry) {
        var fileName = [this.rootDir, f.name].join('/');
        this.fs.root.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.write(f);
            cb(fileEntry);
          }.bind(this), this.onFSError);
        }.bind(this), this.onFSError);
      }.bind(this), this.onFSError);
    },
    all: function(cb){
      this.fs.root.getDirectory(this.rootDir, {create: true}, function(dirEntry) {
        var dirReader = dirEntry.createReader();
        dirReader.readEntries(function(results) {
          cb($.toArray(results));
        });
      }.bind(this));
    },
    remove: function(fileEntry, cb){
      fileEntry.remove(cb, this.onFSError);
    }
  }
  window.FS = FS;
})(jQuery);