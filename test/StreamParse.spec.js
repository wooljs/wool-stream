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
  , querystring = require('querystring')
  , TestStream = require(__dirname + '/test-stream.js')
  , { StreamParse } = require(__dirname + '/../index.js')

test('check stream StreamParse', async (t) => {
  try {
    var count = 0
      , data = [
        '{"plip": 0}',
        '{"plop": 42}',
        '{"test": "this is a long text"}',
        '{"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null}'
      ]
      , expected = [
        { plip: 0 },
        { plop: 42 },
        { 'test': 'this is a long text' },
        { 'a': 1, 'd': {}, 'e': null, 'b': true, 'c': [-12, 1, 2, 42] }
      ]
      , ins = TestStream()

    await ins
      .pipe(StreamParse())
      .on('error', function (e) {
        //console.trace(e)
        t.fail(e)
        t.end()
      })
      .pipe(TestStream(function (data, encoding, callback) {
        t.deepEqual(data, expected[count])
        count += 1
        this.push(data)
        callback()
      }, undefined, { objectMode: true }))

    var i = 0, l = data.length
    for (; i < l; i += 1) {
      await ins.write(data[i])
    }
    await ins.end()
    t.deepEqual(count, 4)

  } catch (e) {
    t.fail(e.toString())
  } finally {
    t.plan(5)
    t.end()
  }
})

test('check stream StreamParse with parser', async (t) => {
  try {
    var count = 0
      , data = [
        'plip=0',
        'plop=42',
        'test=this is a long text',
        'a=1&b=true&c=-12&c=1&c=2&c=42&d={}&e=null'
      ]
      , expected = [
        { plip: '0' },
        { plop: '42' },
        { 'test': 'this is a long text' },
        { 'a': '1', 'd': '{}', 'e': 'null', 'b': 'true', 'c': ['-12', '1', '2', '42'] }
      ]
      , ins = TestStream()
      , parser = (s) => Object.assign({}, querystring.parse(s))

    await ins
      .pipe(StreamParse(parser))
      .on('error', function (e) {
        //console.trace(e)
        t.fail(e)
        t.end()
      })
      .pipe(TestStream(function (data, encoding, callback) {
        t.deepEqual(data, expected[count])
        count += 1
        this.push(data)
        callback()
      }, undefined, { objectMode: true }))

    var i = 0, l = data.length
    for (; i < l; i += 1) {
      await ins.write(data[i])
    }
    await ins.end()

    t.deepEqual(count, 4)

  } catch (e) {
    t.fail(e.toString())
  } finally {
    t.plan(5)
    t.end()
  }
})
