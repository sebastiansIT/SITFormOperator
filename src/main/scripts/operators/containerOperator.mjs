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

import * as entryOp from './entryOperator.mjs'

/** Operator for form container. This operator provides some functions like
 * export and import of the values within a container.
 *
 * A Container is an abstract thing with more than one atomar value inside.
 * Sections and Arrays are examples for containers.
 *
 * @module operators/FormContainerOperator
 * @requires operators/FormEntryOperator
 */

/** The CSS selector to identify each type of container.
 *
 * @returns {string} A CSS selector.
 */
export function containerSelector () {
  return createContainerSelector()
}

/** Gets the key of an container. The key can be the value of the data attribute
 * _exportkey_ or the ID attribute.
 *
 * @param {external:HTMLElement} container A DOM element that represents a
 * container.
 * @param {string} [containerTypSelector] A CSS selector that identifies a
 * specific type of container.
 * @returns {string | undefined} The key of the given container. Undefined if no key is set.
 * @throws {external:Error} An error if the given HTMLElement isn't a valid
 * form container.
 * @throws {external:Error} An error if the key of the given HTMLElement contains a slash.
 */
export function keyOf (container, containerTypSelector) {
  if (containerTypSelector && !container.matches(containerTypSelector)) {
    throw new Error(`${container} isn't a valid container. It should match css selector ${containerTypSelector}.`)
  }

  const key = container.dataset.exportkey || container.id || undefined

  if (key && key.indexOf('/') > -1) {
    throw new Error(`${container} isn't a valid container. ID should not contains slashes.`)
  }

  return key
}

/** Exports the data of the specified container.
 *
 * @param {external:HTMLElement} container A DOM element that represents a container.
 * @param {string} [ownSelector=''] A CSS selector that identifies the container itself.
 * @returns {object} The JavaScript object with the data from the container.
 */
export function exportData (container, ownSelector = '') {
  const containerSelector = createContainerSelector(ownSelector)
  const containerData = {}

  // Export entries located directly in the container
  const entries = container.querySelectorAll(entryOp.ENTRY_SELECTOR)
  entries.forEach((entry) => {
    const containingContainer = entry.parentElement.closest(containerSelector)

    // Nur Elemente die direkt im sheet enthalten sind bearbeiten (keine Subcontainer)
    if (!containingContainer || containingContainer === container) {
      // Für alles was übrig ist Key und Value bestimmen und speichern
      containerData[entryOp.keyOf(entry)] = entryOp.valueOf(entry)
    }
  })

  containerTypRegistry.forEach((containerTyp, i) => {
    const subContainersOfType = container.querySelectorAll(containerTyp.selector)
    subContainersOfType.forEach(subContainer => {
      const containingContainer = subContainer.parentElement.closest(containerSelector)
      if (!containingContainer || containingContainer === container) {
        containerData[keyOf(subContainer)] = containerTyp.export(subContainer)
      }
    })
  })

  return containerData
}

/** Imports the given data into the specified container.
 *
 * @param {external:HTMLElement} container A DOM element that represents a container.
 * @param {object} data A JavaScript object with the data to import.
 * @param {string} [ownSelector=''] A CSS selector that identifies the container itself.
 * @returns {undefined}
 */
export function importData (container, data, ownSelector = '') {
  Object.keys(data).forEach((key) => {
    // find Element and delegate import to entryOperator
    const entry = findEntry(container, key, ownSelector)
    if (entry) {
      entryOp.valueFor(entry, data[key])
      return
    }

    // find sub container and delegate import to one of the container types
    const subContainer = findSubContainer(container, key, ownSelector)
    if (subContainer) {
      containerTypRegistry.forEach((containerTyp, i) => {
        if (subContainer.matches(containerTyp.selector)) {
          containerTyp.import(subContainer, data[key])
        }
      })
    }
  })
}

/** Find the direct sibling container for the given key inside of the parent element.
 *
 * @param {string} key The key of the container to find.
 * @param {external:HTMLElement} parent The DOM element that represents a parent container or form.
 * @returns {external:HTMLElement|undefined} The DOM element represents the container with the given key.
 */
export function containerBy (key, parent) {
  return parent.querySelector(`[data-exportkey='${key}'], [name='${key}'], #${key}`)
}

