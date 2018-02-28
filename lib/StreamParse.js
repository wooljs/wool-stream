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
 * StreamParse : a Stream of type Transform that parse incoming string data and pipe out parsed object
 */
class StreamParse extends Transform {
  constructor(parser) {
    super({readableObjectMode:true})
    this.parser=(typeof parser === 'function'? parser : JSON.parse)
  }
  static build(parser) {
    return new StreamParse(parser)
  }
  _transform(data, encoding, callback) {
    try {
      this.push(this.parser(data.toString()))
      callback()
    } catch(e) {
      callback(e)
    }
  }
}
module.exports = StreamParse.build
