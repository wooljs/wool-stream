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

const {Writable, Duplex, Transform} = require('stream')

/**
 * PushStream : a utility Stream to permit to push/pipe in an ready piped stream. It permits to avoid the original stream to be closed by the end of the new incoming stream.
 */
class PushStream extends Writable {
  constructor(s) {
    if (!(s instanceof Writable) && !(s instanceof Duplex) && !(s instanceof Transform)) throw new Error('Given stream must be a Writable')
    super({objectMode: true})
    this.s = s
  }
  static build(s) {
    return new PushStream(s)
  }
  _write(data, encoding, callback) {
    this.s.write(data, encoding, callback)
  }
}
module.exports = PushStream.build

