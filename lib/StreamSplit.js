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

module.exports = (function() {
  'use strict'
  var stream = require('stream')
    , util = require('util')

  function isCharCode(s) { return typeof s === 'number' && s > 0 && s < 0x10FFFF}

  /**
   * StreamSplit : a Stream of type Transform that split incoming string with a given separator
   *
   * sep : the separator, a string or a numeric charcode or an array of numeric charcode, default to '\n' if nothing is provided
   */
  function StreamSplit(sep) {
    if (!(this instanceof StreamSplit)) return new StreamSplit(sep)
    this.lastLine = ''
    if (typeof sep === 'string') {
      this.sep = []
      for (var i = 0, l = sep.length; i < l; i+=1) {
        this.sep.push(sep.charCodeAt(i))
      }
    } else if (isCharCode(sep)) {
      this.sep = [sep]
    } else if (typeof s === 'number') {
      throw new Error('Bad separator: '+ JSON.stringify(sep)+'  is not a valid charcode.')
    } else if (util.isArray(sep)) {
      if (sep.every(isCharCode)) {
        this.sep = sep
      } else {
        throw new Error('Bad separator: '+ JSON.stringify(sep)+', every element should be valid charcode.')
      }
    } else {
      this.sep = [0x0A]
    }
    stream.Transform.call(this, {encoding: 'utf8'})
  }
  util.inherits(StreamSplit, stream.Transform)
  StreamSplit.prototype._transform = function (data, encoding, callback) {
    try {
      var p, c, l; p = c = 0; l = data.length
      while (c < l) {
        while (c < l && data[c] !== this.sep[0]) { c+=1 }
        var i = 0, m = this.sep.length
        while(i < m && data[c+i] === this.sep[i]) {
          i += 1
        }
        if (i === m) {
          this.lastLine += data.toString('utf8',p,c)
          this.push(this.lastLine)
          this.lastLine = ''
          c+=i
          p = c
        }
      }
      callback()
    } catch(e) {
      callback(e)
    }
  }
  StreamSplit.prototype._flush = function (callback) {
    try {
      if (this.lastLine.length > 0) this.push(this.lastLine)
      callback()
    } catch(e) {
      callback(e)
    }
  }

  return StreamSplit
}())