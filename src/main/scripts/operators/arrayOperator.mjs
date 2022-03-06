/*  Copyright 2018, 2021 Sebastian Spautz

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

/** Operator for form arrays. This operator provides some functions like
 * export and import of the values within an array.
 *
 * An Array is a special tyo af a container. In it's abstract form it contains
 * a list of items, a template to create new items from and a button to create
 * a new item based on the template.
 *
 * In HTML the array can by any HTML element with a data attribute named
 * "arrayselector". Inside of this Element normaly exists another HTML element
 * that acts as the container for all items. The item container needs a class or
 * ID to build a CSS selector written down in the data attribute "arrayselector"
 * of the array element.
 *
 * In addition the template is represented by a template HTML element inside of
 * the arrays HTML element.
 *
 * @module operators/FormArrayOperator
 * @requires operators/ContainerOperator
 * @requires operators/FormEntryOperator
 */

import * as contOp from './containerOperator.mjs'
import * as entryOp from './entryOperator.mjs'

/* ========================================================== */
/* ================ Modul external constants ================ */
/* ========================================================== */
/** A CSS selector that identifies arrays in forms.
 *
 * @constant
 * @type {string}
 */
export const ARRAY_SELECTOR = '[data-arrayselector]'

/** A CSS selector that identifies buttons to add new items into an array.
 *
 * @constant
 * @type {string}
 */
 export const ITEM_ADD_CONTROL_SELECTOR = '.arrayitemcreate'

 /**  A CSS selector that identifies buttons to remove a item from an array.
  *
  * @constant
  * @type {string}
  */
 export const ITEM_REMOVE_CONTROL_SELECTOR = '.arrayitemremove'

/* ========================================================== */
/* ================ Modul external functions ================ */
/* ========================================================== */
/** Gets the key of an array. See
 * {@link module:operators/FormContainerOperator.keyOf|ContainerOperator.keyOf()}
 * for details.
 *
 * @param {external:HTMLElement} array The DOM element that represents an array.
 * @returns {string} The key of the given array.
 * @throws {module:operators/FormArrayOperator~InvalidArrayError} An error if
 * the given HTMLElement isn't a valid array.
 */
export function keyOf (array) {
  if (isValidArray(array)) {
    return contOp.keyOf(array, ARRAY_SELECTOR)
  }
}

/** Exports the data of the specified array.
 *
 * @param {external:HTMLElement} array The DOM element that represents an array.
 * @returns {Array} The JavaScript array with the data from the form array.
 * @throws {module:operators/FormArrayOperator~InvalidArrayError} An error if
 * the given HTMLElement isn't a valid array.
 */
export function exportData (array) {
  if (isValidArray(array)) {
    const arrayItemSelector = getItemSelector(array, array.dataset.arrayselector)
    const arrayItems = getItems(array, array.dataset.arrayselector)
    const arrayData = []

    arrayItems.forEach(arrayItem => {
      const containingArray = arrayItem.parentElement.closest(ARRAY_SELECTOR)
      if (!containingArray || containingArray === array) {
        // is Item is an entry get key and value
        if (arrayItem.matches(entryOp.ENTRY_SELECTOR)) {
          arrayData.push(entryOp.valueOf(arrayItem))

        // is Item is Array -> call arrayOperator.exportData()
        } else if (arrayItem.matches(ARRAY_SELECTOR)) {
          arrayData.push(exportData(arrayItem))

        //  else call containerOperator.mjs
        } else {
          arrayData.push(contOp.exportData(
            arrayItem,
            arrayItemSelector // ParentSelector
          ))
        }
      }
    })

    return arrayData
  }
}

/** Imports the given data into the specified array.
 *
 * @param {external:HTMLElement} array The DOM element that represents an array.
 * @param {Array} data A JavaScript array to import into the array.
 * @returns {undefined}
 * @throws {module:operators/FormArrayOperator~InvalidArrayError} An error if
 * the given HTMLElement isn't a valid array.
 */
