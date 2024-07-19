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

import { Transform } from 'stream'

/**
 * StreamStringify : a Stream of type Transform that stringify incoming object data an pipe out stringified object
 */
export default class StreamStringify extends Transform {
  /**
   * @param {(src: object) => string} stringifier
   */
  constructor (stringifier) {
    super({ objectMode: true })
    this.stringifier = (typeof stringifier === 'function' ? stringifier : JSON.stringify)
  }

  _transform (data, encoding, callback) {
    try {
      this.push(this.stringifier(data))
      callback()
    } catch (e) {
      callback(e)
    }
  }
}
