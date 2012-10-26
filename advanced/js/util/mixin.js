/**
 * Defines Mixin capabilities for extending and including objects in other classes / objects
 */
define( function(){
  "use strict";

  /**
   * Extend an object with a mixin
   * @param [Object] target target object to extend
   * @param [Object] mixin object to mix into target
   * @return {*} extended object
   */
  var extend = function(target, mixin) {
    var name, method;
    for(name in mixin){
      if(mixin.hasOwnProperty(name)){
        target[name] = mixin[name]
      }
    }
    return target;
  }

  /**
   * Extend an object's prototype with a mixin
   * @param [Object] target target object to extend
   * @param [Object] mixin object to mix into target
   * @return {*} extended object
   */
  var include = function(target, mixin) {
    return extend(target.prototype, mixin);
  }

  return {
    extend: extend,
    include: include
  }

} );