export function importData (array, data) {
  if (isValidArray(array)) {
    const arrayItemContainer = getItemContainer(array, array.dataset.arrayselector)
    const arrayItemSelector = getItemSelector(array, array.dataset.arrayselector)
    let arrayItems = getItems(array, array.dataset.arrayselector)

    // remove HTMLElements if the data to import have less items then HTMLElements available.
    for (let i = arrayItems.length; i > data.length; i--) {
      arrayItemContainer.removeChild(arrayItems[i - 1])
    }
    // add HTMLElements if the data to import have more items than HTMLElements available.
    for (let i = arrayItems.length; i < data.length; i++) {
      addArrayItem(array)
    }

    arrayItems = getItems(array, array.dataset.arrayselector)
    data.forEach((item, i) => {
      if (arrayItems[i].matches(entryOp.ENTRY_SELECTOR)) {
        entryOp.valueFor(arrayItems[i], item)
      } else {
        contOp.importData(arrayItems[i], item, arrayItemSelector)
      }
    })
  }
}

/** Initialise the operator and all arrays in the actual HTML document.
 *
 * @returns {undefined}
 */
export function init () {
  contOp.registerContainerTyp({
    selector: ARRAY_SELECTOR,
    export: exportData,
    import: importData,
    fullQualifiedKeyOf: fullQualifiedKeyOf,
    elementBy: elementBy
  })

  document.addEventListener('click', event => {
    // Handle buttons to remove array items
    if (event.target.matches(ITEM_REMOVE_CONTROL_SELECTOR)) {
      event.preventDefault()

      const array = event.target.closest(ARRAY_SELECTOR)
      const arrayItem = event.target.closest(getItemSelector(array, array.dataset.arrayselector))
      arrayItem.parentElement.removeChild(arrayItem)
    }

    // Handle buttons to add new array items
    if (event.target.matches(ITEM_ADD_CONTROL_SELECTOR)) {
      event.preventDefault()

      let array
      if (event.target.dataset.arrayid) {
        array = document.getElementById(event.target.dataset.arrayid)
      } else {
        array = event.target.closest(ARRAY_SELECTOR)
      }
      addArrayItem(array)
    }
  }, false)
}

/** Creates a full qualified key for an entry inside of an array.
 *
 * @param {external:HTMLElement} entryOrContainer The DOM element that represents the entry to get a key for.
 * @param {external:HTMLElement} array The DOM element that represents the array containing the given entry.
 * @returns {string} A full qualified key of the given entry inside of the also given array.
 * @throws {external:Error} Throws if the entry is not inside of an Container.
 * @throws {external:Error} Throws if the entry is not inside of the given Array.
 */
export function fullQualifiedKeyOf (entryOrContainer, array) {
  const items = getItems(array, array.dataset.arrayselector)
  const index = [...items].indexOf(entryOrContainer.closest(getItemSelector(array, array.dataset.arrayselector))) + 1

  if (index <= 0) {
    throw Error(`The given entry "${entryOp.keyOf(entryOrContainer)}" is outside of the item container.`)
  }

  if (entryOrContainer.matches(contOp.containerSelector())) {
    return `${index}/${contOp.keyOf(entryOrContainer)}`
  } else {
    const parentContainer = contOp.parentContainerOf(entryOrContainer)
    if (!parentContainer) {
      throw Error(`The given entry "${entryOp.keyOf(entryOrContainer)}" is not inside of an Array.`)
    } else if (parentContainer !== array) {
      throw Error(`The given entry "${entryOp.keyOf(entryOrContainer)}" is not inside of the Array.`)
    }

    if (entryOrContainer.matches(entryOp.ENTRY_SELECTOR)) {
      return `${index}/${entryOp.keyOf(entryOrContainer)}`
    } else {
      return `${index}`
    }
  }
}

/** Gets the entry identified by the given full qualified key inside of an array.
 *
 * @param {string} fullQualifiedKey The full qualified key of an entry.
 * @param {external:HTMLElement} array The DOM element that represents the array containing the given entry.
 * @returns {external:HTMLElement|undefined} The DOM element that represents the element with the given key 
 *  or undefined it no element with the given key exists.
 */
export function elementBy (fullQualifiedKey, array) {
  // TODO wenn die Entries ohne umschließendes Element als Item genutzt werden muss der Entry direkt aus dem Index genommen werden.
  const parts = fullQualifiedKey.split('/')
  const index = parseInt(parts[0])
  const arrayItem = getItems(array, array.dataset.arrayselector)[index - 1]
  if (arrayItem) {
    // TODO was ist wenn der Inhalt des Items ein Container ist?
    return entryOp.entryBy(parts[1], arrayItem)
  }
}