/** Switch the view mode of the given container.
 *
 * @param {external:HTMLElement} container The DOM element that represents a container.
 * @param {module:view/ViewModes~ViewMode} viewMode The new view mode.
 * @returns {undefined}
 */
export function switchViewMode (container, viewMode) {
  const entries = container.querySelectorAll(entryOp.ENTRY_SELECTOR)
  entries.forEach((entry) => {
    entryOp.switchViewMode(entry, viewMode)
  })
}

/** Registers new container types.
 *
 * @param {ContainerTyp} type The new type of the container.
 * @returns {undefined}
 */
export function registerContainerTyp (type) {
  containerTypRegistry.push(type)
}

/** Compute the full qualified key of the given form entry.
 *
 * @param {external:HTMLElement} entryOrContainer The DOM element representing a form element.
 * @param {external:HTMLFormElement} root The DOM element representing the root container.
 * @returns {string|undefined} The full qualified key.
 * @throws {external:Error} Throws if the entry is not inside of an Container.
 * @throws {external:Error} Throws if the entry is not inside of the given Container.
 */
export function fullQualifiedKeyOf (entryOrContainer, root) {
  let fqn = ''

  containerTypRegistry.forEach((containerTyp, i) => {
    if (root.matches(containerTyp.selector)) {
      if (containerTyp.fullQualifiedKeyOf) {
        fqn = containerTyp.fullQualifiedKeyOf(entryOrContainer, root)
      } else {
        fqn = defaultFullQualifiedKeyOf(entryOrContainer, root)
      }
    }
  })

  if (fqn) {
    return fqn
  } else {
    throw new Error(`The root element ${root} isn't a valid container`)
  }
}

/** Gets the element identified by the given full qualified key inside of an container.
 *
 * @param {string} fullQualifiedKey The full qualified key of an element based on root.
 * @param {external:HTMLFormElement} root The DOM element representing the root container.
 * @returns {external:HTMLFormElement} The DOM element that represents the element with the given key.
 */
export function elementBy (fullQualifiedKey, root) {
  let entry = null

  containerTypRegistry.forEach((containerTyp, i) => {
    if (root.matches(containerTyp.selector)) {
      if (containerTyp.fullQualifiedKeyOf) {
        entry = containerTyp.elementBy(fullQualifiedKey, root)
      } else {
        entry = defaultElementBy(fullQualifiedKey, root)
      }
    }
  })

  return entry
}

/** Gets the parent container of the given formular entry.

 * @param {external:HTMLElement} entry A DOM element that represents a entry or container.
 * @returns {external:HTMLElement|undefined} The DOM element representing the parent container or undefined.
 */
export function parentContainerOf (entry) {
  return entry.parentElement.closest(createContainerSelector())
}

/* ========================================================== */
/* ================ Modul internal variables ================ */
/* ========================================================== */
/** Internal array of known container types (like section or array).
 *
 * @constant
 * @type {Array<ContainerTyp>}
 */
const containerTypRegistry = []

/* ========================================================== */
/* ================ Modul internal functions ================ */
/* ========================================================== */
/** Combines the CSS selectors of the registered container types into a single selector.
 *
 * @param {string} [parentSelector=''] A CSS selector that identifies the parent
 * container itself.
 * @returns {string} A CSS selector.
 */
function createContainerSelector (parentSelector = '') {
  let selector = ''

  containerTypRegistry.forEach((item, i) => {
    if (i !== 0) {
      selector = selector + ', '
    }
    selector = selector + item.selector
  })

  if (parentSelector) {
    if (selector) {
      selector = selector + ','
    }
    selector = selector + parentSelector
  }

  return selector
}

/** Find a entry with the given key inside the parent container.
 *
 * @param {external:HTMLElement} parent A DOM element that represents a container.
 * @param {string} key The key of the entry to search for.
 * @param {string} [parentSelector=''] A CSS selector that identifies the parent
 * container itself.
 * @returns {undefined}
 * @throws {external:Error} Throws an error if the parent is falesy.
 * @throws {external:Error} Throws an error if the key is falesy.
 */
