# stream

[![Build Status](https://travis-ci.org/bloodyowl/stream.svg)](https://travis-ci.org/bloodyowl/stream)

[![browser support](https://ci.testling.com/bloodyowl/stream.png)
](https://ci.testling.com/bloodyowl/stream)

## install

```sh
$ npm install bloody-stream
```

## require

```javascript
var stream = require("bloody-stream")
var concat = require("bloody-stream/lib/concat")
var queue = require("bloody-stream/lib/queue")
```

## api

### stream

#### `stream.create([fn]) > s`

returns a `s` stream that applies the `fn` transform.

the default `fn` passes what it receives.

##### transform

to pass data, you have to use `this.queue(chunk)`

```javascript
stream.create(function(chunk){
  this.queue("<p>" + chunk + "</p>")
  this.queue("<hr>")
})
```

#### `s.pipe(s2) > s2`

makes `s2` receive `s` data.

#### `s.unpipe([s2]) > s`

if `s2` is specified, makes it stop receiving `s` data.
if not, all piped streams stop receiving it.

#### `s.pause() > s`

holds `s`. all data passed to `s` while it's pause is retained until resume.

#### `s.resume() > s`

passes retained data and stops holding `s`.

#### `s.write(chunk || null)`

writes `chunk` to `s`. if `null` is passed, `s` ends.

#### `s.end([chunk])`

writes `chunk` to `s` if specified. then ends `s`.

### concat

#### `s.pipe(concat([separator]))`

concatenates stream data.

note that `separator` only works for string concat.

e.g.

```javascript
var read = stream.create()
read
  .pipe(concat())
  .on("data", function(chunk){
    console.log(chunk)
  })

read.write("1")
read.write("2")
read.end("3")
// logs "123"
```

#### types

- string : `str1 + (separator || "") + str2`
- array : `arr1.concat(arr2)`
- object : `extend(extend({}, obj1), obj2)`
- number : `num1 + num2`

#### errors

- mixed types raise an error
- unsupported types raise an error

e.g.
```javascript
read
  .pipe(concat())

read.write("1")
read.write(2)
// throws typeError : mixed types
```

```javascript
read
  .pipe(concat())

read.write(/foo/)
// throws typeError : unsupported type
```

### queue

#### `queue(s1, s2, s3 …)`

returns a stream that receives data in the order specified by the arguments.

e.g.

```javascript
var s1 = stream.create()
var s2 = stream.create()
var s3 = stream.create()

queue(s1, s2, s3)
  .on("data", function(chunk){
    console.log(chunk)
  })

s3.end("5")
s2.write("3")
s1.write("1")
s2.end("4")
s1.end("2")

// logs
// "1"
// "2"
// "3"
// "4"
// "5"
```

## example

```javascript
var tildify = stream.create(function(chunk){
  this.queue(chunk.replace(/(streams|so)/g, "~$1~"))
})

var text = stream.create()
var data = ""
text
  .pipe(tildify)
  .pipe(concat("<br>"))
  .on("data", function(chunk){
    document.body.innerHTML = chunk
  })

text.write("so, ")
text.write("how are streams?")
text.end(":)")
```
