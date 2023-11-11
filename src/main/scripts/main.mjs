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

/** Entry point for SebastiansIT Form Operator. In this module
 * the public functions are exposed.
 *
 * @module Main
 * @requires operators/FormOperator
 * @requires persistence/PersistenceManager
 * @requires view/ViewModes
 */

import * as formOp from './operators/formOperator.mjs'
import * as pers from './persistence/persistenceManager.mjs'
import PersFile from './persistence/localFileProvider.mjs'
import ViewModeInternal from './view/viewModes.mjs'

/** Displays a selection of persistence targets and saves the data from the
 * form into the file selected there.
 *
 * @param {external:HTMLElement} form The DOM element that represents a form.
 * @returns {module:persistence/PersistenceManager~SaveFormPromise} A promise fulfilled with the saved data.
 */
export function save (form) {
  const data = formOp.exportData(form)
  return pers.save(data, form.title || form.name || document.title)
}

/** Displays a selection for previously saved records and loads the data
 * selected there into the form.
 *
 * @param {external:HTMLElement} form The DOM element that represents a form.
 * @returns {module:persistence/PersistenceManager~LoadFormPromise} A promise fulfilled with the loaded data.
 * @fires loadedForm
 */
export function load (form) {
  /** Event fired if a dataset is loaded into a form.
   *
   * @event loadedForm
   * @type {external:CustomEvent}
   */
  const event = new CustomEvent('loadedForm', {})

  return pers.load().then(data => {
    formOp.importData(form, data)
    form.dispatchEvent(event)
    return data
  })
}

/** Switch the view mode of the given form.
 *
 * @param {external:HTMLElement} form The DOM element that represents a form.
 * @param {module:view/ViewModes~ViewMode} viewMode The new view mode.
 * @returns {undefined}
 */
export function switchViewMode (form, viewMode) {
  formOp.switchViewMode(form, viewMode)
}

/** The different modes to show a form.
 *
 * @type {module:view/ViewModes~ViewMode}
 */
export const ViewMode = ViewModeInternal

/** Check for Query parameters named like a form inside of the page. For such
 * parameters tries to load the value as an URL and initalise the form with the
 * JSON from this place.
 *
 * @fires loadedForm
 * @returns {external:Promise} A promise fulfilled when all giben data are loaded.
 */
export function loadInitial () {
  const fetchPromises = []
  const searchParams = new URL(window.location.href).searchParams
  searchParams.forEach((value, key) => {
    const form = document.getElementById(key)
    if (form) {
      const sheetURL = value
      if (sheetURL) {
        fetchPromises.push(window.fetch(sheetURL)
          .then(response => {
            if (!response.ok) {
              throw new Error('HTTP error ' + response.status)
            }
            return response.json()
          })
          .then(data => {
            const event = new CustomEvent('loadedSheet', {}) // add form as param

            formOp.importData(form, data)
            form.dispatchEvent(event)
          })
        )
      }
    }
  })

  // console.log(fetchPromises)
  return Promise.all(fetchPromises)
}

pers.registerProvider(new PersFile('File'))
