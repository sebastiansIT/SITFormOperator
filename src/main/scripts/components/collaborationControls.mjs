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
import '../../../../node_modules/peerjs/dist/peerjs.min.js'
import { FORM_SELECTOR } from '../operators/formOperator.mjs'
import { CollaborationManager } from '../collaboration/collaborationManager.mjs'

const template = document.createElement('template')

template.innerHTML = `
    <style>
        :host > div {
            padding: 1rem;
        }
        :host > div:not(:last-child) {
            border-block-end: 0.2rem dashed #004600;
        }

        p {
            max-width: 50em;
            line-height: 1.5em;
        }
        p:first-child {
            margin-block-start: 0;
        }
        p:last-child {
            margin-block-end: 0;
        }

        label::after {
            content: ": ";
        }

        input {
            flex-grow: 1;
        }

        .formfield {
            display: flex;
            align-items: baseline;
            gap: 1ex;
        }
        .options {
            display: flex;
            flex-wrap: nowrap;
            gap: 1rem;
        }

        .options > div {
            flex-basis: 10%;
            flex-shrink: 0;
            flex-grow: 1;
        }
        .options > div:not(:last-child) {
            border-inline-end: 0.2rem dashed #004600;
        }
        
        .hostedgamenumber {
            white-space: nowrap;
        }
    </style>

    <div class="attention"><slot name="dataProtectionHint">
        <p>Beachte bitte, wenn du diese Funktion zum gemeinsamen Bearbeiten nutzt, werden 
            Daten, über die du identifiziert werden könntest, an 
            <a href="https://peerjs.com/">PeerJS</a> übermittelt.
            Dies geschieht um die Verbindung zwischen dir und deinen Mitspielern 
            herzustellen.</p>
        <p>Wenn du das nicht möchtest, darfst du die Funktion zum gemeinsamen Bearbeiten
            nicht mit den unten stehenden Schaltflächen aktivieren.</p>
    </slot></div>

    <div>
        <p>Wie willst du heute genannt werden?</p>
        <span class="formfield">
            <label for="playername">Dein Name</label>
            <input id="playername" type="text" minlength="3" />
        </span>
    </div>

    <div class="options">
        <div>
            <p>Willst du ein Spiel leiten?</p>
            <button id="control_host" type="button">Spiel starten</button>
            <p hidden>Die folgende Nummer musst du deinen Mitspielern übermitteln damit 
            sie sich verbinden können: <span id="hostedgamenumber"></span></p>
        </div>
        <div>
            <p>Willst du an einem Spiel teilnehmen?</p>
            <span class="formfield">
                <label for="gamenumber">Spielnummer</label>
                <input type="text" id="gamenumber" autocomplete="off" />
                <button id="control_connect" type="button">Connect</button>
            </span>
        </div>
    </div>
`

/** A Custom Element that should allow to set a user name and host a WebRTC-Channel or connect
 * to such a channel as a client.
 *
 * @class
 * @augments {external:HTMLElement}
 */
class CollaborationControls extends HTMLElement {
  /** Constructor for the HTMLElement "CollaborationControls".
   */
  constructor () {
    super()

    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.appendChild(template.content.cloneNode(true))

    const nickname = this._shadowRoot.getElementById('playername')
    const controlHost = this._shadowRoot.getElementById('control_host')
    const onStartAsHost = (event) => {
      event.stopPropagation()
      event.preventDefault()

      const host = new CollaborationManager()
      host.userInformation.name = nickname.value || 'Host'
      host.serve()
        .then(() => {
          const gamenumber = this._shadowRoot.getElementById('hostedgamenumber')
          gamenumber.innerText = host.userInformation.peerId
          controlHost.hidden = true
          controlConnect.disabled = true
          nickname.disabled = true
          gamenumber.parentElement.hidden = false
        })
        .then(() => host.watchForm(this.form))
    }
    controlHost.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        onStartAsHost(event)
      }
    })
    controlHost.addEventListener('pointerup', onStartAsHost)

    const controlConnect = this._shadowRoot.getElementById('control_connect')
    const onStartAsClient = (event) => {
      const peerId = this._shadowRoot.getElementById('gamenumber').value
      const client = new CollaborationManager()
      client.userInformation.name = nickname.value || 'Guest'
      client.connect(peerId)
        .then(() => client.watchForm(this.form))
        .then(() => {
          controlConnect.disabled = true
          controlHost.disabled = true
          nickname.disabled = true
        })
    }
    controlHost.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        onStartAsClient(event)
      }
    })
    controlConnect.addEventListener('pointerup', onStartAsClient)
  }

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
}

export default CollaborationControls
