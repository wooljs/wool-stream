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

'use strict'

var test = require('tape')
  , Event = require( __dirname + '/../index.js').Event

test('check Event.parse', function(t) {

  t.deepEqual(
    Event.parse('2017-02-10T12:43:40.247Z-0000 plop {"plop":42}'),
    Event(new Date('2017-02-10T12:43:40.247Z'), 0, 'plop', {plop: 42}))

  t.deepEqual(
    Event.parse('2017-02-10T12:43:41.247Z-00ff plip {"plip":{"plouf":"plaf"}}'),
    Event(new Date('2017-02-10T12:43:41.247Z'), 255, 'plip', {'plip': {plouf: 'plaf'}}))

  t.deepEqual(
    Event.parse('2017-02-10T12:43:42.247Z-0100 XX {"test":"this is a long text"}'),
    Event(new Date('2017-02-10T12:43:42.247Z'), 256, 'XX', {test: 'this is a long text'}))

  t.deepEqual(
    Event.parse('2017-02-10T12:43:43.247Z-0000 foobar {"plop": 42}'),
    Event(new Date('2017-02-10T12:43:43.247Z'), 0, 'foobar', {plop: 42}))

  t.deepEqual(
    Event.parse('2017-02-10T12:43:43.247Z-0000 foobar S {"plop": 42}'),
    Event(new Date('2017-02-10T12:43:43.247Z'), 0, 'foobar', {plop: 42}, 'S'))

  t.deepEqual(
    Event.parse('2017-02-10T12:43:43.247Z-0000 foobar I {"test": "muhahaha"} Invalid statement'),
    Event(new Date('2017-02-10T12:43:43.247Z'), 0, 'foobar', {test: 'muhahaha'}, 'I', 'Invalid statement'))
  t.end()
})

test('check Event.stringify', function(t) {

  t.deepEqual(
    Event.stringify(Event(new Date('2017-02-10T12:43:40.247Z'), 0, 'plop', {plop: 42})),
    '2017-02-10T12:43:40.247Z-0000 plop {"plop":42}')

  t.deepEqual(
    Event.stringify(Event(new Date('2017-02-10T12:43:41.247Z'), 255, 'plip', {'plip': {plouf: 'plaf'}})),
    '2017-02-10T12:43:41.247Z-00ff plip {"plip":{"plouf":"plaf"}}')
  
  t.deepEqual(
    Event.stringify(Event(new Date('2017-02-10T12:43:42.247Z'), 256, 'XX', {test: 'this is a long text'})),
    '2017-02-10T12:43:42.247Z-0100 XX {"test":"this is a long text"}')
    
  t.deepEqual(
    Event.stringify(Event(new Date('2017-02-10T12:43:43.247Z'), 0, 'foobar', {plop: 42})),
    '2017-02-10T12:43:43.247Z-0000 foobar {"plop":42}')

  t.deepEqual(
    Event.stringify(Event(new Date('2017-02-10T12:43:43.247Z'), 0, 'foobar', {plop: 42}, 'S')),
    '2017-02-10T12:43:43.247Z-0000 foobar S {"plop":42}')
    
  t.deepEqual(
    Event.stringify(Event(new Date('2017-02-10T12:43:43.247Z'), 0, 'foobar', {test: 'muhahaha'}, 'I', 'Invalid statement')),
    '2017-02-10T12:43:43.247Z-0000 foobar I {"test":"muhahaha"} Invalid statement')
  t.end()
})
