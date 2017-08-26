/*
 * Copyright 2017 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

module.exports = (function() {
  'use strict'
  var stream = require('stream')
    , util = require('util')

  /**
   * EventCount : a Stream of type Transform that parse incoming string data and pipe out parsed object
   */
  function EventCount() {
    if (!(this instanceof EventCount)) return new EventCount()
    stream.Transform.call(this, {objectMode: true})
    this._count = 0
  }
  util.inherits(EventCount, stream.Transform)
  EventCount.prototype._transform = function (data, encoding, callback) {
    try {
      this.push(data)
      this._count += 1
      callback()
    } catch(e) {
      callback(e)
    }
  }
  EventCount.prototype.count = function () {
    return this._count
  }
  EventCount.prototype.reset = function (i) {
    this._count = i || 0
  }
  return EventCount
}())
