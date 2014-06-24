var stream = require("..")
var emptyTypes = {
  string : function(){
    return ""
  },
  array : function(){
    return []
  },
  number : function(){
    return 0
  },
  object : function(){
    return {}
  }
}
var checkTypes = {
  string : function(chunk){
    return typeof chunk == "string"
  },
  number : function(chunk){
    return typeof chunk == "number"
  },
  array : function(chunk){
    return Object.prototype.toString.call(chunk) == "[object Array]"
  },
  object : function(chunk){
    return Object.prototype.toString.call(chunk) == "[object Object]"
  }
}
var concatTypes = {
  string : function(left, right, separator){
    return left + (separator == null ? "" : separator) + right
  },
  number : function(left, right){
    return left + right
  },
  array : function(left, right){
    return left.concat(right)
  },
  object : function(left, right){
    var result = {}
    var key
    for(key in left) {
      if(left.hasOwnProperty(key)) {
        result[key] = left[key]
      }
    }
    for(key in right) {
      if(right.hasOwnProperty(key)) {
        result[key] = right[key]
      }
    }
    return result
  }
}

module.exports = function(separator){
  var result
  var type = null
  var ended = false
  var first = true
  var concat = stream.create(function(chunk){
    var key
    if(first) {
      for(key in checkTypes) {
        if(checkTypes[key](chunk)) {
          type = key
          result = emptyTypes[type]()
          break
        }
      }
      if(type == null) {
        throw new TypeError("unsupported type")
      }
    }
    if(!checkTypes[type](chunk)) {
      throw new TypeError("mixed types")
    }
    result = concatTypes[type](result, chunk, first ? null : separator)
    first = false
  })

  concat.on("end", function(){
    concat.queue(result)
  })
  return concat
}
