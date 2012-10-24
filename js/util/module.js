define( function(){
  "use strict";

  var extend = function(target, mixin) {
    var name, method;
    for(name in mixin){
      if(mixin.hasOwnProperty(name)){
        target[name] = mixin[name]
      }
    }
    return target;
  }

  var include = function(target, mixin) {
    return extend(target.prototype, mixin);
  }

  return {
    extend: extend,
    include: include
  }

} );