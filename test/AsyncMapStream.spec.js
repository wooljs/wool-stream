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

import test from 'tape'
import {
  AsyncMapStream,
  TestStream
} from '../index.js'

test('check stream AsyncMapStream', async (t) => {
  try {
    let count = 0
    let index = 0

    const ins = new TestStream(undefined, undefined, { objectMode: true })
    const data = [
      { plip: 0 },
      { plop: 42 },
      { test: 'this is a long text' },
      { a: 1, b: true, c: [-12, 1, 2, 42], d: {}, e: null }
    ]
    const expected = [
      { plip: 0, test: 0 },
      { plop: 42, test: 1 },
      { test: 2 },
      { a: 1, b: true, c: [-12, 1, 2, 42], d: {}, e: null, test: 3 }
    ]

    await ins
      .pipe(new AsyncMapStream(async (o) => { o.test = index; index += 1; return o }))
      .on('error', function (e) {
        // console.trace(e)
        t.fail(e)
        t.end()
      })
      .pipe(new TestStream(function (data, encoding, callback) {
        t.deepEqual(data, expected[count])
        count += 1
        this.push(data)
        callback()
      }, undefined, { objectMode: true }))
      .on('error', function (e) {
        // console.trace(e)
        t.fail(e)
        t.end()
      })

    let i = 0; const l = data.length
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

test('check error AsyncMapStream', async (t) => {
  try {
    t.throws(() => new AsyncMapStream(() => {}), 'should throw for non async')

    const ins = new TestStream(undefined, undefined, { objectMode: true })
    let hasError = false

    await new Promise((resolve) => {
      ins
        .pipe(new AsyncMapStream(async () => { throw new Error('It\'s me!') }))
        .on('error', (e) => {
          t.deepEqual(e.message, 'It\'s me!')
          hasError = true
          resolve()
        })
        .on('finish', () => {
          if (!hasError) t.fail('should not finish')
          resolve()
        })
        .end('plop') // 'plop' is send data before end
    })
  } catch (e) {
    t.fail(e.toString())
  } finally {
    t.plan(2)
    t.end()
  }
})
