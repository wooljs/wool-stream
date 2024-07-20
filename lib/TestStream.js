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

import stream, { Transform } from 'stream'

export default class TestStream extends Transform {
  constructor (tf, fl, options) {
    super()
    this.tf = tf
    this.fl = fl
    options = options || { encoding: 'utf8' }
    stream.Transform.call(this, options)
  }

  _transform = function (data, encoding, callback) {
    if (typeof this.tf === 'function') {
      try {
        return this.tf(data, encoding, callback)
      } catch (e) {
        callback(e)
      }
    } else {
      try {
        this.push(data)
        callback()
      } catch (e) {
        callback(e)
      }
    }
  }

  _flush = function (callback) {
    if (typeof this.fl === 'function') this.fl(callback)
    else callback()
  }
}
