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

import * as entryOp from '../../../main/scripts/operators/entryOperator.mjs'

/* ========================================================== */
/* ===================== ENTRY_SELECTOR ===================== */
/* ========================================================== */
test('ENTRY_SELECTOR should be a CSS selector', () => {
  expect(() => document.querySelector(entryOp.ENTRY_SELECTOR)).not.toThrow()
})

/* ========================================================== */
/* ========================= keyOf() ======================== */
/* ========================================================== */
test('keyOf should return exportkey', () => {
  document.body.innerHTML =
    '<input id="entryId" name="entryName" data-exportkey="entryKey" />'

  expect(entryOp.keyOf(document.getElementById('entryId'))).toBe('entryKey')
})

test('keyOf should return name if exportkey not available', () => {
  document.body.innerHTML =
    '<div>' +
      '<input id="entryId" name="entryName" />' +
      '<input type="checkbox" name="checkbox" id="check1" value="a" />' +
      '<input type="checkbox" name="checkbox" id="check2" value="b" />' +
    '</div>'

  expect(entryOp.keyOf(document.getElementById('entryId'))).toBe('entryName')
  expect(entryOp.keyOf(document.getElementById('check2'))).toBe('checkbox')
})

test('keyOf should return id if exportkey nor name are available', () => {
  document.body.innerHTML =
    '<input id="entryId" />'

  expect(entryOp.keyOf(document.getElementById('entryId'))).toBe('entryId')
})

test('keyOf should throw an exception if key containes a slash', () => {
  document.body.innerHTML =
    '<input id="entryId1" name="entryName" data-exportkey="entry/Key" />' +
    '<input id="entryId2" name="entryName/" />' +
    '<input id="/entryId3" />'

  expect(() => entryOp.keyOf(document.getElementById('entryId1'))).toThrow()
  expect(() => entryOp.keyOf(document.getElementById('entryId2'))).toThrow()
  expect(() => entryOp.keyOf(document.getElementById('/entryId3'))).toThrow()
})

test('keyOf should throw an exception if no key is available', () => {
  document.body.innerHTML =
    '<input />'

  expect(() => entryOp.keyOf(document.getElementsByTagName('input').item(0))).toThrow()
})

test('keyOf should throw an exception if entry not match', () => {
  document.body.innerHTML =
    '<footer id="entryId" />'

  expect(() => entryOp.keyOf(document.getElementById('entryId'))).toThrow()
})

/* ========================================================== */
/* ======================== valueOf ========================= */
/* ========================================================== */
test('valueOf should return value of a dropdown', () => {
  document.body.innerHTML =
    '<select id="entryId" name="entryName" data-exportkey="entryKey">' +
    '  <option value="entry1">Entry 1</option>' +
    '  <option value="entry2" selected="selected">Entry 2</option>' +
    '  <option value="entry3">Entry 3</option>' +
    '</select>'

  expect(entryOp.valueOf(document.getElementById('entryId'))).toBe('entry2')
})

test('valueOf should return value of a multi select', () => {
  document.body.innerHTML =
    '<select id="entryId" name="entryName" data-exportkey="entryKey" multiple>' +
    '  <option value="entry1">Entry 1</option>' +
    '  <option value="entry2" selected="selected">Entry 2</option>' +
    '  <option value="entry3">Entry 3</option>' +
    '  <option value="entry4" selected>Entry 4</option>' +
    '</select>'

  expect(entryOp.valueOf(document.getElementById('entryId'))).toStrictEqual(['entry2', 'entry4'])
})

test('valueOf should return value of a radio group', () => {
  document.body.innerHTML =
    '<fieldset>' +
    '  <input type="radio" name="radiogroup" value="entry1" />' +
    '  <input type="radio" name="radiogroup" id="radio2" value="entry2" />' +
    '  <input type="radio" name="radiogroup" value="entry3" checked />' +
    '</fieldset>'

  expect(entryOp.valueOf(document.getElementById('radio2'))).toBe('entry3')
})

test('valueOf should return value of a radio group without a selection', () => {
  document.body.innerHTML =
    '<fieldset>' +
    '  <input type="radio" name="radiogroup" value="entry1" />' +
    '  <input type="radio" name="radiogroup" id="radio2" value="entry2" />' +
    '  <input type="radio" name="radiogroup" value="entry3" />' +
    '</fieldset>'

  expect(entryOp.valueOf(document.getElementById('radio2'))).toBeUndefined()
})

test('valueOf should return value of a single checkbox', () => {
  document.body.innerHTML =
    '<fieldset>' +
    '  <input type="checkbox" id="checkbox1" name="checkboxgroup" value="entry1" checked />' +
    '</fieldset>'

  const value = entryOp.valueOf(document.getElementById('checkbox1'))
  expect(value.checked).toBe(true)
  expect(value.enabled).toBe(true)
})

