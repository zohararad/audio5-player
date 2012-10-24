define({
  channels: {},
  on: function(evt, fn, ctx){
    this.channels[evt] = this.channels[evt] || [];
    this.channels[evt].push({fn: fn, ctx: ctx});
  },
  trigger: function(evt){
    if(this.channels.hasOwnProperty(evt)){
      var args = Array.prototype.slice.call(arguments, 1);
      this.channels[evt].forEach( function(sub) {
        sub.fn.apply(sub.ctx, args);
      });
    }
  }
});