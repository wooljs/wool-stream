/*
 * Copyright 2018 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

'use strict'

const test = require('tape-async')
  , TestStream = require(__dirname + '/test-stream.js')
  , { PushStream } = require(__dirname + '/../index.js')

test('check stream PushStream', async (t) => {
  try {
    var count = 0
      , data = [
        { plip: 0 },
        { plop: 42 },
        { 'test': 'this is a long text' },
        { 'a': 1, 'b': true, 'c': [-12, 1, 2, 42], 'd': {}, 'e': null }
      ]
      , ins = TestStream(undefined, undefined, { objectMode: true })
      , out = TestStream(function (d, e, c) { /*console.log('out', d);*/ count++; this.push(d); c() }, undefined, { objectMode: true })
      , res = TestStream(undefined, undefined, { objectMode: true })

    ins.on('finish', () => t.fail('ins should not finish'))
    out.on('finish', () => t.fail('out should not finish'))


    await ins.pipe(out)

    for (const d of data) {
      await ins.write(d)
    }

    t.deepEqual(count, data.length)

    for (const d of data) {
      await res.write(d)
    }

    await new Promise(resolve => {
      var ps = PushStream(ins)
      ps.on('finish', resolve)
      res.pipe(ps)
      res.end()
    })
    t.deepEqual(count, data.length * 2)

    for (const d of data) {
      // console.log('iter ins', d)
      await ins.write(d)
    }

    t.deepEqual(count, data.length * 3)
  } catch (e) {
    t.fail(e.toString())
  } finally {
    t.plan(3)
    t.end()
  }
})
