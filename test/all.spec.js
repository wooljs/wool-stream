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

'use strict'

var test = require('tape')
  , fs = require('fs')
  , ws = require( __dirname + '/../index.js')
  , file_load = __dirname+'/test_load.db'
  , file_save = __dirname+'/test_save.db'

if (fs.existsSync(file_save)) fs.unlinkSync(file_save)

test('check stream all piped together', function(t) {
  var count = 0

  fs.createReadStream(file_load, {flags: 'r'})
  .pipe(ws.StreamSplit())
  .pipe(ws.StreamParse())
  .pipe(ws.StreamDispatch(function(o, cb) { count+=1; cb(null) }))
  .on('error', function (e) {
    //console.trace(e)
    t.fail(e)
    t.end()
  })
  .on('finish', function () {

    var es = ws.StreamDispatch(function(o, cb) { count+=1; cb(null) })
    var date = new Date()

    es
    .pipe(ws.StreamStringify())
    .pipe(ws.StreamJoin())
    .pipe(fs.createWriteStream(file_save, {flags: 'a'}))
    .on('error', function (e) {
      //console.trace(e)
      t.fail(e)
      t.end()
    })
    .on('finish', function () {
      t.deepEqual(count, 8)

      fs.readFile(file_save,{encoding:'utf8'}, function (err, data) {
        if (err) throw err

        t.deepEqual(data,'{"yo":"yeah"}\n42\n"paf"\n{"this is the end":"'+date.toISOString()+'"}\n')

        fs.unlink(file_save, function(err) {
          if (err) throw err
          t.end()
        })
      })

    })

    es.write({yo:'yeah'})
    es.write(42)
    es.write('paf')
    es.end({'this is the end':date.toISOString()})
  })
})
