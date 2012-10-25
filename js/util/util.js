/**
 * Defines Util module
 */
define( function(){
  "use strict";

  /**
   * Capitalize string and remove space / hyphen / underscore
   * @param [String] str string to manipulate
   * @return [String] titlized string
   */
  var titlize = function(str){
    return str.replace(/[\_\-]+/g,' ').replace(/^.|\s\w/g, function(a) { return a.replace(/\s/,'').toUpperCase(); });
  }

  /**
   * Convert time in ms to HH:MM:SS string
   * @param [Integer] n time in ms
   * @return [String] time as HH:MM:SS
   */
  var getTimeFromMs = function(n){
    var seconds = Math.floor(n/1000);
    var minutes = Math.floor(seconds/60);
    var hours = Math.floor(minutes/60);

    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    var time = (hours<10 ? '0'+hours.toString() : hours.toString()) + ':'+(minutes<10 ? '0'+minutes.toString() : minutes.toString()) + ':'+(seconds<10 ? '0'+seconds.toString() : seconds.toString());
    return time;
  }

  return {
    titlize: titlize,
    getTimeFromMs: getTimeFromMs
  }

} );