define(["../util/mixin", "../util/pubsub"], function(mixin, pubsub) {
  "use strict";

  /**
   * Player controls class. Responsible for handling the view part of the audio player
   * @param [DOMElement] container container of player control DOM elements
   * @constructor
   */
  var Controls = function(container){

    // add click event handling to control buttons
    container.find('button[data-action]').each(function(i, el){
      var btn = $(el), action = btn.data('action');
      btn.on('click', this.onControlsClick.bind(this, action, btn));
      this.events.push(action); // push available actions to events array
      this.dom.buttons[action] = btn; // cache reference to button in dom cache object
    }.bind(this));

    // Bind available subscriptions to handlers
    $.each(this.subscriptions, function(i, sub){
      if(typeof(this[sub]) === 'function'){
        this.on(sub, this[sub], this);
      }
    }.bind(this));
  }

  Controls.prototype = {
    events:[], // list of available events this class exposes
    subscriptions: ['onPlay', 'onPause', 'onDownloadProgress', 'onPlayTimeUpdate'], //list of event subscriptions this class handles
    dom:{ // dom elements cache
      buttons:{} // cache of control buttons DOM elements
    },
    /**
     * Handle click events on player control buttons
     * @param [String] action the action triggered on the controls
     * @param [DOMElement] btn the button that triggered the action
     * @param [DOMEvent] evt click DOM event on the triggering button
     */
    onControlsClick: function(action, btn, evt){
      this.trigger(action, btn);
    },
    /**
     * onPlay event handler. Changes state of play/pause button to 'pause'
     */
    onPlay: function(){
      this.dom.buttons.play_pause.addClass('pause');
    },
    /**
     * onPause event handler. Changes state of play/pause button to 'play'
     */
    onPause: function(){
      this.dom.buttons.play_pause.removeClass('pause');
    }
  }

  mixin.include(Controls, pubsub);
  return Controls;
});