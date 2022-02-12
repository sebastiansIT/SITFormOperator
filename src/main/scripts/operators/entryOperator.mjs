/*  Copyright 2018, 2019, 2021 Sebastian Spautz

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

import ViewMode from '../view/viewModes.mjs'
/** Operator for form entries. This operator provides some functions to
 * get the key and values of an entry.
 *
 * This operator do **not** support input elements of type *file*.
 *
 * @module operators/FormEntryOperator
 */

/** A CSS selector that identifies entries in forms.
 *
 * @constant
 * @type {string}
 */
export const ENTRY_SELECTOR = 'input:not([type=file]), select, textarea, [contenteditable], sit-select-image'

/** Gets the key of an form entry. The key can be the value of the data attribute
 * "exportkey", the attribute "name" or the ID attribute.
 *
 * @param {external:HTMLElement} entry The DOM element that represents an entry.
 * @returns {string} The key of the given entry.
 * @throws {module:operators/FormEntryOperator~InvalidEntryError} An error if the given HTMLElement isn't a valid entry.
 */
export function keyOf (entry) {
  if (isValidEntry(entry)) {
    return keyOfInternal(entry)
  }
}

/** Returns the value of the given form entry.
 *
 * @param {external:HTMLElement} entry The DOM element that represents an entry.
 * @returns {string|Array<string>|Map<string, module:operators/FormEntryOperator~CheckboxValue>|module:operators/FormEntryOperator~CheckboxValue|undefined} The value
 * or an array of values if the entry is a multi select input
 * or a map of Strings to CheckboxValues it the entry is part of a checkbox group
 * or an object CheckboxValue if the entry represents a  single checkbox.
 * Undefined if no value is set.
 * @throws {module:operators/FormEntryOperator~InvalidEntryError} An error if the given HTMLElement isn't a valid entry.
 */
export function valueOf (entry) {
  if (!isValidEntry(entry)) {
    throw new Error(`${entry} isn't a valid entry. It should match css selector ${ENTRY_SELECTOR}.`)
  }

  // Dropdown
  if (entry.nodeName === 'SELECT' && !entry.multiple) {
    let values = ''
    if (entry.selectedOptions.length > 0) {
      values = entry.selectedOptions.item(0).value
    }
    return values

  // MultiSelect
  } else if (entry.nodeName === 'SELECT' && entry.multiple) {
    const values = []
    for (let i = 0; i < entry.selectedOptions.length; i++) {
      values.push(entry.selectedOptions.item(i).value)
    }
    return values

  // Groups of radiobuttons
  } else if (isRadioButton(entry)) {
    const radiobuttons = document.getElementsByName(entry.attributes.name.nodeValue)
    for (let i = 0; i < radiobuttons.length; i++) {
      if (radiobuttons[i].checked) {
        return radiobuttons[i].value
      }
    }

  // Checkboxes and checkbox groups
  } else if (isCheckbox(entry)) {
    const checkboxes = document.getElementsByName(entry.attributes.name.nodeValue)
    const value = {}
    for (let i = 0; i < checkboxes.length; i++) {
      const state = {}
      state.checked = checkboxes[i].checked
      state.enabled = !checkboxes[i].disabled
      value[checkboxes[i].value] = state
    }

    if (Object.keys(value).length <= 0) {
      return undefined
    } else if (Object.keys(value).length === 1) {
      return value[Object.keys(value)[0]]
    } else {
      return value
    }

  // Editable text
  } else if (entry.hasAttribute('contenteditable')) {
    return entry.textContent

  // All other elements (with a value attribute)
  } else {
    return entry.value
  }
}

/** Sets the value of the given form entry.
 *
 * @param {external:HTMLElement} entry The DOM element that represents an entry.
 * @param {string|Array<string>|module:operators/FormEntryOperator~CheckboxValue} value The value
 * or an array of values if the entry is a multi select input
 * or an object CheckboxValue if the entry represents a Checkbox.
 * @returns {undefined}
 * @throws {module:operators/FormEntryOperator~InvalidEntryError} An error if the given HTMLElement isn't a valid entry.
 */
