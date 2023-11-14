/*  Copyright 2021 - 2022 Sebastian Spautz

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

/* global Peer */

/** Functions for concruent editing a form with multiple users.
 *
 * @module collaboration/CollaborationeManager
 */

import { exportData, importData, fullQualifiedKeyOf, entryBy } from '../operators/formOperator.mjs'
import { valueOf, valueFor } from '../operators/entryOperator.mjs'
import * as arrayop from '../operators/arrayOperator.mjs'

const PEER_OPTIONS = { debug: 1 }
let selfPeer
let isHub = false

/** Handles incoming messages on the WebRTC Data channel.
 *
 * @param {*} data The message.
 */
function onData (data) {
  // TODO Exception wenn data nicht da oder command nicht da
  console.log('Received', data)
  if (data && data.command) {
    const form = document.getElementById(data.form)
    switch (data.command) {
      case 'init':
        // {
        //   command: 'init',
        //   sender: this.userInformation.name,
        //   form: form.id,
        //   content: actualData
        // }
        importData(form, data.content)
        break
      case 'change':
        // {
        //   command: 'change',
        //   sender: 'Bob',
        //   form: 'myForm',
        //   content: { fullQualifiedKey: 'value' }
        // }
        Object.keys(data.content).forEach((key, i) => {
          const entry = entryBy(key, form)
          if (entry) {
            valueFor(entry, data.content[key])
          }
        })
        break
      case 'createArrayItem':
        // {
        //   command: 'createArrayItem',
        //   sender: 'Bob',
        //   form: 'myForm',
        //   content: myArrayFQN
        // }
        const arrayToAdd = entryBy(data.content, form)
        if (arrayToAdd) {
          arrayop.addArrayItem(arrayToAdd)
        }
        break
      case 'deleteArrayItem':
        // {
        //   command: 'deleteArrayItem',
        //   sender: 'Bob',
        //   form: 'myForm',
        //   content: myArrayFQN
        // }
        const arrayToRemoveFrom = entryBy(data.content, form)
        if (arrayToRemoveFrom) {
          arrayToRemoveFrom.parentElement.removeChild(arrayToRemoveFrom)
        }
        break
      default:
        console.warn('Unknown command received!')
    }

    if (isHub) {
      this.connections.forEach((connection, i) => {
        if (connection.label !== data.sender) {
          connection.send(data)
        }
      })
    }
  }
}

/** This class handles connections betwean peers and send form data over the network.
 */
export class CollaborationManager {
  /**
   *
   */
  constructor () {
    this.connections = []
    this.forms = []
    this.userInformation = {
      name: 'anonymos',
      peerId: undefined
    }
  }

  /**
   *
   * @returns {Promise} A Promise.
   */
  serve () {
    return new Promise((resolve, reject) => {
      if (selfPeer) {
        reject(new Error('This collaboration manager allways serve a connection or is connected to a remote host.'))
      }

      const peer = new Peer(PEER_OPTIONS)
      selfPeer = peer
      isHub = true

      peer.on('open', id => {
        this.userInformation.peerId = id

        // handle incoming connection from remote peer
        peer.on('connection', (conn) => {
          conn.on('open', () => {
            this.connections.push(conn)
            console.debug(`${conn.label} is connected`)
            // send all watched forms to the new connection
            this.forms.forEach(form => {
              const actualData = exportData(form)
              conn.send({
                command: 'init',
                sender: this.userInformation.name,
                form: form.id,
                content: actualData
              })
            })
          })

          conn.on('data', onData.bind(this))
        })

        resolve()
      })

      // TODO what if errors occured
    })
  }

  /**
   *
   */
  unserve () {
    // TODO close all connections
    // TODO unwatch all forms
    selfPeer.destroy()
    isHub = false
  }

  /**
   *
   * @param {*} hostPeerId
   * @returns {Promise} A Promise.
   */
  connect (hostPeerId) {
    return new Promise((resolve, reject) => {
      if (selfPeer) {
        reject(new Error('This collaboration manager allways serve a connection or is connected to a remote host.'))
      }
      const peer = new Peer(PEER_OPTIONS)
      selfPeer = peer
      peer.on('open', (id) => {
        this.userInformation.peerId = id
        // Connect to host
        const conn = peer.connect(hostPeerId, {
          label: this.userInformation.name
        })
        conn.on('open', () => {
          this.connections.push(conn)
          conn.on('data', onData)
          resolve()
        })

        // TODO fehlerhandling connection
        // TODO fehlerhandling peer
      })
    })
  }

  /**
   *
   */
  disconnect () {
    // TODO close all connections
    // TODO unwatch all forms
    selfPeer.destroy()
  }

  /** Watch the given form for changes.
   *
   * @param {HTMLFormElement} form - The DOM element representing a form.
   * @returns {Promise} A Promise resolved when peer is opend.
   */
  watchForm (form) {
    const sendChangeEvent = (changedData) => {
      // send to each connected peer
      this.connections.forEach((item, i) => {
        item.send({
          command: 'change',
          sender: this.userInformation.name,
          form: form.id,
          content: changedData
        })
      })
    }

    return new Promise((resolve, reject) => {
      this.forms.push(form)

      // Changed HTML content editable elements
      form.addEventListener('input', event => {
        if (event.target.matches('[contenteditable]')) {
          // TODO throtle down
          const changedData = {}
          changedData[fullQualifiedKeyOf(event.target, form)] = valueOf(event.target)
          sendChangeEvent(changedData)
        }
      })
      // Changed HTML form elemente
      form.addEventListener('change', event => {
        const changedData = {}
        changedData[fullQualifiedKeyOf(event.target, form)] = valueOf(event.target)
        sendChangeEvent(changedData)
      })

      document.addEventListener('click', event => {
        // Handle buttons to remove array items
        if (event.target.matches(arrayop.ITEM_REMOVE_CONTROL_SELECTOR)) {
          const array = event.target.closest(arrayop.ARRAY_SELECTOR)
          const arrayItem = event.target.closest(array.dataset.arrayselector + ' > *')
          this.connections.forEach((item, i) => {
            item.send({
              command: 'deleteArrayItem',
              sender: this.userInformation.name,
              form: form.id,
              content: fullQualifiedKeyOf(arrayItem, form)
            })
          })
        }
        // Handle buttons to add array items
        if (event.target.matches(arrayop.ITEM_ADD_CONTROL_SELECTOR)) {
          this.connections.forEach((item, i) => {
            item.send({
              command: 'createArrayItem',
              sender: this.userInformation.name,
              form: form.id,
              content: fullQualifiedKeyOf(event.target.closest(arrayop.ARRAY_SELECTOR), form)
            })
          })
        }
      }, true)

      resolve()
    })
  }

  // TODO unwatch
}
