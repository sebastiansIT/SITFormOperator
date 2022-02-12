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

/* global describe, test, expect, beforeAll */

import * as operator from '../../../main/scripts/operators/sectionOperator.mjs'

beforeAll(() => {
  operator.init()
})

/* ========================================================== */
/* ===================== SECTION_SELECTOR ===================== */
/* ========================================================== */
test('SECTION_SELECTOR should be a CSS selector', () => {
  expect(() => document.querySelector(operator.SECTION_SELECTOR)).not.toThrow()
})

/* ========================================================== */
/* ========================= keyOf() ======================== */
/* ========================================================== */
test('keyOf should return exportkey', () => {
  document.body.innerHTML =
    '<div id="divId" data-exportkey="div">section</div>' +
    '<section id="sectionId" data-exportkey="section">section</div>'

  expect(operator.keyOf(document.getElementById('divId'))).toBe('div')
  expect(operator.keyOf(document.getElementById('sectionId'))).toBe('section')
})

test('keyOf should return id if exportkey isn´t available', () => {
  document.body.innerHTML =
    '<div id="divId">section</div>'

  expect(operator.keyOf(document.getElementById('divId'))).toBe('divId')
})

describe('operations should validate the section parameter', () => {
  const operations = [
    { function: operator.keyOf },
    { function: operator.exportData },
    { function: operator.importData }
  ]

  operations.forEach((operation, i) => {
    test(`${operation.function.name} should throw an exception if key containes a slash`, () => {
      document.body.innerHTML =
        '<section id="sectionId1" data-exportkey="/section">section</div>' +
        '<section id="sectionId2" data-exportkey="section/">section</div>' +
        '<section id="sectionId3" data-exportkey="sec/tion">section</div>'

      expect(() => operation.function(document.getElementById('sectionId1'))).toThrow()
      expect(() => operation.function(document.getElementById('sectionId2'))).toThrow()
      expect(() => operation.function(document.getElementById('sectionId3'))).toThrow()
    })

    test(`${operation.function.name} should throw an exception if no key is available`, () => {
      document.body.innerHTML =
        '<div id="" data-exportkey="" />'

      expect(() => operation.function(document.getElementsByTagName('div').item(0))).toThrow()
    })

    test(`${operation.function.name} should throw an exception if section not match`, () => {
      document.body.innerHTML =
        '<head id="sectionId" />'

      expect(() => operation.function(document.getElementById('sectionId'))).toThrow()
    })
  })
})

test('keyOf should throw an exception if key containes a slash', () => {
  document.body.innerHTML =
    '<section id="sectionId1" data-exportkey="/section">section</div>' +
    '<section id="sectionId2" data-exportkey="section/">section</div>' +
    '<section id="sectionId3" data-exportkey="sec/tion">section</div>'

  expect(() => operator.keyOf(document.getElementById('sectionId1'))).toThrow()
  expect(() => operator.keyOf(document.getElementById('sectionId2'))).toThrow()
  expect(() => operator.keyOf(document.getElementById('sectionId3'))).toThrow()
})

test('keyOf should throw an exception if no key is available', () => {
  document.body.innerHTML =
    '<div id="" data-exportkey="" />'

  expect(() => operator.keyOf(document.getElementsByTagName('div').item(0))).toThrow()
})

test('keyOf should throw an exception if section not match', () => {
  document.body.innerHTML =
    '<head id="sectionId" />'

  expect(() => operator.keyOf(document.getElementById('sectionId'))).toThrow()
})

/* ========================================================== */
/* ====================== exportData() ====================== */
/* ========================================================== */
test('exportData should export data of a section with simple content', () => {
  document.body.innerHTML =
    '<section id="simple">' +
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
    '</section>'

  expect(operator.exportData(document.getElementById('simple'))).toStrictEqual(
    {
      entryKey: 'entry 2',
      editable: 'Legend',
      radiogroup: 'entry3'
    }
  )
})

test('exportData should export data of a section with subsection', () => {
  document.body.innerHTML =
    '<section id="widthSubsection">' +
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
    '</section>'

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
test('importData should import data into a section with subsection', () => {
  document.body.innerHTML =
    '<section id="widthSubsection">' +
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
    '</section>'

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
