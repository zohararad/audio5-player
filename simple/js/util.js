/**
 * Utility module
 */
(function($win, $){
  "use strict";

  /**
   * Cast an enumrable object to a Javascript array
   * @param {*} list enumrable object to cast
   * @return {Array}
   */
  $.toArray = function(list){
    return Array.prototype.slice.call(list || [], 0);
  }

  /**
   * Find index of object in array by attribute name and value
   * @param {Array} arr array to search in
   * @param {String} attr attribute name to use for matching
   * @param {*} val attribute value to use for matching
   * @return {Integer} index of object with attribute `attr` equals value `val` in array `arr`
   */
  $.indexOfMemberByAttr = function(arr, attr, val){
    for(var i = 0, l = arr.length; i < l; i++){
      var m = arr[i];
      if(m[attr] === val){
        return i;
      }
    }
    return -1;
  }

})(this, jQuery);