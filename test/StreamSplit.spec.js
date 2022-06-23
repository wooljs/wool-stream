/*
 * Copyright 2014 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

'use strict'

var test = require('tape-async')
  , fs = require('fs')
  , TestStream = require(__dirname + '/test-stream.js')
  , { StreamSplit } = require(__dirname + '/../index.js')
  , file_load = __dirname + '/test_load.db'

test('check stream StreamSplit with default separator', async (t) => {
  try {
    var count = 0
      , expected = [
        '{"plip": 0}',
        '{"plop": 42}',
        '{"test": "this is a long text"}',
        '{"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null}'
      ]

    await new Promise((resolve) =>
      fs.createReadStream(file_load, { flags: 'r' })
        .on('end', resolve)
        .pipe(StreamSplit())
        .on('error', function (e) {
          //console.trace(e)
          t.fail(e)
          t.end()
        })
        .pipe(TestStream(function (data, encoding, callback) {
          t.deepEqual(data.toString(), expected[count])
          count += 1
          this.push(data)
          callback()
        }))
    )

    t.deepEqual(count, 4)

  } catch (e) {
    t.fail(e.toString())
  } finally {
    t.plan(5)
    t.end()
  }
})

test('check stream StreamSplit with given one character separator', async (t) => {
  try {
    var count = 0
      , input = 'a|b|42|a long string| a SHORTER| plouf'
      , expected = [
        'a', 'b', '42', 'a long string', ' a SHORTER', ' plouf'
      ]
      , ins = TestStream()

    ins
      .pipe(StreamSplit('|'))
      .on('error', function (e) {
        //console.trace(e)
        t.fail(e)
        t.end()
      })
      .pipe(TestStream(function (data, encoding, callback) {
        t.deepEqual(data.toString(), expected[count])
        count += 1
        this.push(data)
        callback()
      }))

    await ins.end(input)
    t.deepEqual(count, 5)

  } catch (e) {
    t.fail(e.toString())
  } finally {
    t.plan(6)
    t.end()
  }
})

test('check stream StreamSplit with given many character separator', async (t) => {
  try {
    var count = 0
      , input = 'a long string<br> a SHORTER<br>a<br>b<br>42<br> plouf'
      , expected = [
        'a long string', ' a SHORTER', 'a', 'b', '42', ' plouf'
      ]
      , ins = TestStream()

    ins
      .pipe(StreamSplit('<br>'))
      .on('error', function (e) {
        //console.trace(e)
        t.fail(e)
        t.end()
      })
      .pipe(TestStream(function (data, encoding, callback) {
        t.deepEqual(data.toString(), expected[count])
        count += 1
        this.push(data)
        callback()
      }))

    await ins.end(input)
    t.deepEqual(count, 5)

  } catch (e) {
    t.fail(e.toString())
  } finally {
    t.plan(6)
    t.end()
  }
})
