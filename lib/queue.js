var stream = require("..")
var concat = require("./concat")

function each(array, fn) {
  var index = -1
  var length = array.length
  while(++index < length) {
    if(fn(array[index], index, array) == false) {
      break
    }
  }
}

module.exports = function(){
  var length = arguments.length
  var ended = Array(length)
  var passed = Array(length)
  var values = Array(length)
  var endStream = stream.create()
  each(values, function(item, index){
    values[index] = []
  })
  each(arguments, function(item, index){
    if(typeof item == "function") {
      item = item()
    }
    if(item == null || typeof item.pipe != "function") {
      throw new TypeError()
    }
    item
      .on("data", function(chunk){
        if(index == 0 || passed[index - 1]) {
          endStream.write(chunk)
          return
        }
        values[index].push(chunk)
      })
      .on("end", function(){
        var before = -1
        ended[index] = true
        while(++before < index) {
          if(!passed[before]) {
            return
          }
        }
        each(values[index], function(value){
          endStream.write(value)
        })
        passed[index] = 1
        var after = index
        while(++after < length) {
          if(!ended[after]) {
            break
          }
          each(values[after], function(value){
            endStream.write(value)
          })
          passed[after] = 1
          if(after == length - 1) {
            endStream.end()
          }
        }
        if(index == length - 1 && passed[index]) {
          endStream.end()
        }
      })
  })
  return endStream
}
