define(["../util/mixin", "../util/pubsub"], function(mixin, pubsub) {
  "use strict";

  var Controls = function(container){

    container.find('button[data-action]').each(function(i, el){
      var btn = $(el), action = btn.data('action');
      btn.on('click', this.onControlsClick.bind(this, action, btn));
      this.events.push(action);
      this.dom.buttons[action] = btn;
    }.bind(this));
    $.each(this.subscriptions, function(i, sub){
      if(typeof(this[sub]) === 'function'){
        this.on(sub, this[sub], this);
      }
    }.bind(this));
  }

  Controls.prototype = {
    events:[],
    subscriptions: ['onPlay', 'onPause', 'onDownloadProgress', 'onPlayTimeUpdate'],
    dom:{
      buttons:{}
    },
    onControlsClick: function(action, btn, evt){
      this.trigger(action, btn);
    },
    onPlay: function(){
      this.dom.buttons.play_pause.addClass('pause');
    },
    onPause: function(){
      this.dom.buttons.play_pause.removeClass('pause');
    }
  }

  mixin.include(Controls, pubsub);
  return Controls;
});