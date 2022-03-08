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

/* global describe, test, expect */

import * as operator from '../../../main/scripts/operators/arrayOperator.mjs'

operator.init()

/* ========================================================== */
/* ===================== ARRAY_SELECTOR ===================== */
/* ========================================================== */
test('ARRAY_SELECTOR should be a CSS selector', () => {
  expect(() => document.querySelector(operator.ARRAY_SELECTOR)).not.toThrow()
})

/* ========================================================== */
/* ========================= keyOf() ======================== */
/* ========================================================== */
test('keyOf should return exportkey', () => {
  document.body.innerHTML =
    '<div data-arrayselector=".arrayitems" id="arrayId" data-exportkey="arrayKey">' +
    '  <div class="arrayitems">Array</div>' +
    '</div>'

  expect(operator.keyOf(document.getElementById('arrayId'))).toBe('arrayKey')
})

test('keyOf should return id if exportkey isn´t available', () => {
  document.body.innerHTML =
    '<div data-arrayselector=".arrayitems" id="arrayId">' +
    '  <div class="arrayitems">Array</div>' +
    '</div>'

  expect(operator.keyOf(document.getElementById('arrayId'))).toBe('arrayId')
})

describe('operations should validate the array parameter', () => {
  const operations = [
    { function: operator.keyOf },
    { function: operator.exportData },
    { function: operator.importData }
  ]

  operations.forEach((operation, i) => {
    test(`${operation.function.name} should throw an exception if key containes a slash`, () => {
      document.body.innerHTML =
        '<div data-arrayselector=".arrayitems" id="arrayId1" data-exportkey="array/Key">Array</div>' +
        '<div data-arrayselector=".arrayitems" id="arrayId2" data-exportkey="arrayKey/">Array</div>' +
        '<div data-arrayselector=".arrayitems" id="arrayId3" data-exportkey="/arrayKey">Array</div>'

      expect(() => operation.function(document.getElementById('arrayId1'))).toThrow()
      expect(() => operation.function(document.getElementById('arrayId2'))).toThrow()
      expect(() => operation.function(document.getElementById('arrayId3'))).toThrow()
    })

    test(`${operation.function.name} should throw an exception if no key is available`, () => {
      document.body.innerHTML =
        '<div data-arrayselector=".arrayitems" />'

      expect(() => operation.function(document.getElementsByTagName('div').item(0))).toThrow()
    })

    test(`${operation.function.name} should throw an exception if array not match`, () => {
      document.body.innerHTML =
        '<div id="arrayId">' +
        '</div>'

      expect(() => operation.function(document.getElementById('arrayId'))).toThrow('[object HTMLDivElement] isn\'t a valid array. It should match css selector [data-arrayselector].')
    })

    test(`${operation.function.name} should throw an exception if array dosn't contains an item container`, () => {
      document.body.innerHTML =
        '<section id="array" data-arrayselector=".arrayitems">' +
        '</section>'

      expect(() => operator.exportData(document.getElementById('array'))).toThrow()
    })
  })
})

/* ========================================================== */
/* ====================== exportData() ====================== */
/* ========================================================== */
test('exportData should return a JavaScript array from a complex form array', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <ul class="arrayitems">' +
    '    <li><input type="text" name="item_1" data-exportkey="item" value="erster" /></li>' +
    '    <li><input type="text" name="item_2" data-exportkey="item" value="zweiter" /></li>' +
    '    <li><input type="text" name="item_3" data-exportkey="item" value="dritter" /></li>' +
    '  </ul>' +
    '</section>'

  expect(operator.exportData(document.getElementById('array'))).toEqual([
    { item: 'erster' },
    { item: 'zweiter' },
    { item: 'dritter' }
  ])
})

test('exportData should return a JavaScript array from a simple form array', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <div class="arrayitems">' +
    '    <input type="text" name="item_1" data-exportkey="item" value="erster" />' +
    '    <input type="text" name="item_2" data-exportkey="item" value="zweiter" />' +
    '    <input type="text" name="item_3" data-exportkey="item" value="dritter" />' +
    '  </div>' +
    '</section>'

  expect(operator.exportData(document.getElementById('array'))).toEqual([
    'erster',
    'zweiter',
    'dritter'
  ])
})

test('exportData should return a empty JavaScript array from a array without items', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <div class="arrayitems"></div>' +
    '</section>'

  expect(operator.exportData(document.getElementById('array'))).toEqual([])
})

/* ========================================================== */
/* ====================== importData() ====================== */
/* ========================================================== */
test('importData should import data into a simple form array', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <input type="text" name="item_{{no}}" data-exportkey="item" value="" />' +
    '  </template>' +
    '  <div class="arrayitems">' +
    '    <input type="text" name="item_1" data-exportkey="item" value="predefined" />' +
    '  </div>' +
    '</section>'

  const element = document.getElementById('array')
  operator.importData(element, [
    'erster',
    'zweiter',
    'dritter'
  ])
  expect(operator.exportData(element)).toEqual([
    'erster',
    'zweiter',
    'dritter'
  ])
})

