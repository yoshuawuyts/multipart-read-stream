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
  t.plan(8)

  var server = http.createServer((req, res) => {
    var ws = multipart(req, res, handleFile, (err) => {
      t.error(err, 'done cb: no err')
      res.end()
    })
    pump(req, ws, (err) => t.error(err, 'server pump: no err'))

    function handleFile (field, file, filename, encoding, mimetype) {
      t.equal(filename, 'README.md')
      t.equal(field, 'upload')
      t.equal(encoding, '7bit')
      t.equal(mimetype, 'text/x-markdown')
      var original = fs.readFileSync(filePath, 'utf8')
      file.pipe(concat((buf) => t.equal(String(buf), original)))
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

  var req = http.request(opts, () => server.close())
  var rs = fs.createReadStream(filePath)
  form.append('upload', rs)
  pump(form, req, (err) => t.error(err, 'client pump: no err'))
})
