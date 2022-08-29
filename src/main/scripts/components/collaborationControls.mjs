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
        <p>Please note: When you use this collaborative editing feature, data that could 
          identify you is transmitted to <a href="https://peerjs.com/">PeerJS</a>.</p>
        <p>If you don't agree with this, you must not activate the collaborative editing 
          function with the buttons below.</p>
    </slot></div>

    <div>
        <p><slot name="nicknameIntro">What do you like to be called?</slot></p>
        <span class="formfield">
            <label for="playername"><slot name="nickname">Nickname</slot></label>
            <input id="playername" type="text" minlength="3" />
        </span>
    </div>

    <div class="options">
        <div>
            <p><slot name="hostIntro">Do you want to open this form for collaborative editing?</slot></p>
            <button id="control_host" type="button"><slot name="buttonStart">Start Collaborating</slot></button>
            <p hidden><slot name="hostedGameNumber">Your friends need the following ID to connect</slot>: <span id="hostedgamenumber"></span></p>
        </div>
        <div>
            <p><slot name="connectIntro">Do you want to connect to another persons form?</slot></p>
            <span class="formfield">
                <label for="gamenumber">ID</label>
                <input type="text" id="gamenumber" autocomplete="off" />
                <button id="control_connect" type="button"><slot name="buttonConnect">Connect</slot></button>
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
