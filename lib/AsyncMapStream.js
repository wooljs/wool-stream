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
  , AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
/**
 * AsyncMapStream : a Stream of type Transform that call a mapper on its incoming content to map them
 *
 * mapper : an async function that take an object and return either the same object (identical or modified) or another object to be pushed down the stream
 */
class AsyncMapStream extends Transform {
  constructor(mapper) {
    super({objectMode: true})
    if (!(mapper instanceof AsyncFunction)) throw new Error(mapper+' should be an async function')
    this.mapper = mapper
  }
  static build(mapper) {
    return new AsyncMapStream(mapper)
  }
  async _transform(data, encoding, callback) {
    try {
      data = await this.mapper(data)
      this.push(data)
      callback()
    } catch(e) {
      callback(e)
    }
  }
}

module.exports = AsyncMapStream.build
