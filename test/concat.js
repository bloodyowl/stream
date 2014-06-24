var tape = require("tape")
var stream = require("..")
var concat = require("../lib/concat")

tape("concat", function(test){
  var read = stream.create()
  var result = ""
  read
    .pipe(concat())
    .on("data", function(chunk){
      result += chunk
    })
    .on("end", function(){
      test.equal(result, "123")
      test.end()
    })
  read.write("1")
  read.write("2")
  read.end("3")
})

tape("concat strings", function(test){
  var read = stream.create()
  read
    .pipe(concat())
    .pipe(stream.create(function(value){
      test.equal(value, "123")
      test.end()
    }))
  read.write("1")
  read.write("2")
  read.end("3")
})

tape("concat strings, separator", function(test){
  var read = stream.create()
  read
    .pipe(concat("\n"))
    .pipe(stream.create(function(value){
      test.equal(value, "1\n2\n3")
      test.end()
    }))
  read.write("1")
  read.write("2")
  read.end("3")
})

tape("concat array", function(test){
  var read = stream.create()
  read
    .pipe(concat())
    .pipe(stream.create(function(value){
      test.deepEqual(value, [1, 2, 3, 4, 5, 6])
      test.end()
    }))
  read.write([1])
  read.write([2, 3])
  read.end([4, 5, 6])
})

tape("concat objects", function(test){
  var read = stream.create()
  read
    .pipe(concat())
    .pipe(stream.create(function(value){
      test.deepEqual(value, {foo:"bar", bar:"baz", baz:"foo"})
      test.end()
    }))
  read.write({foo:"foo", bar:"baz"})
  read.write({foo:"bar"})
  read.end({baz:"foo"})
})

tape("concat numbers", function(test){
  var read = stream.create()
  read
    .pipe(concat())
    .pipe(stream.create(function(value){
      test.deepEqual(value, 6)
      test.end()
    }))
  read.write(1)
  read.write(2)
  read.end(3)
})

tape("concat errors", function(test){
  var read = stream.create()
  read
    .pipe(concat())
  read.write(1)
  test.throws(function(){
    read.write([1])
    read.end(3)
  }, "mixed types")
  test.end()
})

tape("concat errors", function(test){
  var read = stream.create()
  read
    .pipe(concat())
  test.throws(function(){
    read.write(/1/)
  }, "unsupported type")
  test.end()
})
