(function($win, $){
  "use strict";

  /**
   * Modules Module
   * @type {Object}
   */
  var Models = {
    /**
     * Playlist model
     * @param {Function} callback callback to call when playlist model is ready
     * @constructor
     */
    Playlist: function(callback){
      this.init(callback);
    },
    /**
     * Audio player model
     * @param {DOMElement} container audio tag DOM container
     * @constructor
     */
    Audio: function(container){
      this.init(container);
    }
  }

  /**
   * Views Module
   * @type {Object}
   */
  var Views = {
    /**
     * Playlist view
     * @param {DOMElement} container playlist DOM container
     * @constructor
     */
    Playlist: function(container){
      this.init(container);
    },
    /**
     * Audio player view
     * @param {DOMElement} container audio player DOM container
     * @constructor
     */
    Player: function(container){
      this.init(container);
    }
  }

  /**
   * Controllers module
   * @type {Object}
   */
  var Controllers = {
    /**
     * Audio player controller
     * @param {DOMElement} container player and playlist DOM container
     * @constructor
     */
    Player: function(container){
      this.init(container);
    }
  }

  /**
   * Playlist model instance methods
   * @type {Object}
   */
  Models.Playlist.prototype = {
    fs:null, //file system util instance
    records:[], //collection of playable tracks
    /**
     * Initialize the playlist
     * @param {Function} callback callback to call when the playlist and underlying file system are ready
     */
    init: function(callback){
      this.fs = new FS(this.fsReady.bind(this, callback));
    },
    /**
     * Handle file-system ready event. Read all available entries and pass to callback.
     * @param {Function} callback callback to call when all files have been read from the file system
     */
    fsReady: function(callback){
      this.fs.all(this.onFilesRead.bind(this, callback));
    },
    /**
     * Accepts all files read from the file system and passes them for parsing
     * @param {Function} callback callback to call when all files have been read and prepared
     * @param {Array} files array of files read from the file system after it was initialized
     */
    onFilesRead: function(callback, files){
      this.savedFiles = files;
      this.parseSavedFile(callback);
    },
    /**
     * Recursive function that sends each file read from the file system for parsing and addition to `this.records` array
     * @param {Function} callback callback to call when all files have been read and prepared
     */
    parseSavedFile: function(callback){
      if(this.savedFiles.length){
        var fileEntry = this.savedFiles.shift();
        this.addFileEntry(fileEntry, this.parseSavedFile.bind(this, callback));
      } else {
        callback();
      }
    },
    /**
     * Parses individual file entries, extracts ID3 tags from them and pushes each parsed entry to `this.records`
     * @param {FileEntry} fileEntry file entry to parse
     * @param {Function} callback callback to call when file parsing and addition has been complete
     */
    addFileEntry: function(fileEntry, callback){
      var that = this;
      fileEntry.file(function(file){
        var reader = new FileReader();

        reader.onloadend = function(evt){
          var id3 = that.getFileID3(evt.target.result);
          var o = $.extend({file: fileEntry, name: fileEntry.name, url: fileEntry.toURL()}, id3);
          that.records.push(o);
          callback();
        };

        reader.readAsArrayBuffer(file);

      });
    },
    /**
     * Saves a file to the file system
     * @param {File} file file to save
     * @param {Function} callback callback to call when the file has been successfully written to the file system
     */
    saveFile: function(file, callback){
      if(!this.entryExists(file.name)){
        this.fs.write(file, this.onFileSave.bind(this, callback));
      }
    },
    /**
     * Handles successful file-write event
     * @param {Function} callback callback to call when the file has been successfully written to the file system
     * @param {FileEntry} fileEntry file entry of the saved file
     */
    onFileSave: function(callback, fileEntry){
      var that = this;
      var f = function(){
        that.addFileEntry(fileEntry, function(){
          var entry = that.find(fileEntry.name);
          callback(entry);
        });
      };
      setTimeout(f, 5);
    },
    /**
     * Extract ID3 tags from a file
     * @param {ArrayBuffer} data file data for parsing
     * @return {Object} ID3 tags object
     */
    getFileID3: function(data){
      // see http://ericbidelman.tumblr.com/post/8343485440/reading-mp3-id3-tags-in-javascript for more info
      var dv = new jDataView(data);

      var o = {title: null, artist: null, album: null, year: null};

      if (dv.getString(3, dv.byteLength - 128) == 'TAG') {
        o.title = dv.getString(30, dv.tell());
        o.artist = dv.getString(30, dv.tell());
        o.album = dv.getString(30, dv.tell());
        o.year = dv.getString(4, dv.tell());
      }
      return o;
    },
    /**
     * Find a record by name
     * @param {String} name name of the record to find (value of record's name attribute)
     * @return {*}
     */
    find: function(name){
      return this.records[this.getEntryIndex(name)];
    },
    /**
     * Retrieve all records
     * @return {Array} array of existing records
     */
    all: function(){
      return this.records
    },
    /**
     * Remove a record by name
     * @param {String} name name of record to remove (value of record's name attribute)
     * @param {Function} callback callback to call when record has been successfully removed
     */
    remove: function(name, callback){
      var that = this, r = this.find(name);
      this.fs.remove(r.file, function(){
        var i = that.getEntryIndex(name);
        that.records.splice(i,1);
        callback(r);
      });
    },
    /**
     * Get a record's index in `this.record` by name
     * @param {String} name value of record's name attribute to be found
     * @return {Integer}
     */
    getEntryIndex: function(name){
      return $.indexOfMemberByAttr(this.records, 'name', name);
    },
    /**
     * Checks if a record exists
     * @param {String} name value of record's name attribute to check for existence
     * @return {Boolean}
     */
    entryExists: function(name){
      return this.getEntryIndex(name) > -1;
    },
    /**
     * Sort records by attribute and direction
     * @param {String} attr attribute to sort by
     * @param {String} dir direction to sort by (asc / desc)
     * @param {Function} callback callback to call when sort is complete
     */
    sort: function(attr, dir, callback){
      this.records.sort(function(a,b){
        if(dir === 'asc'){
          return a[attr] > b[attr] ? 1 : (a[attr] < b[attr] ? -1 : 0);
        } else {
          return b[attr] > a[attr] ? 1 : (b[attr] < a[attr] ? -1 : 0);
        }
      });
      callback(this.records);
    }
  }

  /**
   * Audio model instance methods
   * @type {Object}
   */
  Models.Audio.prototype = {
    /**
     * Initialize the model
     * @param {DOMElement} container audio element DOM container
     */
    init: function(container){
      this.audio = container.find('audio').get(0);
      this.audio.preload = 'metadata';
      this.audio.autoplay = false;
    },
    /**
     * Load an audio file to the audio element
     * @param {String} url url of the audio file to load and play
     */
    load: function(url){
      this.audio.src = url;
      this.play();
    },
    /**
     * Play current audio
     */
    play: function(){
      this.audio.play();
    },
    /**
     * Pause current audio
     */
    pause: function(){
      this.audio.pause();
    }
  }

  /**
   * Playlist view instance methods
   * @type {Object}
   */
  Views.Playlist.prototype = {
    dom:{}, //DOM elements cache
    /**
     * Initialize the view
     * @param {DOMElement} playlist playlist DOM element
     */
    init: function(playlist){
      this.dom.playlist = playlist;
    },
    /**
     * Render playlist items
     * @param {Array} items items to render in playlist
     */
    render: function(items){
      var that = this, html = [];
      items.forEach(function(item){
        html.push(that.getItemHTML(item));
      });
      this.dom.playlist.html(html.join(''));
    },
    /**
     * Append a new item to the playlist
     * @param {Object} item item to append to the playlist
     */
    append: function(item){
      var el = $(this.getItemHTML(item));
      this.dom.playlist.append(el);
    },
    /**
     * Remove an item from the playlist
     * @param {String} name name of item to remove
     */
    remove: function(name){
      this.dom.playlist.find('tr[data-name="'+name+'"]').remove();
    },
    /**
     * Get playlist item's HTML as string
     * @param {Object} item playlist item
     * @return {String}
     */
    getItemHTML: function(item){
      var tds = [];
      ['title', 'artist', 'album', 'year'].forEach(function(k){
        tds.push('<td>'+item[k]+'</td>');
      });
      tds.push('<td><button type="button" data-action="remove" data-name="'+ item.name +'">Remove</button></td>');
      return '<tr class="track" data-name="'+ item.name +'">' + tds.join('') + '</tr>';
    }
  }

  /**
   * Player view instance methods
   * @type {Object}
   */
  Views.Player.prototype = {
    dom:{}, // DOM elements cache
    /**
     * Initialize the view
     * @param {DOMElement} container container of view's DOM compoents
     */
    init: function(container){
      this.dom.title = container.find('#title');
      this.dom.artist = container.find('#artist');
    },
    /**
     * Update view with track title and artist
     * @param {Object} track track object containing information about currently playing track
     */
    render: function(track){
      var title = track.title || 'Unknown';
      var artist = track.artist || 'Unknown';
      this.dom.title.text(title);
      this.dom.artist.text(artist);
    }
  }

  /**
   * Player controller instance methods
   * @type {Object}
   */
  Controllers.Player.prototype = {
    dom:{}, // DOM elements cache
    views:{ // views object
      playlist:null,
      player: null
    },
    /**
     * Initialize the controller
     * @param {DOMElement} container DOM element containing all player and playlist DOM components
     */
    init: function(container){
      this.dom.container = container;
      this.dom.browse = this.dom.container.find('input[type=file]');
      this.dom.playlist = this.dom.container.find('.playlist tbody');

      this.views.playlist = new Views.Playlist(this.dom.playlist);
      this.views.player = new Views.Player(container);
      this.playlist = new Models.Playlist(this.render.bind(this));
      this.audio = new Models.Audio(container);
    },
    /**
     * Render the player's playlist
     */
    render: function(){
      var tracks = this.playlist.all();
      this.views.playlist.render(tracks);
      this.bindEvents();
    },
    /**
     * Bind events on DOM elements
     */
    bindEvents: function(){
      this.dom.browse.on('change', this.onFilePick.bind(this));
      this.dom.playlist.delegate('tr','click',this.onTrackClick.bind(this));
      this.dom.playlist.delegate('button[data-action=remove]','click',this.onRemoveTrackClick.bind(this));
    },
    /**
     * Handle file pick event.
     * Add picked file(s) to playlist model and then render them in playlist view
     * @param {DOMEvent} evt change DOM event on file field
     */
    onFilePick: function(evt){
      var that = this, files = evt.target.files;
      for (var i = 0, f; f = files[i]; i++) {
        this.playlist.saveFile(f, function(fileEntry){
          that.views.playlist.append(fileEntry);
        });
      }
      evt.target.value = '';
    },
    /**
     * Handle playlist track click event. Plays clicked on track.
     * @param {DOMEvent} evt click DOM event on playlist item
     */
    onTrackClick: function(evt){
      var tr = $(evt.target);
      if(tr.get('tag') !== 'TR'){
        tr = tr.parents('tr');
      }
      var name = tr.data('name');
      var track = this.playlist.find(name);
      this.audio.load(track.url);
      this.views.player.render(track);
    },
    /**
     * Handles playlist item remove click event.
     * Removes track from playlist model
     * @param {DOMEvent} evt click DOM event on track remove button
     */
    onRemoveTrackClick: function(evt){
      evt.stopPropagation();
      var s = $(evt.target);
      var name = s.data('name');
      this.playlist.remove(name, this.onTrackRemove.bind(this));
    },
    /**
     * Update playlist view after track removal
     * @param {Object} f removed file object
     */
    onTrackRemove: function(f){
      this.views.playlist.remove(f.name);
    }
  }

  $win.player = new Controllers.Player($('#player'))
})(this, jQuery);
