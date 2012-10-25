/**
 * Defines a pub/sub object that can be mixed into other classes / objects
 */
define({
  channels: {}, //hash of subscribed channels
  /**
   * Subscribe to event on a channel
   * @param [String] evt name of channel / event to subscribe
   * @param [Function] fn the callback to execute on message publishing
   * @param [Object] ctx the context in which the callback should be executed
   */
  on: function(evt, fn, ctx){
    this.channels[evt] = this.channels[evt] || [];
    this.channels[evt].push({fn: fn, ctx: ctx});
  },
  /**
   * Publish a message on a channel. Accepts **args after event name
   * @param [String] evt name of channel / event to trigger
   */
  trigger: function(evt){
    if(this.channels.hasOwnProperty(evt)){
      var args = Array.prototype.slice.call(arguments, 1);
      this.channels[evt].forEach( function(sub) {
        sub.fn.apply(sub.ctx, args);
      });
    }
  }
});