test('valueOf should return a mapping from checkbox value to the state of each checkbox inside a group', () => {
  document.body.innerHTML =
    '<fieldset>' +
    '  <input type="checkbox" id="checkbox1" name="checkboxgroup" value="entry1" checked disabled="disabled"/>' +
    '  <input type="checkbox" id="checkbox2" name="checkboxgroup" value="entry2" checked="checked" />' +
    '  <input type="checkbox" id="checkbox3" name="checkboxgroup" value="entry3" disabled="disabled"/>' +
    '  <input type="checkbox" id="checkbox4" name="checkboxgroup" value="entry4" />' +
    '</fieldset>'

  const value = entryOp.valueOf(document.getElementById('checkbox1'))

  expect(Object.keys(value).length).toBe(4)
  expect(value.entry1.checked).toBe(true)
  expect(value.entry2.checked).toBe(true)
  expect(value.entry3.checked).toBe(false)
  expect(value.entry4.checked).toBe(false)
})

test('valueOf should return checked flag of a checkbox', () => {
  document.body.innerHTML =
    '<fieldset>' +
    '  <input type="checkbox" id="checkbox1" name="checkboxgroup" value="entry1" checked disabled="disabled"/>' +
    '  <input type="checkbox" id="checkbox2" name="checkboxgroup" value="entry2" checked="checked" />' +
    '  <input type="checkbox" id="checkbox3" name="checkboxgroup" value="entry3" disabled="disabled"/>' +
    '  <input type="checkbox" id="checkbox4" name="checkboxgroup" value="entry4" />' +
    '</fieldset>'

  const value = entryOp.valueOf(document.getElementById('checkbox1'))
  expect(value.entry1.checked).toBe(true)
  expect(value.entry2.checked).toBe(true)
  expect(value.entry3.checked).toBe(false)
  expect(value.entry4.checked).toBe(false)
})

test('valueOf should return enabled flag of a disabled checkbox', () => {
  document.body.innerHTML =
    '<fieldset>' +
    '  <input type="checkbox" id="checkbox1" name="checkboxgroup" value="entry1" checked disabled="disabled"/>' +
    '  <input type="checkbox" id="checkbox2" name="checkboxgroup" value="entry2" disabled />' +
    '  <input type="checkbox" id="checkbox3" name="checkboxgroup" value="entry3" checked/>' +
    '  <input type="checkbox" id="checkbox4" name="checkboxgroup" value="entry4" />' +
    '</fieldset>'

  const value = entryOp.valueOf(document.getElementById('checkbox1'))
  expect(value.entry1.enabled).toBe(false)
  expect(value.entry2.enabled).toBe(false)
  expect(value.entry3.enabled).toBe(true)
  expect(value.entry4.enabled).toBe(true)
})

test('valueOf should return value of a editable element', () => {
  document.body.innerHTML =
    '<p contenteditable id="editable">A editable Text</p>'

  expect(entryOp.valueOf(document.getElementById('editable'))).toBe('A editable Text')
})

test('valueOf should return value of a generic input', () => {
  document.body.innerHTML =
    '<input id="input1" name="input1" value="entry1" />'

  expect(entryOp.valueOf(document.getElementById('input1'))).toBe('entry1')
})

// TODO Exceptions testen

/* ========================================================== */
/* ======================== valueFor ======================== */
/* ========================================================== */
test('valueFor should set value of a dropdown', () => {
  document.body.innerHTML =
    '<select id="entryId" name="entryName" data-exportkey="entryKey">' +
    '  <option value="entry1">Entry 1</option>' +
    '  <option value="entry2" selected="selected">Entry 2</option>' +
    '  <option value="entry3">Entry 3</option>' +
    '</select>'

  const element = document.getElementById('entryId')
  entryOp.valueFor(element, 'entry3')
  expect(entryOp.valueOf(element)).toBe('entry3')
})

test('valueFor should set value of a multi select', () => {
  document.body.innerHTML =
    '<select id="entryId" name="entryName" data-exportkey="entryKey" multiple>' +
    '  <option value="entry1">Entry 1</option>' +
    '  <option value="entry2" selected="selected">Entry 2</option>' +
    '  <option value="entry3">Entry 3</option>' +
    '  <option value="entry4" selected>Entry 4</option>' +
    '</select>'

  const element = document.getElementById('entryId')
  entryOp.valueFor(element, ['entry3', 'entry1'])
  expect(entryOp.valueOf(element)).toStrictEqual(['entry1', 'entry3'])
})

test('valueFor should set value of a radio group', () => {
  document.body.innerHTML =
    '<fieldset>' +
    '  <input type="radio" name="radiogroup" value="entry1" />' +
    '  <input type="radio" name="radiogroup" id="radio2" value="entry2" />' +
    '  <input type="radio" name="radiogroup" value="entry3" checked />' +
    '</fieldset>'

  const element = document.getElementById('radio2')
  entryOp.valueFor(element, 'entry1')
  expect(entryOp.valueOf(element)).toBe('entry1')
})

