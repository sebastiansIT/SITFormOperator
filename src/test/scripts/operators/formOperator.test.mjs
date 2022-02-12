/*  Copyright 2021 Sebastian Spautz

    This File is Part of "SebastiansIT Form Operator".

    "SebastiansIT Form Operator" is free software: you can redistribute it
    and/or modify it under the terms of the GNU General Public License as
    published by the Free Software Foundation, either version 3 of the License,
    or any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/.
*/

/* global test, expect */

import * as operator from '../../../main/scripts/operators/formOperator.mjs'

/* ========================================================== */
/* ===================== FORM_SELECTOR ===================== */
/* ========================================================== */
test('FORM_SELECTOR should be a CSS selector', () => {
  expect(() => document.querySelector(operator.FORM_SELECTOR)).not.toThrow()
})

/* ========================================================== */
/* ========================= keyOf() ======================== */
/* ========================================================== */
test('form key should created by local file name pattern', () => {
  const fileNamePattern = document.createElement('meta')
  fileNamePattern.attributes.name = 'filenamepattern'
  fileNamePattern.attributes.content = 'pattern'
  document.head.appendChild(fileNamePattern)
  document.body.innerHTML =
    '<meta name="filenamepattern" content="pattern" />' +
    '<input id="pattern" value="test" />'

  expect(operator.keyOf(document.body)).toStrictEqual('test')
})

test('form key should created by global file name pattern', () => {
  document.head.innerHTML =
    '<meta name="filenamepattern" content="pattern" />'
  document.body.innerHTML =
    '<input id="pattern" value="test" />'

  expect(operator.keyOf(document.body)).toStrictEqual('test')
})

/* ========================================================== */
/* ====================== exportData() ====================== */
/* ========================================================== */
test('exportData should export data of a form with simple content', () => {
  document.body.innerHTML =
    '<form id="simple">' +
    '  <select id="entryId" name="entryName" data-exportkey="entryKey">' +
    '    <option value="entry1">Entry 1</option>' +
    '    <option value="entry 2" selected="selected">Entry 2</option>' +
    '    <option value="entry3">Entry 3</option>' +
    '  </select>' +
    '  <fieldset>' +
    '    <legend id="editable" contenteditable="on">Legend</legend>' +
    '    <input type="radio" name="radiogroup" value="entry1" />' +
    '    <input type="radio" name="radiogroup" id="radio2" value="entry 2" />' +
    '    <input type="radio" name="radiogroup" value="entry3" checked />' +
    '  </fieldset>' +
    '</form>'

  expect(operator.exportData(document.getElementById('simple'))).toStrictEqual(
    {
      entryKey: 'entry 2',
      editable: 'Legend',
      radiogroup: 'entry3'
    }
  )
})

test('exportData should export data of a form with a section', () => {
  document.body.innerHTML =
    '<form id="widthSubsection">' +
    '  <input type="text" value="valueInMain" name="mainInput" />' +
    '  <div id="subsection">' +
    '   <select id="entryId" name="entryName" data-exportkey="entryKey">' +
    '    <option value="entry1">Entry 1</option>' +
    '    <option value="entry 2" selected="selected">Entry 2</option>' +
    '    <option value="entry3">Entry 3</option>' +
    '   </select>' +
    '   <fieldset>' +
    '    <legend id="editable" contenteditable="on">Legend</legend>' +
    '    <input type="radio" name="radiogroup" value="entry1" />' +
    '    <input type="radio" name="radiogroup" id="radio2" value="entry 2" />' +
    '    <input type="radio" name="radiogroup" value="entry3" checked />' +
    '   </fieldset>' +
    '  </div>' +
    '</form>'

  expect(operator.exportData(document.getElementById('widthSubsection'))).toStrictEqual({
    mainInput: 'valueInMain',
    subsection: {
      entryKey: 'entry 2',
      editable: 'Legend',
      radiogroup: 'entry3'
    }
  })
})

/* ========================================================== */
/* ====================== importData() ====================== */
/* ========================================================== */
test('importData should import data into a form with a section', () => {
  document.body.innerHTML =
    '<form id="widthSubsection">' +
    '  <input type="text" value="" name="mainInput" />' +
    '  <div id="subsection">' +
    '   <select id="entryId" name="entryName" data-exportkey="entryKey">' +
    '    <option value="select1">Entry 1</option>' +
    '    <option value="select2">Entry 2</option>' +
    '    <option value="select3">Entry 3</option>' +
    '   </select>' +
    '   <fieldset>' +
    '    <legend id="editable" contenteditable="on">Predefined</legend>' +
    '    <input type="radio" name="radiogroup" value="entry1" />' +
    '    <input type="radio" name="radiogroup" id="radio2" value="entry 2" />' +
    '    <input type="radio" name="radiogroup" value="entry3" />' +
    '   </fieldset>' +
    '  </div>' +
    '</form>'

  const element = document.getElementById('widthSubsection')
  operator.importData(element, {
    mainInput: 'A Text',
    subsection: {
      entryKey: 'select3',
      editable: 'A Legend',
      radiogroup: 'entry 2'
    }
  })
  expect(operator.exportData(element)).toStrictEqual({
    mainInput: 'A Text',
    subsection: {
      entryKey: 'select3',
      editable: 'A Legend',
      radiogroup: 'entry 2'
    }
  })
})
