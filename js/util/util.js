/**
 * Defines Util module
 */
define( function(){
  "use strict";

  var titlize = function(str){
    return str.replace(/[\_\-]+/g,' ').replace(/^.|\s\w/g, function(a) { return a.replace(/\s/,'').toUpperCase(); });
  }

  return {
    titlize: titlize
  }

} );