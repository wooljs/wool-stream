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

var test = require('tape')
  , TestStream = require( __dirname + '/test-stream.js')
  , ws = require( __dirname + '/../index.js')

test('check stream EventCount', function(t) {
  var count = 0
    , events = [
      ws.Event(new Date('2017-02-10T12:43:40.247Z'), 0, 'plop', {plop: 42}),
      ws.Event(new Date('2017-02-10T12:43:41.247Z'), 255, 'plip', {'plip': {plouf: 'plaf'}}),
      ws.Event(new Date('2017-02-10T12:43:42.247Z'), 256, 'XX', {'test': 'this is a long text'}),
      ws.Event(new Date('2017-02-10T12:43:43.247Z'), 0, 'foobar', {plop: 42})
    ]
    , ins = TestStream(null, null, {objectMode: true})
    , evc = ws.EventCount()
  ins
  .pipe(evc)
  .on('error', function (e) {
    //console.trace(e)
    t.fail(e)
    t.end()
  })
  .pipe(TestStream(function (data, encoding, callback) {
    t.deepEqual(data, events[count])
    count += 1
    this.push(data)
    callback()
  }, undefined, {objectMode: true}))
  .on('finish', function () {
    t.deepEqual(evc.count(), 4)
    t.deepEqual(count, 4)
    t.end()
  })

  var i = 0, l = events.length
  for(; i < l; i+=1) {
    ins.write(events[i])
  }
  ins.end()
})
