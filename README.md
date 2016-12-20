# multipart-read-stream [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Read a multipart stream over HTTP. Built on top of [pez][pez].

## Usage
```js
const mp = require('multipart-read-stream')
const http = require('http')

http.createServer((req, res) => {
  const rs = mp(req, res, fileHandler, (err) => {
    if (err) res.end('server error')
    res.end()
  })
  req.pipe(rs)

  function fileHandler (fieldname, file, filename) {
    console.log(`reading file ${filename} from field ${fieldname}`)
    file.pipe(process.stdout)
  }
})
```

## API
### readableStream = multipart(req, res, fileHandler, options?, done)
Create a new multipart stream handler. Takes the following arguments:
- __req:__ HTTP `request` type
- __res:__ HTTP `response` type
- __filehandler(fieldname, file, filename, encoding, mimetype):__ handle a
  file. Each `file` is a `readableStream`
- __options:__ an object that is passed directly to [pez][pez]
- __done:__ callback that is called on error or when all data has been parsed

### Events

multipart-read-stream returns an instance (from `pez.Dispenser`) which 
emits a number of multipart specific events:

#### readableStream.on('part', cb(stream))

The `part` event drives the `fileHandler` callback for the main API. 
The difference is it supplies a single parameter, the read stream of the
file data of a multipart section.

#### readableStream.on('field', cb(name, value))

A field event is emitted for partitions containing key-value data 
(instead of file data).

#### readableStream.on('preamble', cb(str))

Multipart data *may* have a preamble section, which is typically
ignored by parsers. However it's sometimes used as an area to 
contain hints/meta information.

#### readableStream.on('epilogue', cb(str))

As with the preamble section, the epilogue section essentially
has the same role (ignored, but can be used for meta data), except
it will be parsed after the body rather than before.

## Installation
```sh
$ npm install --save multipart-read-stream
```

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/multipart-read-stream.svg?style=flat-square
[3]: https://npmjs.org/package/multipart-read-stream
[4]: https://img.shields.io/travis/yoshuawuyts/multipart-read-stream/master.svg?style=flat-square
[5]: https://travis-ci.org/yoshuawuyts/multipart-read-stream
[6]: https://img.shields.io/codecov/c/github/yoshuawuyts/multipart-read-stream/master.svg?style=flat-square
[7]: https://codecov.io/github/yoshuawuyts/multipart-read-stream
[8]: http://img.shields.io/npm/dm/multipart-read-stream.svg?style=flat-square
[9]: https://npmjs.org/package/multipart-read-stream
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
[pez]: https://github.com/hapijs/pez