export function valueFor (entry, value) {
  if (!isValidEntry(entry)) {
    throw new Error(`${entry} isn't a valid entry. It should match css selector ${ENTRY_SELECTOR}.`)
  }

  // Dropdown + Multiselect
  if (entry.nodeName === 'SELECT') {
    entry.value = '' // reset
    if (Array.isArray(value)) {
      value.forEach(element => {
        entry.querySelector('[value="' + element + '"]').selected = true
      })
    } else {
      entry.querySelector('[value="' + value + '"]').selected = true
    }

  // Groups of radiobuttons
  } else if (isRadioButton(entry)) {
    const radiobuttons = document.getElementsByName(entry.attributes.name.nodeValue)
    for (let i = 0; i < radiobuttons.length; i++) {
      if (radiobuttons[i].value === value) {
        radiobuttons[i].checked = true
      } else {
        radiobuttons[i].checked = false
      }
    }

  // Checkboxes
  } else if (isCheckbox(entry)) {
    if (!Object.prototype.hasOwnProperty.call(value, 'checked')) { // Hopfully nobody sets value of a checkbox inside a group to "checked"
      Object.keys(value).forEach((item, i) => {
        const checkbox = document.querySelector(`input[type="checkbox"][value=${item}]`)
        // TODO what if checkbox isn't found? Should I create a hidden checkbox as a sibbling of the last on in the group?
        if (checkbox) {
          checkbox.checked = value[item].checked
          checkbox.disabled = !value[item].enabled || value[item].disabled // last one is for backwards compatibility
        }
      })
    } else {
      entry.checked = value.checked
      entry.disabled = !value.enabled || value.disabled // last one is for backwards compatibility
    }

  // Contenteditable
  } else if (entry.hasAttribute('contenteditable')) {
    entry.textContent = value

  // All other inputs
  } else {
    entry.value = value
  }
}

/** Find the element for the given key inside of the parent element.
 *
 * @param {string} key The key of the entry to find.
 * @param {external:HTMLElement} parent The DOM element that represents a container.
 * @returns {external:HTMLElement|undefined} The DOM element represents the entry with the given key.
 */
export function entryBy (key, parent) {
  return parent.querySelector(`[data-exportkey='${key}']`) ||
    parent.querySelector(`[name='${key}']`) ||
    parent.querySelector(`#${key}`) ||
    undefined
}

/** Switch the view mode of the given entry.
 *
 * @param {external:HTMLElement} entry The DOM element that represents a entry.
 * @param {module:view/ViewModes~ViewMode} viewMode The new view mode.
 * @returns {undefined}
 */
export function switchViewMode (entry, viewMode) {
  if (viewMode === ViewMode.READ) {
    // Dropdown + Multiselect
    if (entry.nodeName === 'SELECT') {
      const valueDom = document.createElement('p')
      valueDom.id = entry.id
      valueDom.classList.add('selectreplacement')
      const valueText = []
      for (let i = 0; i < entry.selectedOptions.length; i++) {
        let text = entry.selectedOptions.item(i).label
        if (entry.selectedOptions.item(i).title) {
          text += ' (' + entry.selectedOptions.item(i).title + ')'
        }
        valueText.push(text)
      }
      valueDom.textContent = valueText.join(', ')
      entry.hidden = true
      entry.insertAdjacentElement('afterend', valueDom)
    }

    // Textinput and Numberinput from edit to view
    if (entry.nodeName === 'INPUT' &&
        entry.type !== 'hidden' && entry.type !== 'range' &&
        entry.type !== 'checkbox' && entry.type !== 'radio' &&
        entry.type !== 'url') {
      const valueDom = document.createElement('p')
      valueDom.id = entry.id
      valueDom.classList.add('inputreplacement')
      valueDom.classList.add('input' + entry.type + 'replacement')
      valueDom.textContent = entry.value
      entry.hidden = true
      entry.insertAdjacentElement('afterend', valueDom)
    } else if (entry.nodeName === 'INPUT' &&
        (entry.type === 'checkbox' || entry.type === 'radio' ||
        entry.type === 'range')) {
      entry.disabled = true
    } else if (entry.nodeName === 'INPUT' && entry.type === 'url') {
      const valueDom = document.createElement('p')
      valueDom.id = entry.id
      valueDom.classList.add('inputreplacement')
      valueDom.classList.add('input' + entry.type + 'replacement')
      if (entry.value) {
        const ankerDom = document.createElement('a')
        ankerDom.href = entry.value
        ankerDom.innerHTML = 'www'
        valueDom.appendChild(ankerDom)
      } else {
        valueDom.innerHTML = '&ndash;'
      }
      entry.hidden = true
      entry.insertAdjacentElement('afterend', valueDom)
    }

    if (entry.nodeName === 'BUTTON') {
      entry.hidden = true
    }

    // Textarea from edit to view
    if (entry.nodeName === 'TEXTAREA') {
      const valueDom = document.createElement('p')
      valueDom.id = entry.id
      valueDom.classList.add('textareareplacement')
      valueDom.textContent = entry.value
      valueDom.innerHTML = valueDom.textContent.replace(/\n/g, '<br />')
      entry.hidden = true
      entry.insertAdjacentElement('afterend', valueDom)
    } else if (entry.nodeName === 'SIT-SELECT-IMAGE') {
      entry.setAttribute('readonly', 'readonly')
    }
  } else {
    if ((entry.nodeName === 'INPUT' &&
        entry.type !== 'hidden' && entry.type !== 'range' &&
        entry.type !== 'checkbox' && entry.type !== 'radio') ||
        entry.nodeName === 'TEXTAREA' ||
        entry.nodeName === 'SELECT') {
      entry.hidden = false
      if (entry.nextElementSibling && (
        entry.nextElementSibling.classList.contains('selectreplacement') ||
        entry.nextElementSibling.classList.contains('inputreplacement') ||
        entry.nextElementSibling.classList.contains('textareareplacement')
      )) {
        entry.parentNode.removeChild(entry.nextElementSibling)
      }
    }

    if (entry.nodeName === 'INPUT' &&
        (entry.type === 'checkbox' || entry.type === 'radio' ||
        entry.type === 'range')) {
      entry.disabled = false
    }

    if (entry.nodeName === 'BUTTON') {
      entry.hidden = false
    } else if (entry.nodeName === 'SIT-SELECT-IMAGE') {
      entry.removeAttribute('readonly', 'readonly')
    }
  }
}

