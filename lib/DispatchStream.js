/*
 * Copyright 2022 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { Transform, Writable, Duplex } from 'stream'

/**
 * DispatchStream : a Stream of type Writable that dispatch incoming object data to different target streams, according to given filters
 */
export default class DispatchStream extends Writable {
  /**
   * @param {Array.<[(x: any) => boolean, s: Transform|Writable|Duplex]>} filterStream
   */
  constructor (filterStream) {
    super({ objectMode: true, decodeStrings: false })
    this.fs = filterStream
    filterStream.forEach(([f, s]) => {
      if (typeof f !== 'function') {
        throw new Error(`Given filter must be a function [${JSON.stringify(f)}, ${JSON.stringify(s)}]`)
      }
      if (!(s instanceof Writable) && !(s instanceof Duplex) && !(s instanceof Transform)) {
        throw new Error(`Given stream must be a Writable [${f.toString()}, ${JSON.stringify(s)}]`)
      }
    })
    this.on('finish', () => {
      this.fs.forEach(([, s]) => {
        s.end()
      })
    })
  }

  _write (data, encoding, callback) {
    for (let i = 0, l = this.fs.length; i < l; i++) {
      const [f, s] = this.fs[i]
      if (f(data)) {
        // the filter matched, stream is found
        return s.write(data, encoding, callback)
      }
    }
    callback()
    return true
  }
}
