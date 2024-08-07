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

import test from 'tape'
import {
  MultiPushStream,
  TestStream
} from '../index.js'

test('check MultiPushStream with one downstream', async (t) => {
  try {
    let count = 0
    const data = [
      { plip: 0 },
      { plop: 42 },
      { test: 'this is a long text' },
      { a: 1, b: true, c: [-12, 1, 2, 42], d: {}, e: null }
    ]
    const ins = new TestStream(undefined, undefined, { objectMode: true })
    const out = new TestStream(function (d, e, c) { /* console.log('out', d); */ count++; this.push(d); c() }, undefined, { objectMode: true })
    const res = new TestStream(undefined, undefined, { objectMode: true })

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
      const ps = new MultiPushStream([ins])
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

test('check MultiPushStream with N downstream', async (t) => {
  const N = 5
  try {
    const count = new Array(N).fill(0)
    const data = [
      { plip: 0 },
      { plop: 42 },
      { test: 'this is a long text' },
      { a: 1, b: true, c: [-12, 1, 2, 42], d: {}, e: null }
    ]
    const out = (new Array(N))
      .fill(0) // map do not work on empty Array
      .map((v, i) => new TestStream(function (d, e, c) {
        // console.log(`${i}>`, d)
        t.deepEqual(d, data[count[i]])
        count[i]++
        this.push(d)
        c()
      }, undefined, { objectMode: true }))
    const res = new TestStream(function (d, e, c) {
      // console.log('<', d)
      this.push(d)
      c()
    }, undefined, { objectMode: true })

    out.forEach((s) => s.on('finish', () => t.fail('out should not finish')))

    const ps = new MultiPushStream(out)
    res.pipe(ps)

    for (const d of data) {
      await res.write(d)
    }

    await new Promise((resolve) => {
      ps.on('finish', resolve)
      res.end()
    })

    t.deepEqual(count, new Array(N).fill(data.length))
  } catch (e) {
    t.fail(e.toString())
  } finally {
    t.plan(N * 4 + 1)
    t.end()
  }
})