/** Create a new array item from a template element inside the given array and
 * append it to the array.
 *
 * @param {external:HTMLElement} array The DOM element that represents an array.
 * @returns {undefined}
 */
export function addArrayItem (array) {
  const newArrayItem = document.importNode(array.querySelector('template').content, true)
  const arrayContainer = getItemContainer(array, array.dataset.arrayselector)
  let index = arrayContainer.childElementCount + 1

  // falls ein manueller Index gesetzt ist diesen anstelle des child element counts verwenden.
  const lastElement = arrayContainer.lastElementChild
  if (lastElement && lastElement.dataset.index) {
    index = parseInt(lastElement.dataset.index) + 1
  }

  newArrayItem.firstElementChild.classList.add(SHEET_ARRAY_ITEM_HTMLCLASS)
  populateTemplate(newArrayItem, index)
  arrayContainer.appendChild(newArrayItem)
}

/* ========================================================== */
/* ================ Modul internal constants ================ */
/* ========================================================== */
/** HTML class that will be added to newly created array items.
 *
 * @constant
 * @type {string}
 */
const SHEET_ARRAY_ITEM_HTMLCLASS = 'arrayitem'

/* ========================================================== */
/* ================ Modul internal functions ================ */
/* ========================================================== */
/** Checks if the given HTMLElement is a valid form entry.
 * Check {@link module:operators/FormArrayOperator~InvalidArrayError|InvalidArrayError}
 * for a definition of invalidity.
 *
 * @param {external:HTMLElement} array The DOM element that represents an form array.
 * @returns {boolean} True if the HTMLElement is a valid array.
 * @throws {module:operators/FormArrayOperator~InvalidArrayError} Throws an error
 * with an array of messages if the given array isn't valid.
 */
function isValidArray (array) {
  const errorList = []
  if (!array.matches(ARRAY_SELECTOR)) {
    errorList.push(`${array} isn't a valid array. It should match css selector ${ARRAY_SELECTOR}.`)
  }
  try {
    const key = contOp.keyOf(array)
    if (!key) {
      errorList.push(`${array} has no key. There is no data attribute "exportkey" and no ID attribute.`)
    }
  } catch (error) {
    errorList.push(error.message)
  }

  if (array.dataset.arrayselector &&
      array.dataset.arrayselector !== '.' &&
      !array.querySelector(array.dataset.arrayselector)) {
    errorList.push(`${array} contains no item container width selector ${array.dataset.arrayselector}.`)
  }

  if (errorList.length > 0) {
    throw new Error(errorList)
  } else {
    return true
  }
}

/** Populate a new array item. This means, the function manipulate text content
 * and attribute values to add the index number.
 * <ol><li>add a data attribute **index** to the newArrayItem</li>
 * <li>prefix the text content in child element with ID <strong>name</strong> with the index</li>
 * <li>replace *{{no}}* inside of the attributes <strong>for</strong>,
 * <strong>id</strong>, <strong>name</strong>,
 * <strong>aria-label</strong>, <strong>aria-labelledby</strong></li>
 * <li>replace *{{no}}* in **legend** elements content</li></ol>.
 *
 * @param {external:HTMLElement} newArrayItem The DOM element that represents
 * an array item.
 * @param {number} index The index of the new item.
 * @returns {undefined}
 */
