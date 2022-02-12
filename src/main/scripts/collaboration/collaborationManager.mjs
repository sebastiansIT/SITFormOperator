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

/* global Peer */

/** Functions for collaborating on a sheet with multiple users.
 *
 * @module collaboration/CollaborationeManager
 */

import { exportData, importData, fullQualifiedKeyOf } from '../operators/formOperator.mjs'
import { valueOf } from '../operators/entryOperator.mjs'

const PEER_OPTIONS = { debug: 1 }
let selfPeer = null

/**
 *
 */
export class CollaborationManager {
  /**
   *
   */
  constructor () {
    this.connections = []
    this.userInformation = {
      name: 'anonymos'
    }
  }

  /**
   * Eventhandler for opened peer events.
   * 1. Saves the actual peer id
   * @private
   * @param {string} id - The ID of the peer.
   * @returns {undefined}
   */
  onPeerOpened (id) {
    this.userInformation.peerId = id
  }

  /**
   * @param sheet
   * @param partialData
   */
  onChangeCommand (sheet, partialData) {
    Object.keys(partialData).forEach((key, i) => {
      if (Object.prototype.hasOwnProperty.call(partialData, 'key')) {
        let dataToTransfer
        key.split('/').reverse().forEach((item, i) => {
          if (i === 0) {
            dataToTransfer[item] = partialData[Object.keys(partialData)[0]]
          } else {
            const innerData = {}
            innerData[item] = dataToTransfer
            dataToTransfer = innerData
          }
        })
        importData(sheet, dataToTransfer)
      }
    })
  }

  /**
   * Opens the actual sheet for collaboration.
   * @param {HTMLElement} sheet - The DOM element representing the sheet.
   * @returns {Promise} A Promise resolved when peer is opend.
   */
  openSheet (sheet) {
    return new Promise((resolve, reject) => {
      // const peer = new Peer(PEER_OPTIONS)
      // selfPeer = peer
      //
      // peer.on('open', (id) => {
      //   this.onPeerOpened(id)
      //   // TODO remove on disconect
        sheet.addEventListener('change', event => {
          const changeedData = {}
          changeedData[fullQualifiedKeyOf(event.target, sheet)] = valueOf(event.target)
          console.log(changeedData)
          // send to each connected peer
          // this.connections.forEach((item, i) => {
          //   item.send({
          //     command: 'change',
          //     sender: this.userInformation.name,
          //     sheet: changeedData
          //   })
          // })
        })
        resolve()
      })

    //   peer.on('connection', (conn) => {
    //     conn.on('open', () => {
    //       this.connections.push(conn)
    //       console.log(conn.label + 'is connected')
    //       // Initialisiere das Sheet aus Seiten des neuen Peers
    //       const actualData = exportData(sheet)
    //       conn.send({
    //         command: 'init',
    //         sender: this.userInformation.name,
    //         sheet: actualData
    //       })
    //     })
    //
    //     conn.on('data', (data) => {
    //       // TODO implements commands
    //       console.log('Received', data)
    //     })
    //   })
    // })
  }

  /**
   *
   */
  closeSheet () {
    selfPeer.destroy()
  }

  /**
   * Connect the actual sheet for collaboration with a given host.
   * @param {string} hostPeerId - The ID of the host.
   * @param {HTMLElement} sheet - The DOM element representing the sheet
   * @returns {Promise} A Promise resolved when connection is opend.
   */
  connectSheet (hostPeerId, sheet) {
    return new Promise((resolve, reject) => {
      const peer = new Peer(PEER_OPTIONS)
      selfPeer = peer
      peer.on('open', (id) => {
        this.onPeerOpened(id)

        const conn = peer.connect(hostPeerId, {
          label: this.userInformation.name
        })
        conn.on('open', () => {
        })

        // Receive messages
        conn.on('data', (data) => {
          if (data && data.command) {
            switch (data.command) {
              case 'init':
                importData(sheet, data.sheet)
                resolve(data.sender)
                break
              case 'change':
                this.onChangeCommand(sheet, data.sheet)
                break
              default:
                console.log('Received', data)
            }
          }
        })
      })
    })
  }

  /**
   *
   */
  disconnectSheet () {
    selfPeer.destroy()
  }
}
