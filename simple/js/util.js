(function($win, $){
  "use strict";

  $.toArray = function(list){
    return Array.prototype.slice.call(list || [], 0);
  }

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