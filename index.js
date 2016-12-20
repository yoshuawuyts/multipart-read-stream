const eos = require('end-of-stream')
const assert = require('assert')
const pez = require('pez')
const content = require('content')
const xtend = require('xtend')

module.exports = downloadMultipart

// download a multipart request
// (req, res, obj?, fn, fn) -> tstream
function downloadMultipart (req, opts, handle, cb) {
  if (!cb) {
    cb = handle
    handle = opts
    opts = {}
  }
  opts = xtend(content.type(req.headers['content-type']), opts)

  assert.equal(typeof req, 'object', 'multipart-stream: req should be an object')
  assert.equal(typeof opts, 'object', 'multipart-stream: opts should be an object')
  assert.equal(typeof handle, 'function', 'multipart-stream: handle should be a function')
  assert.equal(typeof cb, 'function', 'multipart-stream: cb should be a function')

  var dispenser = new pez.Dispenser(opts)

  dispenser.on('part', function (part) {
    var encoding = part.headers['content-transfer-encoding']
    encoding = encoding ? encoding.toLowerCase() : '7bit'
    handle(part.name, part, part.filename, encoding, part.headers['content-type'])
  })

  eos(dispenser, cb)
  return dispenser
}
