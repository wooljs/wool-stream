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
 * MultiPushStream : a utility Stream to permit to push/pipe in copy towards many Writable streams
 * NB: Like PushStream, we avoid the original streams to be closed by the end of the incoming stream.
 */
export default class MultiPushStream extends Writable {
  /**
   * @param {Array.<Transform|Writable|Duplex>} l
   */
  constructor (l) {
    l.forEach((s) => {
      if (!(s instanceof Writable) && !(s instanceof Duplex) && !(s instanceof Transform)) throw new Error('All streams in param must be a Writable')
    })
    super({ objectMode: true })
    this.l = l
  }

  _write (data, encoding, callback) {
    Promise.all(
      this.l.map((s) => new Promise((resolve) => {
        s.write(data, encoding, resolve)
      }))
    ).then(() => callback())
    return true
  }
}
