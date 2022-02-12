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

/** Operator for form sections. This operator gives you some functions like
 * export and import of the values inside of a section.
 *
 * @module operators/FormSectionOperator
 * @requires operators/ContainerOperator
 */

import * as contOp from './containerOperator.mjs'

/**
 * A CSS selector that identifies sections in forms.
 *
 * @constant
 * @type {string}
 */
export const SECTION_SELECTOR = 'div[id]:not([data-arrayselector]), section[id]:not([data-arrayselector])'

/** Gets the key of an section. See
 * {@link module:operators/FormContainerOperator.keyOf| ContainerOperator.keyOf()}
 * for details.
 *
 * @param {external:HTMLElement} section The DOM element that represents a section.
 * @returns {string} The key of the given section.
 * @throws {module:operators/FormSectionOperator~InvalidSectionError} An error if
 * the given HTMLElement isn't a valid section.
 */
export function keyOf (section) {
  if (isValidSection(section)) {
    return contOp.keyOf(section, SECTION_SELECTOR)
  }
}

/** Exports the data of the specified section.
 *
 * @param {external:HTMLElement} section The DOM element that represents a section.
 * @returns {object} The JavaScript object with the data from the section.
 * @throws {module:operators/FormSectionOperator~InvalidSectionError} An error if
 * the given HTMLElement isn't a valid section.
 */
export function exportData (section) {
  if (isValidSection(section)) {
    return contOp.exportData(section)
  }
}

/** Import the given data into the specified section.
 *
 * @param {external:HTMLElement} section The DOM element that represents a section.
 * @param {object} data The JavaScript object to import into the section.
 * @returns {undefined}
 * @throws {module:operators/FormSectionOperator~InvalidSectionError} An error if
 * the given HTMLElement isn't a valid section.
 */
export function importData (section, data) {
  if (isValidSection(section)) {
    return contOp.importData(section, data)
  }
}

/** Initialise the operator.
 *
 * @returns {undefined}
 */
export function init () {
  contOp.registerContainerTyp({
    selector: SECTION_SELECTOR,
    export: exportData,
    import: importData
  })
}

/* ========================================================== */
/* ================ Modul internal functions ================ */
/* ========================================================== */
/** Checks if the given HTMLElement is a valid form section.
 * Check {@link module:operators/FormSectionOperator~InvalidSectionError|InvalidSectionError}
 * for a definition of invalidity.
 *
 * @param {external:HTMLElement} section The DOM element that represents an form section.
 * @returns {boolean} True if the HTMLElement is a valid section.
 * @throws {module:operators/FormSectionOperator~InvalidSectionError} Throws an error
 * with an array of messages if the given section isn't valid.
 */
function isValidSection (section) {
  const errorList = []
  if (!section.matches(SECTION_SELECTOR)) {
    errorList.push(`${section} isn't a valid section. It should match css selector ${SECTION_SELECTOR}.`)
  }
  try {
    const key = contOp.keyOf(section)
    if (!key) {
      errorList.push(`${section} has no key. There is no data attribute "exportkey" and no ID attribute.`)
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

/** An Error thrown when a invalid section is checked for validity. Validity means:
 * - The element matches the CSS selector *SECTION_SELECTOR* and
 * - a data attribute **exportkey** or a **ID** attribute is set and
 * - the key don't contains a slash.
 *
 * @typedef InvalidSectionError
 * @type {external:Error}
 * @property {Array<string>} message An array of messages why the section is invalid.
 */
