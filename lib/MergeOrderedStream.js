/*
 * Copyright 2023 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

const { Readable, Duplex, Transform } = require('stream')

/**
 * MergeSortStream : a Stream of type Readable that merge multiple incoming readable streams of ordered data and merge them as one stream, while maintaining order (through a compare function)
 */
class MergeOrderedStream extends Readable {
  constructor(compare, l, asc = true) {
    l.forEach((s) => {
      if (!(s instanceof Readable) && !(s instanceof Duplex) && !(s instanceof Transform)) throw new Error('All streams in param must be a Readable')
    })
    super({ objectMode: true })
    this.compare = compare
    this.l = l.map(s => ({ s, p: undefined, c: false }))
    this.asc = asc
  }
  static build(compare, l) {
    return new MergeOrderedStream(compare, l)
  }
  _read() {
    try {
      const order = this.asc ? 1 : -1
      let next
      this.l.forEach(x => {
        if (!x.c) {
          if (typeof x.p === 'undefined') {
            x.p = x.s.read()
            if (x.p === null) {
              x.c = true
              return // we do not want a null value to assign to next or to compare with
            }
          }
          if (typeof next === 'undefined' || order* this.compare(x.p, next.p) < 0) {
            next = x
          }
        }
      })
      if (typeof next !== 'undefined') {
        this.push(next.p)
        next.p = undefined
      } else {
        this.push(null)
      }
    } catch (e) {
      this.destroy(e)
    }
  }
}
module.exports = MergeOrderedStream.build
