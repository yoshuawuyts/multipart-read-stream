const test = require('tape')
const multipartReadStream = require('./')

test('should assert input types', function (t) {
  t.plan(1)
  t.throws(multipartReadStream)
})
