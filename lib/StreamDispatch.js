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

const {Transform} = require('stream')

/**
 * StreamDispatch : a Stream of type Transform that call a dispatcher on its incoming content
 *
 * dispatcher : a function that take an object and eventually return an object or modify it. If an object is provided it will be piped out
 */
class StreamDispatch extends Transform {
  constructor(dispatcher) {
    super({objectMode: true})
    if (typeof dispatcher !== 'function') throw new Error('param should be a function')
    this.dispatcher = dispatcher
  }
  static build(dispatcher) {
    return new StreamDispatch(dispatcher)
  }
  _transform(data, encoding, callback) {
    try {
      this.dispatcher(data, function(err, res) {
        try {
          if (err) return callback(err)
          if (typeof res !== 'undefined') {
            data.d = res
          }
          this.push(data)
          callback()
        } catch(e) {
          callback(e)
        }
      }.bind(this))
    } catch(e) {
      callback(e)
    }
  }
}

module.exports = StreamDispatch.build
