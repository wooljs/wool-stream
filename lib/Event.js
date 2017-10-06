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

  /**
   * Event :
   * t: timestamp
   * o: order
   * n: name
   * d: data
   */
  function Event(t, o, n, d, s, m) {
    if (! (t instanceof Date)) throw new Error(t+' is not of type Date.')
    if (! (typeof o === 'number')) throw new Error(o+' is not of type Number.')
    if (! (typeof n === 'string')) throw new Error(n+' is not of type String.')
    if (! (d instanceof Object)) throw new Error(d+' is not of type Object.')

    if (!(this instanceof Event)) return new Event(t, o, n, d)
    this.t = t
    this.o = o
    this.n = n
    this.d = d
    // S = Success, I = Invalid, E = Error
    this.s = typeof s !== 'undefined' && s.length === 1 && 'SIE'.indexOf(s) !== -1 ? s : undefined
    this.m = m
  }

  function lpad(s, i, n) {
    var x = n - s.length
    while (x > 0) {
      s = i + s
      x -= 1
    }
    return s
  }

  Event.prototype.stringify = function () {
    return this.t.toISOString() + '-' + lpad(this.o.toString(16),'0',4) + ' ' + this.n + ' ' + JSON.stringify(this.d)
  }

  Event.stringify = function(o) {
    if (o instanceof Event) return o.stringify()
    else throw new Error(o+' is not of type Event.')
  }

  var rx = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)-([0-9a-f]{4}) ([a-zA-Z0-9_-]+) (?:|S |I (.*) |E (.*) )(\{.*\})$/
    , _index_t = 1
    , _index_o = 2
    , _index_n = 3
    , _index_d = 6
  //  , _index_i = 4
  //  , _index_e = 5

  Event.parse = function(s) {
    var e = rx.exec(s)
    if (e === null) throw new Error('Invalid format "'+s+'".')
    return Event(new Date(e[_index_t]), Number.parseInt(e[_index_o],16), e[_index_n], JSON.parse(e[_index_d]))
  }

  return Event
}())