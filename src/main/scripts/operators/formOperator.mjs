/*  Copyright 2018, 2021 Sebastian Spautz

    This File is Part of "SebastiansIT Form Operator".

    "SebastiansIT Form Operator" is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/.
*/

/** Operator for forms. This operator provides some functions like
 * export and import of the values within a form.
 *
 * @module operators/FormOperator
 * @requires operators/FormContainerOperator
 * @requires operators/FormSectionOperator
 * @requires operators/FormArrayOperator
 */

import * as contOp from './containerOperator.mjs'
import * as sectionOp from './sectionOperator.mjs'
import * as detailsOp from './detailsOperator.mjs'
import * as arrayOp from './arrayOperator.mjs'
import * as entryOp from './entryOperator.mjs'

/**
 * A CSS selector that identifies forms.
 *
 * @constant
 * @type {string}
 */
export const FORM_SELECTOR = 'form'

/** Gets the key of an form.
 *
 * @param {external:HTMLElement} form The DOM element that represents an array.
 * @returns {string} Key of the Form.
 */
export function keyOf (form) {
  const fileNamePattern = form.querySelector('meta[name=filenamepattern]') || document.querySelector('head meta[name=filenamepattern]')
  let fileName = 'form.json'

  if (fileNamePattern) {
    fileName = document.getElementById(fileNamePattern.content).value
  }

  return fileName
}

/** Compute the full qualified key of the given form entry.
 *
 * @param {external:HTMLElement} entry The DOM element representing a form entry.
 * @param {external:HTMLFormElement} form The DOM element represents a form.
 * @returns {string} The full qualified key.
 */
export function fullQualifiedKeyOf (entry, form) {
  let fqk = ''
  let element = entry
  let parent = contOp.parentContainerOf(element)
  while (parent && parent !== form) {
    fqk = `${contOp.fullQualifiedKeyOf(element, parent)}${fqk ? '/' : ''}${fqk}`
    element = parent
    parent = contOp.parentContainerOf(parent)
  }

  if (element !== entry) {
    return `${contOp.keyOf(element)}/${fqk}`
  } else {
    return entryOp.keyOf(entry)
  }
}

/** Gets the element identified by the given full qualified key inside of a form.
 *
 * @param {string} fullQualifiedKey The full qualified key of an element based on the form.
 * @param {external:HTMLFormElement} form The DOM element representing a form.
 * @returns {external:HTMLFormElement|undefined} The DOM element that represents the element with the given key
 *  or undefined if such a element dosn't exists.
 */
export function entryBy (fullQualifiedKey, form) {
  const sliceIndex = fullQualifiedKey.indexOf('/')

  if (sliceIndex > -1) {
    const localKey = fullQualifiedKey.slice(0, sliceIndex)
    let childFqk = fullQualifiedKey.slice(sliceIndex + 1)
    let element = contOp.containerBy(localKey, form)

    do {
      const child = contOp.elementBy(childFqk, element)
      if (child) {
        childFqk = childFqk.replace(contOp.fullQualifiedKeyOf(child, element), '')
        if (childFqk.indexOf('/') === 0) {
          childFqk = childFqk.slice(1)
        }
        element = child
      } else {
        return undefined
      }
    } while (childFqk.indexOf('/') > -1)

    if (childFqk.length > 0) {
      return entryOp.entryBy(childFqk, element)
    }
    return element
  } else {
    return entryOp.entryBy(fullQualifiedKey, form)
  }
}

/** Exports the data of the specified form.
 *
 * @param {external:HTMLElement} form The DOM element that represents an array.
 * @returns {object} The JavaScript object with the data from the form array.
 * @throws {external:Error} An error if the given HTMLElement isn't a valid form.
 */
export function exportData (form) {
  if (!isValidForm(form)) {
    throw new Error(`${form} isn't a valid form. It should match css selector ${FORM_SELECTOR}.`)
  }

  return contOp.exportData(form, FORM_SELECTOR)
}

/** Import the given data into the specified form.
 *
 * @param {external:HTMLElement} form The DOM element that represents an array.
 * @param {object} data A JavaScript object with the data to import.
 * @returns {undefined}
 */
export function importData (form, data) {
  contOp.importData(form, data, FORM_SELECTOR)
}

/** Switch the view mode of the given form.
 *
 * @param {external:HTMLElement} form The DOM element that represents a form.
 * @param {module:view/ViewModes~ViewMode} viewMode The new view mode.
 * @returns {undefined}
 */
export function switchViewMode (form, viewMode) {
  contOp.switchViewMode(form, viewMode)
  form.classList.add(`fop_viewmode_${viewMode}`)
}

/* ========================================================== */
/* ================ Modul internal functions ================ */
/* ========================================================== */
/**  Checks if the given HTMLElement is a valid form.
 *
 * @param {external:HTMLElement} form The DOM element that represents an form.
 * @returns {boolean} True if the HTMLElement is a valid form. False otherwise.
 */
function isValidForm (form) {
  return form.matches(FORM_SELECTOR)
}

/* ========================================================== */
/* ================== Modul initialisation ================== */
/* ========================================================== */
sectionOp.init()
detailsOp.init()
arrayOp.init()
