var getPort = require('get-server-port')
var FormData = require('form-data')
var concat = require('concat-stream')
var http = require('http')
var path = require('path')
var pump = require('pump')
var test = require('tape')
var fs = require('fs')

var multipart = require('./')

var filePath = path.join(__dirname, 'README.md')

test('should assert input types', function (t) {
  t.plan(3)
  t.throws(multipart.bind(null), /object/)
  t.throws(multipart.bind(null, {}), /function/)
  t.throws(multipart.bind(null, {}, 123, function () {}), /object/)
})

test('should parse forms', function (t) {
  t.plan(7)

  var server = http.createServer(function (req, res) {
    var multipartStream = multipart(req.headers, handler)
    pump(req, multipartStream, function (err) {
      t.ifError(err, 'no error')
      res.end()
    })

    function handler (field, file, filename, encoding, mimetype) {
      t.equal(filename, 'README.md')
      t.equal(field, 'upload')
      t.equal(encoding, '7bit')
      t.equal(mimetype, 'text/x-markdown')
      var original = fs.readFileSync(filePath, 'utf8')
      file.pipe(concat(function (buf) {
        t.equal(String(buf), original)
      }))
    }
  })
  server.listen()
  var port = getPort(server)

  // request
  var form = new FormData()
  var opts = {
    protocol: 'http:',
    hostname: 'localhost',
    port: port,
    path: filePath,
    headers: form.getHeaders(),
    method: 'POST'
  }

  var req = http.request(opts, server.close.bind(server))
  var rs = fs.createReadStream(filePath)
  form.append('upload', rs)
  pump(form, req, function (err) {
    t.error(err, 'client pump: no err')
  })
})
