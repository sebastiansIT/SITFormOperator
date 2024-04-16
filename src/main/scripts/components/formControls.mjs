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
import * as main from '../main.mjs'
import { FORM_SELECTOR } from '../operators/formOperator.mjs'

const template = document.createElement('template')

template.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5em;
      font-size: 0.8em;
    }
    button {
      font-size: inherit;
    }
    #menu_inline_end {
      flex-grow: 1;
      text-align: end;
    }
  </style>
  <slot name="before"></slot>
  <div part="menubar">
    <button type="submit" id="control_save" part="menuItem">Save</button>
    <button type="button" id="control_load" part="menuItem">Load</button>
    <slot></slot>
    <button type="reset" id="control_new" part="menuItem">New</button>
  </div>
  <slot id="menu_inline_end" name="after"></slot>
`

/** A Custom Element that should allow basic operations like save, load or reset
 * on forms.
 *
 * @class
 * @augments {external:HTMLElement}
 */
class FormControls extends HTMLElement {
  /** Constructor for the HTMLElement "FormControls".
   */
  constructor () {
    super()

    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.appendChild(template.content.cloneNode(true))

    const controlSave = this._shadowRoot.getElementById('control_save')
    controlSave.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()

      const isValid = this.form.checkValidity()

      if (isValid || confirm('This Sheet isn\'t valid! Are you want to save it allways?')) {
        this.save()
          .then(data => {
            this.dispatchEvent(
              new CustomEvent('save', data)
            )
          })
      } else {
        window.setTimeout(() => {
          this.form.reportValidity()
        }, 10)
      }
    })

    const controlLoad = this._shadowRoot.getElementById('control_load')
    controlLoad.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()

      this.load()
        .then(data => {
          this.dispatchEvent(
            new CustomEvent('load', data)
          )
        })
    })

    const controlNew = this._shadowRoot.getElementById('control_new')
    controlNew.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()

      location.reload()

      // Dispatch New-Event
      this.dispatchEvent(
        new CustomEvent('new', {})
      )
    })
  }

  /* connectedCallback () {
    // Nothing to do
  } */

  /** The &lt;form&gt; element to associate the controls with (there form owner).
   *
   * @returns {external:HTMLFormElement} A &lt;form&gt; element.
   */
  get form () {
    const formId = this.getAttribute('form')
    if (formId) {
      return document.getElementById(formId)
    }
    return this.closest(FORM_SELECTOR)
  }

  /** Set the ID of the associated form element.
   *
   * @param {string} value The new label.
   */
  set form (value) {
    this.setAttribute('form', value)
  }

  /** Get the label of the button "Save".
   *
   *  @returns {string} The label.
   */
  get labelSave () {
    return this.getAttribute('label-save')
  }

  /** Set the Label for the button "Save".
   *
   * @param {string} value The new label.
   */
  set labelSave (value) {
    this.setAttribute('label-save', value)
  }

  /** Get the label of the button "load".
   *
   * @returns {string} The Label.
   */
  get labelLoad () {
    return this.getAttribute('label-load')
  }

  /** Set the label for the button "load".
   *
   * @param {string} value The new label.
   */
  set labelLoad (value) {
    this.setAttribute('label-load', value)
  }

  /** Get the label of the button "new".
   *
   * @returns {string} The label.
   */
  get labelNew () {
    return this.getAttribute('label-new')
  }

  /** Set the label for the button "new".
   *
   * @param {string} value The new label.
   */
  set labelNew (value) {
    this.setAttribute('label-new', value)
  }

  /** Declares all HTML attributes that should observed for changes.
   *
   * @private
   * @returns {string[]} Array of attribute names.
   */
  static get observedAttributes () {
    return ['label-save', 'label-load', 'label-new']
  }

  /** This Method computes all changes of HTML attribute values.
   *
   * @private
   * @param {string} name The name of the changed attribute.
   * @param {string} oldVal The old value of the attribute.
   * @param {string} newVal The new value of the attribute.
   */
  attributeChangedCallback (name, oldVal, newVal) {
    switch (name) {
      case 'label-save':
        this._shadowRoot.querySelector('#control_save').innerHTML = newVal
        break
      case 'label-load':
        this._shadowRoot.querySelector('#control_load').innerHTML = newVal
        break
      case 'label-new':
        this._shadowRoot.querySelector('#control_new').innerHTML = newVal
        break
      default:
        this[name] = newVal
    }
  }

  /** Saves the data from the form to a local JSON file.
   *
   * @returns {module:persistence/PersistenceManager~SaveFormPromise} A Promise fulfilled width the saved data.
   */
  save () {
    return main.save(this.form)
  }

  /** Loads the data from a selected file to the form.
   *
   * @returns {module:persistence/PersistenceManager~LoadFormPromise} A promise fulfilled with the loaded data.
   */
  load () {
    return main.load(this.form)
  }
}

export default FormControls
