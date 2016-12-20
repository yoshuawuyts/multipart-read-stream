const getPort = require('get-server-port')
const FormData = require('form-data')
const concat = require('concat-stream')
const http = require('http')
const path = require('path')
const pump = require('pump')
const test = require('tape')
const fs = require('fs')

const multipart = require('./')

const filePath = path.join(__dirname, 'README.md')

test('should assert input types', function (t) {
  t.plan(8)

  const server = http.createServer((req, res) => {
    const ws = multipart(req, res, handleFile, (err) => {
      t.error(err, 'done cb: no err')
      res.end()
    })
    pump(req, ws, (err) => t.error(err, 'server pump: no err'))

    function handleFile (field, file, filename, encoding, mimetype) {
      t.equal(filename, 'README.md')
      t.equal(field, 'upload')
      t.equal(encoding, '7bit')
      t.equal(mimetype, 'text/x-markdown')
      const original = fs.readFileSync(filePath, 'utf8')
      file.pipe(concat((buf) => t.equal(String(buf), original)))
    }
  })
  server.listen()
  const port = getPort(server)

  // request
  const form = new FormData()
  const opts = {
    protocol: 'http:',
    hostname: 'localhost',
    port: port,
    path: filePath,
    headers: form.getHeaders(),
    method: 'POST'
  }

  const req = http.request(opts, () => server.close())
  const rs = fs.createReadStream(filePath)
  form.append('upload', rs)
  pump(form, req, (err) => t.error(err, 'client pump: no err'))
})
