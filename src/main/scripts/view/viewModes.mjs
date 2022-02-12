/*  Copyright 2021 Sebastian Spautz

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

/** Defines the different modes to show a form.
 *
 * @module view/ViewModes
 */

/** Enum for view modes.
 *
 * @readonly
 * @enum {string}
 */
const ViewMode = {
  /** Default view mode, allows editing. */
  EDIT: 'edit',
  /** In reader mode no editing is allowed. */
  READ: 'read'
}

export default ViewMode