test('importData should import data into a complex form array', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <li><input type="text" name="item_{{no}}" data-exportkey="item" value="" /></li>' +
    '  </template>' +
    '  <ul class="arrayitems">' +
    '    <li><input type="text" name="item_1" data-exportkey="item" value="predefined" /></li>' +
    '  </ul>' +
    '</section>'

  const element = document.getElementById('array')
  operator.importData(element, [
    { item: 'erster' },
    { item: 'zweiter' },
    { item: 'dritter' }
  ])
  expect(operator.exportData(element)).toEqual([
    { item: 'erster' },
    { item: 'zweiter' },
    { item: 'dritter' }
  ])
})

test('importData should remove excess array items from DOM', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <input type="text" name="item_{{no}}" data-exportkey="item" value="" />' +
    '  </template>' +
    '  <div class="arrayitems">' +
    '    <input type="text" name="item_1" data-exportkey="item" value="predefined" />' +
    '    <input type="text" name="item_2" data-exportkey="item" value="predefined" />' +
    '    <input type="text" name="item_3" data-exportkey="item" value="predefined" />' +
    '    <input type="text" name="item_4" data-exportkey="item" value="predefined" />' +
    '    <input type="text" name="item_5" data-exportkey="item" value="predefined" />' +
    '  </div>' +
    '</section>'

  const element = document.getElementById('array')
  operator.importData(element, [
    'erster',
    'zweiter'
  ])
  expect(element.querySelector('.arrayitems').children.length).toEqual(2)
})

test('importData should add missing array items to DOM', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <input type="text" name="item_{{no}}" data-exportkey="item" value="" />' +
    '  </template>' +
    '  <div class="arrayitems">' +
    '  </div>' +
    '</section>'

  const element = document.getElementById('array')
  operator.importData(element, [
    'erster',
    'zweiter',
    'dritter'
  ])
  expect(element.querySelector('.arrayitems').children.length).toEqual(3)
})

/* ========================================================== */
/* ================== fullQualifiedKeyOf() ================== */
/* ========================================================== */
test('full qualified key of an entry should build with an index', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <input type="text" name="item_{{no}}" data-exportkey="item" value="" />' +
    '  </template>' +
    '  <div class="arrayitems">' +
    '    <input type="text" name="item_1" id="item_1" data-exportkey="item" value="" />' +
    '    <input type="text" name="item_2" id="item_2" data-exportkey="item" value="" />' +
    '    <input type="text" name="item_3" id="item_3" data-exportkey="item" value="" />' +
    '  </div>' +
    '</section>'

  const array = document.getElementById('array')
  const entry = document.getElementById('item_2')

  expect(operator.fullQualifiedKeyOf(entry, array)).toEqual('2/item')
})

test('throw an error if the entry is not inside of an array item', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <input type="text" name="item_{{no}}" data-exportkey="item" value="" />' +
    '  </template>' +
    '  <div class="arrayitems">' +
    '    <input type="text" name="item_1" id="item_1" data-exportkey="item" value="" />' +
    '    <input type="text" name="item_3" id="item_3" data-exportkey="item" value="" />' +
    '  </div>' +
    '  <input type="text" name="item_2" id="item_2" data-exportkey="item" value="" />' +
    '</section>'

  const array = document.getElementById('array')
  const entry = document.getElementById('item_2')

  expect(() => operator.fullQualifiedKeyOf(entry, array)).toThrow()
})

test('throw an error if the entry is inside of an subarray', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <section id="innerarray_{{no}}" data-arrayselector=".arrayitems">' +
    '      <template>' +
    '        <input type="text" name="inneritem_{{no}}" data-exportkey="inneritem" value="" />' +
    '      </template>' +
    '      <div class="arrayitems">' +
    '      </div>' +
    '    </section>' +
    '  </template>' +
    '  <div class="arrayitems">' +
    '    <section id="innerarray_1" data-arrayselector=".arrayitems">' +
    '      <template>' +
    '        <input type="text" name="inneritem_{{no}}" data-exportkey="inneritem" value="" />' +
    '      </template>' +
    '      <div class="arrayitems">' +
    '        <input type="text" name="inneritem_1" id="item_1" data-exportkey="inneritem" value="" />' +
    '        <input type="text" name="inneritem_3" id="item_3" data-exportkey="inneritem" value="" />' +
    '      </div>' +
    '    <section>' +
  '</section>'

  const array = document.getElementById('array')
  const entry = document.getElementById('item_3')

  expect(() => operator.fullQualifiedKeyOf(entry, array)).toThrow()
})

