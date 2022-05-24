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
  , TestStream = require( __dirname + '/test-stream.js')
  , { StreamJoin } = require( __dirname + '/../index.js')

test('check stream StreamJoin with default separator', async (t) => {
  var count = 0
    , data = [
      '{"plip": 0}',
      '{"plop": 42}',
      '{"test": "this is a long text"}',
      '{"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null}'
    ]
    , expected = [
      '{"plip": 0}',
      '\n',
      '{"plop": 42}',
      '\n',
      '{"test": "this is a long text"}',
      '\n',
      '{"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null}',
      '\n'
    ]
    , ins = TestStream()

  ins
  .pipe(StreamJoin())
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
  }, undefined, {objectMode: true}))
  .on('finish', function () {
    t.deepEqual(count, 8)
    t.end()
  })

  var i = 0, l = data.length
  for(; i < l; i+=1) {
    ins.write(data[i])
  }
  await ins.end()
})
