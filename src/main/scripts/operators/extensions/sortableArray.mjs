/*  Copyright 2022 Sebastian Spautz

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

/** Extension for the array operator. This extension allows to change the position
 * of items inside of an array.
 *
 * This extension is used for each array with an aditional data attribute "dropcategory".
 *
 * @module operators/extensions/SortableArray
 */

/* ========================================================== */
/* ================ Modul internal constants ================ */
/* ========================================================== */
/** A key to identifier the drop category inside of the data list of an element.
 *
 * @constant
 * @type {string}
 */
const SORTABLE_ARRAY_CATEGORY_KEY = 'dropcategory'

/** The item that is dragged at the moment or undefined if nothing is dragged now.
 *
 * @type {HTMLElement|undefined}
 */
let draggedItem

/** The drag category of the item that is dragged at the moment. An empty string
 * if no item is dragged now.
 *
 * @type {string}
 */
let draggedItemDropCategory = ''

/* ========================================================== */
/* ================ Modul external functions ================ */
/* ========================================================== */
/** Initialise all event listeners for rearagements of array items.
 *
 * @param {string} arraySelector The Selector to identify an array.
 */
export function init (arraySelector) {
  /* If dragging things arround starts this listener remembers some informations for later events.
   * We need to handle different situations here:
   *  1. The draggable thing is a item inside of an array with a drop category
   *  2. The draggable thing is a item inside of an array without a drop category, what means "Do noting!"
   *  3. The draggable thing is any other HTML element, what means also "Do nothing!"
   */
  document.addEventListener('dragstart', (event) => {
    let container = event.target.closest(arraySelector)
    /* This Hack is needed for Firefox. It is neccesary because the target dragable
     * Element is allways detachted from the document. So I can't get Informations
     * from outside. But with originalTarget this works. See
     * https://developer.mozilla.org/en-US/docs/Web/API/Event/originalTarget for this
     * properitary property.
     */
    if (!container) { // Needed for Firefox
      container = event.originalTarget.closest(arraySelector)
    }
    if (container) {
      const arraySelector = container.dataset.arrayselector
      draggedItemDropCategory = container.dataset[SORTABLE_ARRAY_CATEGORY_KEY]
      if (arraySelector) {
        draggedItem = event.target.closest(`${arraySelector} > *`)
      } else {
        draggedItem = event.target
      }
    }
  })

  /* If dragging things arround stops remove all informations set in the start event */
  document.addEventListener('dragend', (/* event */) => {
    draggedItemDropCategory = ''
    draggedItem = undefined
  })

  /* This Listener decide if a element is a valid drop zone.
   * Valid drop zones are other items in arrays with the same drop category.
   */
  document.addEventListener('dragover', (event) => {
    // Is the draggable item from a sortable array (means it's container has a drop category?
    if (draggedItemDropCategory) {
      const dropZoneArray = event.target.closest(arraySelector)
      // Is the drop zone inside of a sortable array?
      if (dropZoneArray) {
        const dropZoneItemContainerSelector = dropZoneArray.dataset.arrayselector
        let dropZoneArrayItem
        if (dropZoneItemContainerSelector) {
          dropZoneArrayItem = event.target.closest(`${dropZoneItemContainerSelector} > *`)
        } else {
          dropZoneArrayItem = event.target.closest(`${arraySelector} > *`)
        }
        const dropZoneCategory = dropZoneArray.dataset[SORTABLE_ARRAY_CATEGORY_KEY]

        if (
          // Is the drop zone a item inside of an array?
          dropZoneArrayItem &&
          // is the target a draggable item
          dropZoneArrayItem.matches('[draggable=true]') &&
          // Is the drop zone another item as the dragged item?
          dropZoneArrayItem !== draggedItem &&
          // Are the categories from dragged item and target item equals?
          dropZoneCategory === draggedItemDropCategory
        ) {
          event.preventDefault()
        }
      }
    }
  })

  document.addEventListener('drop', (event) => {
    event.preventDefault()

    const dropZoneItemContainerSelector = event.target.closest(arraySelector).dataset.arrayselector
    let dropZoneArrayItem
    if (dropZoneItemContainerSelector) {
      dropZoneArrayItem = event.target.closest(`${dropZoneItemContainerSelector} > *`)
    } else {
      dropZoneArrayItem = event.target.closest(`${arraySelector} > *`)
    }

    dropZoneArrayItem.parentElement.insertBefore(draggedItem, dropZoneArrayItem)
  })
}
