(function($win, $){
  "use strict";

  var indexedDB = $win.indexedDB || $win.webkitIndexedDB || $win.mozIndexedDB;

  if ('webkitIndexedDB' in $win) {
    $win.IDBTransaction = $win.webkitIDBTransaction;
    $win.IDBKeyRange = $win.webkitIDBKeyRange;
  }

  var DB = function(db, table, version){
    this.init(db, table, version);
  }

  DB.prototype = {
    conn:{},
    init: function(db, table, version){
      this.conn = {
        db: db,
        table: table,
        version: (version || 1)
      };
      this.openDB();
    },
    openDB: function(){
      var request = indexedDB.open(this.conn.db);
      request.onsuccess = function(evt){
        this.db = evt.target.result;
        if(this.conn.version !== this.db.version){
          this.setDBVersion();
        }
      }.bind(this);
    },
    setDBVersion: function(){
      var request = this.db.setVersion(this.conn.version);
      request.onsuccess = function(evt){
        if(this.db.objectStoreNames.contains(this.conn.table)) {
          this.db.deleteObjectStore(this.conn.table);
        }

        var store = this.db.createObjectStore(this.conn.table, {keyPath: "name"});
        evt.target.transaction.oncomplete = this.ready.bind(this);

      }.bind(this);
    },
    ready: function(){

    },
    find: function(id, cb){

    },
    create: function(data, cb){
      var trans = this.db.transaction(this.conn.table, 'readwrite');
      var store = trans.objectStore(this.conn.table);

      var request = store.put(data);

      request.onsuccess = cb || function(){};
    },
    all: function(cb){
      var trans = this.db.transaction(this.conn.table, 'readwrite');
      var store = trans.objectStore(this.conn.table);
      var keyRange = IDBKeyRange.lowerBound(0);
      var cursorRequest = store.openCursor(keyRange);
      var records = [];
      cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if (!!result === false) {
          cb(records);
        } else {
          records.push(result.value);
        }

        result.continue();
      };
    }
  }

  $win.DB = DB;

})(this, jQuery);