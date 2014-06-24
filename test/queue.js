var tape = require("tape")
var stream = require("..")
var queue = require("../lib/queue")
var concat = require("../lib/concat")

tape("queue", function(test){
  var expected = [1, 2, 3, 4, 5]
  var index = -1
  var s1 = stream.create()
  var s2 = stream.create()
  var s3 = stream.create()
  var s4 = stream.create()

  queue(s1, s2, s3, s4)
    .pipe(stream.create(function(chunk){
      test.equal(chunk, expected[++index])
    }))
    .on("end", function(){
      test.end()
    })

  s2.write(3)
  s1.write(1)
  s4.end(5)
  s2.end()
  s1.write(2)
  s1.end()
  s3.end(4)
})

tape("queue + concat", function(test){
  var index = -1
  var s1 = stream.create()
  var s2 = stream.create()
  var s3 = stream.create()
  var s4 = stream.create()

  queue(s1, s2, s3, s4)
    .pipe(concat())
    .pipe(stream.create(function(chunk){
      test.equal(chunk, "12345")
    }))
    .on("end", function(){
      test.end()
    })

  s2.write("3")
  s1.write("1")
  s4.end("5")
  s2.end()
  s1.write("2")
  s1.end()
  s3.end("4")
})

tape("queue order optimisation", function(test){
  var index = -1
  var s1 = stream.create()
  var s2 = stream.create()
  var s3 = stream.create()


  queue(s1, s2, s3)
    .pipe(concat())
    .on("data", function(chunk){
      test.equal(chunk, "12345")
    })
    .on("end", function(){
      test.end()
    })

  s1.write("1")
  s1.end("2")
  s2.write("3")
  s2.end("4")
  s3.end("5")

})
