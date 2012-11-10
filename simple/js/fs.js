// see http://www.html5rocks.com/en/tutorials/file/filesystem/ for more
(function($){
  "use strict";

  // normalize vendor-prefixed functionality
  window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
  window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

  /**
   * File System API Utility class
   * @param {Function} cb callback function to run when file system API is ready
   * @constructor
   */
  var FS = function(cb){
    // Request persistent storage quota from FS API
    window.webkitStorageInfo.requestQuota(
      PERSISTENT,
      50*1024*1024,
      this.onQuotaGranted.bind(this, cb),
      this.onFSError.bind(this));
  }

  FS.prototype = {
    rootDir: '/audio_files', //root directory to store files in
    /**
     * Handler for quota grant event.
     * Requests file-system access once quota is granted
     * @param {Function} cb callback function to run when file system API is ready
     * @param {Number} bytes granted quota in bytes
     */
    onQuotaGranted: function(cb, bytes){
      window.requestFileSystem(
        PERSISTENT,
        bytes,
        this.onFSReady.bind(this, cb),
        this.onFSError.bind(this)
      );
    },
    /**
     * Files sytem ready event handler
     * @param {Function} cb callback function to run when file system API is ready
     * @param {FileSystem} fs reference to file system object
     */
    onFSReady: function(cb, fs){
      this.fs = fs;
      cb();
    },
    /**
     * File system errors event handler
     * @param {Error} err error object for file system error events
     */
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
    /**
     * Write file to file system
     * @param {File} f file to write
     * @param {Function} cb callback function to run when file has been successfully written
     */
    write: function(f, cb){
      var that = this;
      this.fs.root.getDirectory(this.rootDir, {create: true}, function(dirEntry) {
        var fileName = [that.rootDir, f.name].join('/');
        that.fs.root.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.write(f);
            cb(fileEntry);
          }, that.onFSError);
        }, that.onFSError);
      }, that.onFSError);
    },
    /**
     * Get all file entries stored in `this.rootDir`
     * @param {Function} cb callback function to run when all file entries have been read
     */
    all: function(cb){
      this.fs.root.getDirectory(this.rootDir, {create: true}, function(dirEntry) {
        var dirReader = dirEntry.createReader();
        dirReader.readEntries(function(results) {
          cb($.toArray(results));
        });
      });
    },
    /**
     * Remove a file from the file system
     * @param {FileEntry} fileEntry file entry to remove
     * @param {Function} cb callback function to run when file has been successfully removed
     */
    remove: function(fileEntry, cb){
      fileEntry.remove(cb, this.onFSError);
    }
  }

  // export as global module;
  window.FS = FS;
})(jQuery);