/*  Copyright 2018, 2021 Sebastian Spautz

    This File is Part of "SebastiansIT Form Operator".

    "SebastiansIT Form Operator" is free software: you can redistribute it
    and/or modify it under the terms of the GNU General Public License as
    published by the Free Software Foundation, either version 3 of the License,
    or any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/.
*/

import { AbstractPersistenceProvider } from './persistenceManager.mjs'

/**
 * @classdesc Allows access to the local file system.
 * @class LocalFileProvider
 * @augments {module:persistence/PersistenceManager.AbstractPersistenceProvider}
 * @implements {module:persistence/PersistenceManager~PersistenceProvider}
 * @param {string} name The name of this provider.
 */
class LocalFileProvider extends AbstractPersistenceProvider {
  /** Opens the file selector of the OS and saves the given dataset to the
   * selected file there.
   *
   * @override
   * @param {object} dataset The data set to save.
   */
  save (dataset, name) {
    return new Promise((resolve, reject) => {
      try {
        const filename = this.fileName(name)
        const element = document.createElement('a')
        element.setAttribute('href', 'data:application/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(dataset)))
        element.setAttribute('download', filename)
        element.textContent = filename
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        resolve(dataset)
      } catch (exeption) {
        reject(exeption)
      }
    })
  }

  /** Returns a recomended file name based on the given base name.
   *
   * @param {string} baseName The base name of a dataset.
   * @returns {string} A recomend file name.
   */
  fileName (baseName) {
    const fileNamePattern = document.querySelector('head meta[name=filenamepattern]')
    let fileName = baseName

    if (fileNamePattern) {
      const element = document.getElementById(fileNamePattern.content)
      if (element && element.value && element.value.trim()) {
        fileName = element.value || fileName
      }
    }

    if (fileName) {
      fileName = fileName.replace(/\s/g, '') + '.json'
    }

    return fileName
  }

  /** Opens the file selector of the OS and load the given dataset from the
   * selected file there.
   *
   * This implementation ignores the parameter *type* from the interface.
   *
   * @override
   * @returns {module:persistence/PersistenceManager~LoadDataPromise} A promise to load a data set.
   */
  load (/* type */) {
    return new Promise((resolve, reject) => {
      try {
        const element = document.createElement('input')
        element.setAttribute('type', 'file')
        element.style.display = 'none'
        element.addEventListener('change', function (event) {
          const file = event.target.files[0]
          if (!file) {
            reject(new Error('No File Selected'))
          }
          const fr = new FileReader()
          fr.onload = (e) => {
            const lines = e.target.result
            resolve(JSON.parse(lines))
          }
          fr.readAsText(file)
        }, false)
        element.click()
      } catch (ex) {
        reject(ex)
      }
    })
  }
}

export default LocalFileProvider
