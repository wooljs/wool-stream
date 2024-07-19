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
import fs from 'fs'
import {
  CountStream,
  StreamSplit,
  StreamParse,
  AsyncMapStream,
  StreamStringify,
  StreamJoin
} from '../index.js'

const FILE_LOAD = 'test/test_load.db'
const FILE_SAVE = 'test/test_save.db'

if (fs.existsSync(FILE_SAVE)) fs.unlinkSync(FILE_SAVE)

test('check stream all piped together', async function (t) {
  try {
    let count = 0
    const onError = function (e) {
      // console.trace(e)
      t.fail(e)
      t.end()
    }
    const countStream = new CountStream()

    await new Promise(resolve => {
      fs.createReadStream(FILE_LOAD, { flags: 'r' })
        .pipe(new StreamSplit().on('error', onError))
        .pipe(new StreamParse().on('error', onError))
        .pipe(countStream.on('error', onError))
        .pipe(new AsyncMapStream(async function (o) { count += 1; return o }).on('error', onError))
        .on('error', onError)
        .on('finish', () => resolve())
    })

    t.deepEqual(countStream.count(), 4)

    const es = new AsyncMapStream(async function (o) { count += 1; return o })
    const ss = fs.createWriteStream(FILE_SAVE, { flags: 'a' })
    const date = new Date()

    es
      .pipe(new StreamStringify().on('error', onError))
      .pipe(new StreamJoin().on('error', onError))
      .pipe(ss)
      .on('error', onError)

    await new Promise(resolve => {
      ss.on('close', () => resolve())

      es.write({ yo: 'yeah' })
      es.write(42)
      es.write('paf')
      es.write({ 'this is the end': date.toISOString() })
      es.end()
    })

    t.deepEqual(count, 8)

    await new Promise(resolve => {
      fs.readFile(FILE_SAVE, { encoding: 'utf8' }, function (err, data) {
        if (err) throw err

        t.deepEqual(data, '{"yo":"yeah"}\n42\n"paf"\n{"this is the end":"' + date.toISOString() + '"}\n')

        fs.unlink(FILE_SAVE, function (err) {
          if (err) throw err
          resolve()
        })
      })
    })
  } catch (e) {
    t.fail(e.toString())
  } finally {
    t.plan(3)
    t.end()
  }
})
