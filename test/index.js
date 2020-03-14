require('dotenv').config()
const test = require('tape')
const pkg = require('../package.json')

const { read, write } = require('../channel/src/fs')

const channel = require('../channel/')

test('sanity', t => {
  t.ok(true)
  t.end()
})

//
// Note: this will broadcast to your Telegram channel
//

test('pass - channel broadcast', async t => {
  const { err, data } = await channel()
  t.ok(!err)
  t.ok(data)
  t.end()
})

test('pass - read blob storage file', async t => {
  const { err, data } = await read({
    container: 'the-cvd-bot-blob-container',
    filename: 'pkg.json'
  })
  t.ok(!err)
  t.ok(data)
  t.end()
})

test('fail - read blob storage file', async t => {
  const { err, data } = await read({
    container: 'the-cvd-bot-blob-container',
    filename: 'fail.json'
  })
  t.ok(err)
  t.ok(!data)
  t.equals(err.message, 'Unexpected status code: 404')
  t.end()
})

test('pass - write blob storage file pass', async t => {
  const content = JSON.stringify(pkg)
  const { err, data } = await write({
    content,
    container: 'the-cvd-bot-blob-container',
    filename: 'pkg.json'
  })
  t.ok(!err)
  t.ok(data)
  t.end()
})
