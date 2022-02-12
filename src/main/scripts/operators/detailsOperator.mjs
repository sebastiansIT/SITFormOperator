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

/** Operator for details elements. This operator provides some functions like
 * export and import of the values within an details element include the opens
 * state.
 *
 * @module operators/FormDetailOperator
 * @requires operators/ContainerOperator
 * @requires operators/FormEntryOperator
 */

import * as contOp from './containerOperator.mjs'

/** A CSS selector that identifies arrays in forms.
 *
 * @constant
 * @type {string}
 */
export const DETAILS_SELECTOR = 'details'

/** Gets the key of an details. See
 * {@link module:operators/FormContainerOperator.keyOf|ContainerOperator.keyOf()}
 * for details.
 *
 * @param {external:HTMLElement} details The DOM element that represents an details block.
 * @returns {string} The key of the given details block.
 * @throws {module:operators/FormArrayOperator~InvalidArrayError} An error if
 * the given HTMLElement isn't a valid details block.
 */
export function keyOf (details) {
  if (isValidDetails(details)) {
    return contOp.keyOf(details, DETAILS_SELECTOR)
  }
}

/** Exports the data of the specified details block.
 *
 * @param {external:HTMLDetailsElement} details The DOM element that represents an details block.
 * @returns {Array} The JavaScript array with the data from the details block.
 * @throws {module:operators/DetailsArrayOperator~InvalidDetailsError} An error if
 * the given HTMLElement isn't a valid details block.
 */
export function exportData (details) {
  if (isValidDetails(details)) {
    const detailsData = contOp.exportData(details)
    detailsData.openDetails = details.open
    return detailsData
  }
}

/** Imports the given data into the specified details block.
 *
 * @param {external:HTMLElement} details The DOM element that represents an details block.
 * @param {Array} data A JavaScript array to import into the details block.
 * @returns {undefined}
 * @throws {module:operators/DetailsArrayOperator~InvalidDetailsError} An error if
 * the given HTMLElement isn't a valid details block.
 */
export function importData (details, data) {
  if (isValidDetails(details)) {
    details.open = data.openDetails
    return contOp.importData(details, data)
  }
}

/** Initialise the operator and all arrays in the actual HTML document.
 *
 * @returns {undefined}
 */
export function init () {
  contOp.registerContainerTyp({
    selector: DETAILS_SELECTOR,
    export: exportData,
    import: importData
  })
}

/* ========================================================== */
/* ================ Modul internal constants ================ */
/* ========================================================== */

/* ========================================================== */
/* ================ Modul internal functions ================ */
/* ========================================================== */
/** Checks if the given HTMLElement is a valid form entry.
 * Check {@link module:operators/DetailsArrayOperator~InvalidDetailsError|InvalidDetailsError}
 * for a definition of invalidity.
 *
 * @param {external:HTMLDetailsElement} details The DOM element that represents an details.
 * @returns {boolean} True if the HTMLElement is a valid details block.
 * @throws {module:operators/FormDetailsOperator~InvalidDetailsError} Throws an error
 * with an array of messages if the given details block isn't valid.
 */
function isValidDetails (details) {
  const errorList = []
  if (!details.matches(DETAILS_SELECTOR)) {
    errorList.push(`${details} isn't a valid details block. It should match css selector ${DETAILS_SELECTOR}.`)
  }
  try {
    const key = contOp.keyOf(details)
    if (!key) {
      errorList.push(`${details} has no key. There is no data attribute "exportkey" and no ID attribute.`)
    }
  } catch (error) {
    errorList.push(error.message)
  }

  if (errorList.length > 0) {
    throw new Error(errorList)
  } else {
    return true
  }
}

/** An Error thrown when a invalid array is checked for validity. Validity means:
 * - The element matches the CSS selector *DETAILS_SELECTOR* and
 * - a data attribute **exportkey** or a **ID** attribute is set and
 * - the key don't contains a slash.
 *
 * @typedef InvalidDetailsError
 * @type {external:Error}
 * @property {Array<string>} message An array of messages why the details block is invalid.
 */