function findEntry (parent, key, parentSelector = '') {
  if (!parent) {
    throw new Error(`Parent is a required parameter of containerOperator.findEntry(). It can not be ${parent}.`)
  }

  if (!key) {
    throw new Error(`Key is a required parameter of containerOperator.findEntry(). It can not be ${key}.`)
  }

  const containerSelector = createContainerSelector(parentSelector)
  let sheetEntry

  parent.querySelectorAll(entryOp.ENTRY_SELECTOR).forEach((entry) => {
    const containingContainer = entry.parentElement.closest(containerSelector)

    // Nur Elemente die direkt im container enthalten sind bearbeiten (keine Subcontainer)
    if (!containingContainer || containingContainer === parent) {
      if (entryOp.keyOf(entry) === key) {
        sheetEntry = entry
      }
    }
  })

  return sheetEntry
}

/** Find a sub container with the given key inside the parent container.
 *
 * @param {external:HTMLElement} parent A DOM element that represents a container.
 * @param {string} key The key of the sub container to search for.
 * @param {string} [parentSelector=''] A CSS selector that identifies the parent
 * container itself.
 * @returns {undefined}
 * @throws {external:Error} Throws an error if the parent is fallsy.
 * @throws {external:Error} Throws an error if the key is fallsy.
 */
function findSubContainer (parent, key, parentSelector = '') {
  if (!parent) {
    throw new Error(`Parent is a required parameter of containerOperator.findSubContainer(). It can not be ${parent}.`)
  }

  if (!key) {
    throw new Error(`Key is a required parameter of containerOperator.findSubContainer(). It can not be ${key}.`)
  }

  const containerSelector = createContainerSelector(parentSelector)
  let subContainer
  parent.querySelectorAll(createContainerSelector(parentSelector)).forEach(container => {
    const containingContainer = container.parentElement.closest(containerSelector)

    // Nur Elemente die direkt im sheet enthalten sind bearbeiten (keine Subcontainer)
    if (!containingContainer || containingContainer === parent) {
      if (keyOf(container) === key) {
        subContainer = container
      }
    }
  })

  return subContainer
}

/** Default implementation of fullQualifiedKeyOf() for all containers without
 * a special implementation like arrays.
 *
 * @param {external:HTMLElement} entryOrContainer The DOM element representing a formular or container.
 * @param {external:HTMLFormElement} root The DOM element representing the root container.
 * @returns {string} The full qualified key.
 * @throws {external:Error} Throws if the entry is not inside of an Container.
 * @throws {external:Error} Throws if the entry is not inside of the given Container.
 */
function defaultFullQualifiedKeyOf (entryOrContainer, root) {
  const parentContainer = parentContainerOf(entryOrContainer)
  if (!parentContainer) {
    throw Error(`The given entry ${entryOp.keyOf(entryOrContainer)} is not inside of any Container.`)
  } else if (parentContainer !== root) {
    throw Error(`The given entry ${entryOp.keyOf(entryOrContainer)} is not inside of the given Container.`)
  }

  if (entryOrContainer.matches(createContainerSelector())) {
    return `${keyOf(entryOrContainer)}`
  } else {
    return `${entryOp.keyOf(entryOrContainer)}`
  }
}

/** Default implementation of elementBy() for all containers without a special
 * implementation like arrays.
 *
 * @param {string} fullQualifiedKey The full qualified key of an element based on root.
 * @param {external:HTMLFormElement} root The DOM element representing the root container.
 * @returns {external:HTMLFormElement} The DOM element that represents the element with the given key.
 */
function defaultElementBy (fullQualifiedKey, root) {
  const parts = fullQualifiedKey.split('/')
  if (parts.length === 1) {
    return entryOp.entryBy(parts, root)
  } else {
    return containerBy(parts[0], root)
  }
}

/* eslint-disable jsdoc/valid-types */
/** A container type contains all informations and functions to use it inside of
 *  the generic module {@link module:operators/FormContainerOperator|FormContainerOperator}.
 *
 * @typedef ContainerTyp
 * @type {object}
 * @property {string} selector A CSS selector that identifies containers of this type.
 * @property {Function} export A function to export the data inside of containers
 * of this type.
 * @property {Function} import A function to import the given data into the
 * container of this type.
 * @property {Function} [fullQualifiedKeyOf] A function to get the full qualified key of an element inside of a container.
 * @property {Function} [elementBy] A function to get the entry identified by a full qualified key.
 */
