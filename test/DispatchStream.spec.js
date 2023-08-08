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

const test = require('tape')
  , { DispatchStream } = require(__dirname + '/../index.js')
  , TestStream = require(__dirname + '/test-stream.js')

test('check DispatchStream with filters', async (t) => {
  try {
    const data = [
      { plip: 0 },
      { plop: 42 },
      { test: 'this is a long text' },
      { a: 1, b: true, c: [-12, 1, 2, 42], d: {}, e: null },
    ]
    const expected = [
      ['out3', { plip: 0 }],
      ['out1', { plop: 42 }],
      ['out2', { test: 'this is a long text' }],
      ['out3', { a: 1, b: true, c: [-12, 1, 2, 42], d: {}, e: null }],
    ]

    let count = 0

    const checkFor = (target) => function (data, encoding, callback) {
      // console.log('check', target, count, data)
      const [x, v] = expected[count]
      t.deepEqual(target, x)
      t.deepEqual(data, v)
      count += 1
      this.push(data)
      callback()
    }

    const out1 = TestStream(checkFor('out1'), undefined, { objectMode: true, decodeStrings: false })
      , out2 = TestStream(checkFor('out2'), undefined, { objectMode: true, decodeStrings: false })
      , out3 = TestStream(checkFor('out3'), undefined, { objectMode: true, decodeStrings: false })

    const ds = DispatchStream([
      [(x) => 'plop' in x, out1],
      [(x) => typeof x.test === 'string', out2],
      [() => true, out3], // default
    ])

    for (let x of data) {
      await ds.write(x)
    }

    const prom = [out1, out2, out3].map((out) => new Promise((resolve) => {
      out.on('finish', () => {
        resolve()
      })
    }))

    await new Promise((r) => ds.end(r))

    await Promise.all(prom)

  } catch (e) {
    t.fail(e.toString())
  } finally {
    t.plan(8)
    t.end()
  }
})