const assert = require('assert')
const Busboy = require('busboy')
const stream = require('stream')
const xtend = require('xtend')
const pump = require('pump')

module.exports = downloadMultipart

// download a multipart request
// (req, res, obj?, fn, fn) -> tstream
function downloadMultipart (req, res, opts, handle, cb) {
  if (!cb) {
    handle = opts
    cb = handle
    opts = {}
  }
  opts = xtend({ headers: req.headers }, opts)

  assert.equal(typeof req, 'object', 'multipart-stream: req should be an object')
  assert.equal(typeof res, 'object', 'multipart-stream: res should be an object')
  assert.equal(typeof opts, 'object', 'multipart-stream: opts should be an object')
  assert.equal(typeof handle, 'function', 'multipart-stream: handle should be a function')
  assert.equal(typeof cb, 'function', 'multipart-stream: cb should be a function')

  try {
    var busboy = new Busboy(opts)
  } catch (e) {
    cb(e)
    // TODO(yw): destroy stream to signal prior streams to stop
    const pts = new stream.PassThrough()
    return pts
  }

  busboy.on('file', handle)

  const pts = new stream.PassThrough()
  pump(pts, busboy, cb)
  return pts
}
