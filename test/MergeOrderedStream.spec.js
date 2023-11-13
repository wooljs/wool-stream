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
  , { Readable } = require('stream')
  , { MergeOrderedStream } = require(__dirname + '/../index.js')

test('check stream MergeOrderedStream', async (t) => {
  try {
    const expected = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n']

    const ins1 = Readable.from([
      { n: 1, d: 'a' },
      { n: 2, d: 'b' },
      { n: 4, d: 'e' },
      { n: 5, d: 'f' },
      { n: 6, d: 'g' },
      { n: 7, d: 'j' },
      { n: 9, d: 'm' },
    ])
    const ins2 = Readable.from([
      { n: 2, d: 'c' },
      { n: 3, d: 'd' },
      { n: 6, d: 'h' },
      { n: 6, d: 'i' },
    ])
    const ins3 = Readable.from([
      { n: 7, d: 'k' },
      { n: 8, d: 'l' },
      { n: 9, d: 'n' },
    ])

    const merged = MergeOrderedStream((a, b) => (a.n - b.n), [ins1, ins2, ins3])

    let data
      , count = 0
    while (null !== (data = merged.read())) {
      t.deepEqual(data.d, expected[count])
      count += 1
    }

  } catch (e) {
    t.fail(e.toString())
  } finally {
    t.plan(14)
    t.end()
  }
})