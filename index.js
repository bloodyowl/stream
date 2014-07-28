var events = require("bloody-events")

module.exports = events.extend({
  constructor : function(fn){
    events.constructor.call(this)
    this._pauseBuffer = []
    if(typeof fn == "function") {
      this._transform = fn
    }
  },
  destructor : function(){
    events.destructor.call(this)
    this._pauseBuffer.length = 0
  },
  pipe : function(stream){
    stream.emit("pipe", this)
    this.on("data:pipe", stream.accessor("write"))
    this.on("end", stream.accessor("end"))
    return stream
  },
  unpipe : function(stream){
    if(stream != null) {
      stream.emit("pipe", this)
      this.off("data:pipe", stream.accessor("write"))
      this.off("end", stream.accessor("end"))
      return this
    }
    this.off("data:pipe")
    return this
  },
  write : function(chunk){
    if(this._ended) {
      return
    }
    if(chunk == null) {
      this.emit("end")
      this._ended = true
      return
    }
    this._transform(chunk)
    return this
  },
  pause : function(){
    this.write = function(chunk){
      this._pauseBuffer.push(chunk)
    }
    return this
  },
  resume : function(){
    var item
    delete this.write
    while(item = this._pauseBuffer.shift()) {
      this.write(item)
    }
    return this
  },
  end : function(chunk){
    if(chunk != null) {
      this.write(chunk)
    }
    this.write(null)
  },
  queue : function(chunk){
    this.emit("data", chunk)
    this.emit("data:pipe", chunk)
  },
  _transform : function(chunk){
    this.queue(chunk)
  }
})