function populateTemplate (newArrayItem, index) {
  const template = newArrayItem.firstElementChild
  let elementWithTemplateAttributes

  template.dataset.index = index

  // Findet elemente mit der ID "name" und fügt vor dem Textinhalt den Index ein.
  elementWithTemplateAttributes = template.querySelectorAll('#name')
  elementWithTemplateAttributes.forEach(element => {
    element.removeAttribute('id')
    element.textContent = index.toString() + '. ' + element.textContent
  })

  // HTML-Attribute for
  elementWithTemplateAttributes = template.querySelectorAll('[for*="{{no}}"]')
  elementWithTemplateAttributes.forEach(element => {
    element.attributes.for.textContent = element.attributes.for.textContent.replace('{{no}}', 'no' + index)
  })

  // HTML-Attribute ID
  if (template.attributes.id) {
    template.attributes.id.textContent = template.attributes.id.textContent.replace('{{no}}', 'no' + index)
  }
  elementWithTemplateAttributes = template.querySelectorAll('[id*="{{no}}"]')
  elementWithTemplateAttributes.forEach(element => {
    element.attributes.id.textContent = element.attributes.id.textContent.replace('{{no}}', 'no' + index)
  })

  // HTML-Attribute name
  if (template.name) {
    template.name = template.name.replace('{{no}}', 'no' + index)
  }
  elementWithTemplateAttributes = template.querySelectorAll('[name*="{{no}}"]')
  elementWithTemplateAttributes.forEach(element => {
    element.attributes.name.textContent = element.attributes.name.textContent.replace('{{no}}', 'no' + index)
  })

  // HTML-Attribute title
  if (template.title) {
    template.title = template.title.replace('{{no}}', 'no' + index)
  }
  elementWithTemplateAttributes = template.querySelectorAll('[title*="{{no}}"]')
  elementWithTemplateAttributes.forEach(element => {
    element.attributes.title.textContent = element.attributes.title.textContent.replace('{{no}}', index)
  })

  // ARIA-Attribute label
  if (template.attributes['aria-label']) {
    template.attributes['aria-label'].textContent = template.attributes['aria-label'].textContent.replace('{{no}}', index)
  }
  elementWithTemplateAttributes = template.querySelectorAll('[aria-label*="{{no}}"]')
  elementWithTemplateAttributes.forEach(element => {
    element.attributes['aria-label'].textContent =
      element.attributes['aria-label'].textContent.replace('{{no}}', index)
  })

  // ARIA-Attribute labelledby
  const LABELLEdBY_SELEKTOR = '[aria-labelledby*="{{no}}"]'
  if (template.matches(LABELLEdBY_SELEKTOR)) {
    template.attributes['aria-labelledby'].textContent =
      template.attributes['aria-labelledby'].textContent.replaceAll('{{no}}', 'no' + index)
  }
  elementWithTemplateAttributes = template.querySelectorAll(LABELLEdBY_SELEKTOR)
  elementWithTemplateAttributes.forEach(element => {
    element.attributes['aria-labelledby'].textContent =
      element.attributes['aria-labelledby'].textContent.replaceAll('{{no}}', 'no' + index)
  })

  // Text Content in HTML-Elements legend
  elementWithTemplateAttributes = template.querySelectorAll('legend')
  elementWithTemplateAttributes.forEach(element => {
    element.textContent = element.textContent.replace('{{no}}', index)
  })
}

/** Finds the Element representing the container with all the items.
 *
 * @param {external:HTMLElement} array The DOM element that represents an array.
 * @param {string} arraySelector The CSS selector that identifies the container.
 * @returns {external:HTMLElement} The container for the items.
 */
function getItemContainer (array, arraySelector) {
  if (arraySelector.trim() === '' || arraySelector === '.') {
    return array
  } else {
    return array.querySelector(array.dataset.arrayselector)
  }
}

/** Finds the Elements representing the items inside the array.
 *
 * @param {external:HTMLElement} array The DOM element that represents an array.
 * @param {string} arraySelector The CSS selector that identifies the container
 * for the items.
 * @returns {Array<external:HTMLElement>} The items.
 */
function getItems (array, arraySelector) {
  if (arraySelector.trim() === '' || arraySelector === '.') {
    return Array.from(array.children).filter((element) => {
      return !element.matches('template')
    })
  } else {
    return array.querySelectorAll(getItemSelector(array, arraySelector))
  }
}

/** Creates the CSS selector for the items.
 *
 * @param {external:HTMLElement} array The DOM element that represents an array.
 * @param {string} arraySelector The CSS selector that identifies the container
 * for the items.
 * @returns {string} A CSS selector.
 */
function getItemSelector (array, arraySelector) {
  if (arraySelector.trim() === '' || arraySelector === '.') {
    return `[data-arrayselector="${array.dataset.arrayselector}"] > *`
  } else {
    return `${array.dataset.arrayselector} > *`
  }
}

/** An Error thrown when a invalid array is checked for validity. Validity means:
 * - The element matches the CSS selector *ARRAY_SELECTOR* and
 * - a data attribute **exportkey** or a **ID** attribute is set and
 * - the key don't contains a slash.
 *
 * @typedef InvalidArrayError
 * @type {external:Error}
 * @property {Array<string>} message An array of messages why the array is invalid.
 */
