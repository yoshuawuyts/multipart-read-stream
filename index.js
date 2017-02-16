var content = require('content')
var assert = require('assert')
var xtend = require('xtend')
var pez = require('pez')

module.exports = downloadMultipart

// Download a multipart request
// (obj, [obj], fn) -> transformStream
function downloadMultipart (headers, opts, handle) {
  if (!handle) {
    handle = opts
    opts = {}
  }

  assert.equal(typeof headers, 'object', 'multipart-stream: headers should be an object')
  assert.equal(typeof opts, 'object', 'multipart-stream: opts should be an object')
  assert.equal(typeof handle, 'function', 'multipart-stream: handle should be a function')

  opts = xtend(content.type(headers['content-type']), opts)
  var dispenser = new pez.Dispenser(opts)

  dispenser.on('part', function (part) {
    var encoding = part.headers['content-transfer-encoding']
    encoding = (encoding) ? encoding.toLowerCase() : '7bit'

    handle(part.name, part, part.filename, encoding, part.headers['content-type'])
  })

  return dispenser
}
