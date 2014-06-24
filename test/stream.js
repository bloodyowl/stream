var tape = require("tape")
var stream = require("..")

tape("stream", function(test){
  test.plan(3)
  var read = stream.create()
  var expected = ["1", "2", "3"]
  var index = -1
  read
    .on("data", function(chunk){
      test.equal(chunk, expected[++index])
    })
    .on("end", function(){
      test.end()
    })
  read.write("1")
  read.write("2")
  setTimeout(function(){
    read.end("3")
  }, 50)
})

tape("stream transform method", function(test){
  test.plan(6)
  var read = stream
    .create(function(chunk){
      this.queue(chunk)
      this.queue(chunk)
    })
  var expected = ["1", "1", "2", "2", "3", "3"]
  var index = -1
  read
    .on("data", function(chunk){
      test.equal(chunk, expected[++index])
    })
    .on("end", function(){
      test.end()
    })
  read.write("1")
  read.write("2")
  setTimeout(function(){
    read.end("3")
  }, 50)
})

tape("stream pause/resume", function(test){
  test.plan(3)
  var read = stream.create()
  var expected = ["1", "2", "3"]
  var index = -1
  read
    .on("data", function(chunk){
      test.equal(chunk, expected[++index])
    })
    .on("end", function(){
      test.end()
    })
  read.write("1")
  read.pause()
  read.write("2")
  setTimeout(function(){
    read.end("3")
  }, 50)
  setTimeout(function(){
    read.resume()
  }, 100)
})

tape("stream pipe", function(test){
  test.plan(6)
  var read = stream.create()
  var expected = [1, 2, 3]
  var expectedAfterTransform = [2, 4, 6]
  var index = -1
  var indexAfterTransform = -1
  read
    .pipe(stream.create(function(chunk){
      test.equal(chunk, expected[++index])
      this.queue(chunk * 2)
    }))
    .pipe(stream.create(function(chunk){
      test.equal(chunk, expectedAfterTransform[++indexAfterTransform])
    }))
    .on("end", function(){
      test.end()
    })
  read.write(1)
  read.write(2)
  setTimeout(function(){
    read.end(3)
  }, 50)
})

tape("stream unpipe", function(test){
  test.plan(1)
  var read = stream.create()
  var expected = [1, 2, 3]
  var index = -1
  read
    .pipe(stream.create(function(chunk){
      test.equal(chunk, expected[++index])
      read.unpipe(this)
    }))
  read.write(1)
  read.end(2)
})

tape("stream unpipe all", function(test){
  test.plan(2)
  var read = stream.create()
  var expected = [1, 2, 3]
  var index = -1
  var index2 = -1
  read
    .pipe(stream.create(function(chunk){
      test.equal(chunk, expected[++index])
    }))
  read
    .pipe(stream.create(function(chunk){
      test.equal(chunk, expected[++index2])
      read.unpipe()
    }))
  read.write(1)
  read.end(2)
})

tape("stream end propagation", function(test){
  var read = stream.create()
  var expected = [1, 2, 3]
  var index = -1
  var index2 = -1
  var data = []
  read
    .pipe(stream.create(function(chunk){
      data.push(chunk)
    }))
    .on("end", function(){
      test.deepEqual(data, expected)
      test.end()
    })
  read.write(1)
  read.write(2)
  read.end(3)
})