test('should return the index as fqn of a container as an item', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <section id="iarray_{{no}}" data-arrayselector=".inneritems">' +
    '      <template><div class="something">' +
    '        <input type="text" name="inneritem_{{no}}" data-exportkey="inneritem" value="" />' +
    '      </div></template>' +
    '      <div class="inneritems">' +
    '      </div>' +
    '    </section>' +
    '  </template>' +
    '  <div class="arrayitems">' +
    '    <section id="iarray_1" data-arrayselector=".inneritems">' +
    '      <template>' +
    '        <input type="text" name="inneritem_{{no}}" data-exportkey="inneritem" value="" />' +
    '      </template>' +
    '      <div class="inneritems">' +
    '        <div class="something1"><input type="text" name="inneritem_1" id="item_1" data-exportkey="inneritem" value="" /></div>' +
    '        <div class="something3"><input type="text" name="inneritem_3" id="item_3" data-exportkey="inneritem" value="" /></div>' +
    '      </div>' +
    '    <section>' +
  '</section>'

  const array = document.getElementById('array')
  const item = document.getElementById('iarray_1')
  const innerArray = document.getElementById('iarray_1')
  const innerItem = document.querySelector('.something3')

  expect(operator.fullQualifiedKeyOf(item, array)).toEqual('1/iarray_1')
  expect(operator.fullQualifiedKeyOf(innerItem, innerArray)).toEqual('2')
})

/* ========================================================== */
/* ====================== elementBy() ======================= */
/* ========================================================== */
test('element should found by full qualified key', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <div><input type="text" name="item_{{no}}" data-exportkey="item" value="" /></div>' +
    '  </template>' +
    '  <div class="arrayitems">' +
    '    <div><input type="text" name="item_1" id="item_1" data-exportkey="item" value="" /></div>' +
    '    <div><input type="text" name="item_2" id="item_2" data-exportkey="item" value="" /></div>' +
    '    <div><input type="text" name="item_3" id="item_3" data-exportkey="item" value="" /></div>' +
    '  </div>' +
    '</section>'

  const array = document.getElementById('array')
  const entry = document.getElementById('item_2')

  expect(operator.elementBy('2/item', array)).toEqual(entry)
})

test('item container should found by full qualified key', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <div><input type="text" name="item_{{no}}" data-exportkey="item" value="" /></div>' +
    '  </template>' +
    '  <div class="arrayitems">' +
    '    <div><input type="text" name="item_1" id="item_1" data-exportkey="item" value="" /></div>' +
    '    <div class="toTest"><input type="text" name="item_2" id="item_2" data-exportkey="item" value="" /></div>' +
    '    <div><input type="text" name="item_3" id="item_3" data-exportkey="item" value="" /></div>' +
    '  </div>' +
    '</section>'

  const array = document.getElementById('array')
  const item = document.querySelector('.toTest')

  expect(operator.elementBy('2', array)).toEqual(item)
})

test('elementBy() should return undefined if array item with index dosn\'t exists', () => {
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <div><input type="text" name="item_{{no}}" data-exportkey="item" value="" /></div>' +
    '  </template>' +
    '  <div class="arrayitems">' +
    '    <div><input type="text" name="item_1" id="item_1" data-exportkey="item" value="" /></div>' +
    '  </div>' +
    '</section>'

  const array = document.getElementById('array')
  
  expect(operator.elementBy('2/item', array)).toBeUndefined()
})

/* ========================================================== */
/* ==================== add Item Listner ==================== */
/* ========================================================== */
test('when adding a item replaces placeholders in aria-labelledby attributes', () =>{
  document.body.innerHTML =
    '<section id="array" data-arrayselector=".arrayitems">' +
    '  <template>' +
    '    <div aria-labelledby="a_{{no}} b_{{no}}">' +
    '      <input class="first" type="text" aria-labelledby="y d_{{no}} e_{{no}}" name="item_{{no}}" data-exportkey="item" value="" />' +
    '      <input class="second" type="text" aria-labelledby="f_{{no}} g_{{no}} x" name="item_{{no}}" data-exportkey="item" value="" />' +
    '    </div>' +
    '  </template>' +
    '  <div class="arrayitems">' +
    '  </div>' +
    '  <button id="addbutton" class="arrayitemcreate" type=button">add</button>' +
    '</section>'

  document.getElementById('addbutton').click()
  document.getElementById('addbutton').click()

  const itemcontainer = document.querySelector('.arrayitems')
  const secondItem = itemcontainer.children[1]
  expect(itemcontainer.childElementCount).toEqual(2)
  expect(secondItem.attributes['aria-labelledby'].value).toEqual('a_no2 b_no2')
  expect(secondItem.querySelector('.first').attributes['aria-labelledby'].value).toEqual('y d_no2 e_no2')
  expect(secondItem.querySelector('.second').attributes['aria-labelledby'].value).toEqual('f_no2 g_no2 x')
})