/* ========================================================== */
/* ================ Modul internal functions ================ */
/* ========================================================== */

/** Gets the key of an form entry. The key can be the value of the data attribute
 * "exportkey", the attribute "name" or the ID attribute.
 *
 * @param {external:HTMLElement} entry The DOM element that represents an entry.
 * @returns {string|undefined} The key of the given entry or undefined if no key available.
 */
function keyOfInternal (entry) {
  if (entry.dataset.exportkey) {
    return entry.dataset.exportkey
  } else if (entry.name) {
    return entry.name
  } else if (entry.id) {
    return entry.id
  } else {
    return undefined
  }
}

/** Checks if the given HTMLElement is a valid form entry.
 * Check {@link module:operators/FormEntryOperator~InvalidEntryError|InvalidEntryError}
 * for a definition of invalidity.
 *
 * @param {external:HTMLElement} entry The DOM element that represents an form entry.
 * @returns {boolean} True if the HTMLElement is a valid entry.
 * @throws {module:operators/FormEntryOperator~InvalidEntryError} Throws an error with an array of messages if the given entry isn't valid.
 */
function isValidEntry (entry) {
  const errorList = []
  if (!entry.matches(ENTRY_SELECTOR)) {
    errorList.push(`${entry} isn't a valid entry. It should match css selector ${ENTRY_SELECTOR}.`)
  }

  const key = keyOfInternal(entry)
  if (!key) {
    errorList.push(`${entry} has no key. There is no data attribute "exportkey", no name attribute and no ID attribute.`)
  } else if (key.indexOf('/') > -1) {
    errorList.push(`${entry} isn't a valid entry. ID should not contains slashes.`)
  }

  if (errorList.length > 0) {
    throw new Error(errorList)
  } else {
    return true
  }
}

/** Check if a HTMLElement is a checkbox.
 *
 * @param {external:HTMLElement} htmlElement A HTMLElement to check.
 * @returns {boolean} True if the htmlElement is a checkbox.
 */
function isCheckbox (htmlElement) {
  return htmlElement.nodeName === 'INPUT' &&
    htmlElement.attributes.type &&
    htmlElement.attributes.type.nodeValue === 'checkbox'
}

/** Check if a HTMLElement is a radio button.
 *
 * @param {external:HTMLElement} htmlElement A HTMLElement to check.
 * @returns {boolean} True if the htmlElement is a radio button.
 */
function isRadioButton (htmlElement) {
  return htmlElement.nodeName === 'INPUT' &&
    htmlElement.attributes.type &&
    htmlElement.attributes.type.nodeValue === 'radio'
}

/** The value of an checkbox entry is a composed object with two flags:
 * - checked
 * - disabled.
 *
 * @typedef CheckboxValue
 * @type {object}
 * @property {boolean} checked True if the checkbox is checkd.
 * @property {boolean} enabled True if the checkbox is not disabled.
 */

/** An Error thrown when a invalid entry is checked for validity. Validity means:
 * - The element matches the CSS selector *ENTRY_SELECTOR* and
 * - a data attribute **exportkey**, a **name** attribute or a **ID** attribute is set and
 * - the key don't contains a slash.
 *
 * @typedef InvalidEntryError
 * @type {external:Error}
 * @property {Array<string>} message An array of messages why the entry is invalid.
 */
