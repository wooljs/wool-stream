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

import fs from 'fs'

import test from 'tape'

import {
  StreamStringify,
  TestStream
} from '../index.js'

import { stringify } from 'querystring'

const FILE_SAVE = 'test/test_save.db'

if (fs.existsSync(FILE_SAVE)) fs.unlinkSync(FILE_SAVE)

test('check stream StreamStringify', async (t) => {
  try {
    let count = 0
    const data = [
      { plip: 0 },
      { plop: 42 },
      { test: 'this is a long text' },
      { a: 1, b: true, c: [-12, 1, 2, 42], d: {}, e: null }
    ]
    const expected = [
      '{"plip":0}',
      '{"plop":42}',
      '{"test":"this is a long text"}',
      '{"a":1,"b":true,"c":[-12,1,2,42],"d":{},"e":null}'
    ]
    const ins = new TestStream(undefined, undefined, { objectMode: true })

    ins
      .pipe(new StreamStringify())
      .on('error', function (e) {
        // console.trace(e)
        t.fail(e)
        t.end()
      })
      .pipe(new TestStream(function (data, encoding, callback) {
        t.deepEqual(data.toString(), expected[count])
        count += 1
        this.push(data)
        callback()
      }))

    let i = 0; const l = data.length
    for (; i < l; i += 1) {
      ins.write(data[i])
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

test('check stream StreamStringify with stringifier', async (t) => {
  try {
    let count = 0
    const data = [
      { plip: '0' },
      { plop: '42' },
      { test: 'this is a long text' },
      { a: '1', d: '{}', e: 'null', b: 'true', c: ['-12', '1', '2', '42'] }
    ]
    const expected = [
      'plip=0',
      'plop=42',
      'test=this%20is%20a%20long%20text',
      'a=1&d=%7B%7D&e=null&b=true&c=-12&c=1&c=2&c=42'
    ]
    const ins = new TestStream(undefined, undefined, { objectMode: true })

    ins
      .pipe(new StreamStringify(stringify))
      .on('error', function (e) {
        // console.trace(e)
        t.fail(e)
        t.end()
      })
      .pipe(new TestStream(function (data, encoding, callback) {
        t.deepEqual(data.toString(), expected[count])
        count += 1
        this.push(data)
        callback()
      }))

    let i = 0; const l = data.length
    for (; i < l; i += 1) {
      ins.write(data[i])
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