test('valueFor should clear a radio group if value is set to undefined', () => {
  document.body.innerHTML =
    '<fieldset>' +
    '  <input type="radio" name="radiogroup" value="entry1" />' +
    '  <input type="radio" name="radiogroup" id="radio2" value="entry2" />' +
    '  <input type="radio" name="radiogroup" value="entry3" checked />' +
    '</fieldset>'

  const element = document.getElementById('radio2')
  entryOp.valueFor(element, undefined)
  expect(entryOp.valueOf(element)).toBeUndefined()
})

test('valueFor should set value of a checkbox', () => {
  document.body.innerHTML =
    '<fieldset>' +
    '  <input type="checkbox" id="checkbox1" name="checkboxgroup" value="entry1" checked />' +
    '</fieldset>'

  const element = document.getElementById('checkbox1')
  entryOp.valueFor(element, { checked: false, enabled: true })
  const value = entryOp.valueOf(element)
  expect(value.checked).toBe(false)
  expect(value.enabled).toBe(true)
})

test('valueFor should set value of a checkbox group', () => {
  document.body.innerHTML =
    '<fieldset>' +
    '  <input type="checkbox" id="checkbox1" name="checkboxgroup" value="entry1" checked />' +
    '  <input type="checkbox" id="checkbox2" name="checkboxgroup" value="entry2" />' +
    '  <input type="checkbox" id="checkbox3" name="checkboxgroup" value="entry3" />' +
    '  <input type="checkbox" id="checkbox4" name="checkboxgroup" value="entry4" checked />' +
    '</fieldset>'

  const element = document.getElementById('checkbox1')
  entryOp.valueFor(element, {
    entry1: { checked: false, enabled: true },
    entry2: { checked: false, enabled: false },
    entry3: { checked: true, enabled: false },
    entry4: { checked: true, enabled: true }
  })
  const value = entryOp.valueOf(element)
  expect(value.entry1.checked).toBe(false)
  expect(value.entry1.enabled).toBe(true)
  expect(value.entry2.checked).toBe(false)
  expect(value.entry2.enabled).toBe(false)
  expect(value.entry3.checked).toBe(true)
  expect(value.entry3.enabled).toBe(false)
  expect(value.entry4.checked).toBe(true)
  expect(value.entry4.enabled).toBe(true)
})

test('valueFor should set value of a editable element', () => {
  document.body.innerHTML =
    '<p contenteditable id="editable">A editable Text</p>'

  const element = document.getElementById('editable')
  entryOp.valueFor(element, 'Another Text')
  expect(entryOp.valueOf(element)).toBe('Another Text')
})

test('valueFor should set value of a generic input', () => {
  document.body.innerHTML =
    '<input id="input1" name="input1" value="entry1" />'

  const element = document.getElementById('input1')
  entryOp.valueFor(element, 'Another Text')
  expect(entryOp.valueOf(element)).toBe('Another Text')
})

// TODO add tests for undefined, null and invalid values
// TODO exceptions testen

/* ========================================================== */
/* ======================== entryBy ========================= */
/* ========================================================== */
test('entryBy should return HTMLElement with the given ID inside of the parent', () => {
  document.body.innerHTML =
    '<div id="parent">' +
      '<input id="input1" name="input12" value="entry1" />' +
    '</div>'

  const element = document.getElementById('parent')
  entryOp.entryBy('input1', element)
  expect(entryOp.entryBy('input1', element)).toBe(document.getElementById('input1'))
})

test('entryBy should return HTMLElement with the given name inside of the parent', () => {
  document.body.innerHTML =
    '<div id="parent">' +
      '<input id="input1" value="entry1" />' +
      '<input id="input12" name="input1" value="entry1" />' +
    '</div>'

  const element = document.getElementById('parent')
  entryOp.entryBy('input1', element)
  expect(entryOp.entryBy('input1', element)).toBe(document.getElementById('input12'))
})

test('entryBy should return HTMLElement with the given export key inside of the parent', () => {
  document.body.innerHTML =
    '<div id="parent">' +
      '<input id="input1" name="input1" value="entry1" />' +
      '<input id="input12" name="input12" data-exportkey="input1" value="entry1" />' +
    '</div>'

  const element = document.getElementById('parent')
  entryOp.entryBy('input1', element)
  expect(entryOp.entryBy('input1', element)).toBe(document.getElementById('input12'))
})

test('entryBy should return undefined if no input element with the given key only exists outside of the parent', () => {
  document.body.innerHTML =
    '<input id="input2" name="input2" value="entry1" />' +
    '<div id="parent">' +
    '</div>'

  const element = document.getElementById('parent')
  entryOp.entryBy('input1', element)
  expect(entryOp.entryBy('input1', element)).toBeUndefined()
})

test('entryBy should return undefined if no input element with the given key exists inside of the parent', () => {
  document.body.innerHTML =
    '<div id="parent">' +
      '<input id="input2" name="input2" value="entry1" />' +
    '</div>'

  const element = document.getElementById('parent')
  entryOp.entryBy('input1', element)
  expect(entryOp.entryBy('input1', element)).toBeUndefined()
})
