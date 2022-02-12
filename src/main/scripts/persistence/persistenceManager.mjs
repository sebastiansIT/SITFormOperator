/*  Copyright 2018, 2021 Sebastian Spautz

    This File is Part of "SebastiansIT Form Operator".

    "SebastiansIT Form Operator" is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/.
*/

/** This modul contains functions to save data to and load data from
 * a persistent storage system.
 *
 * @module persistence/PersistenceManager
 */

/** Registerd providers.
 *
 * @type {Array<PersistenceProvider>}
 */
const providers = []

/** Saves the given data set.
 * If multiple storage provider are configured, the user will be asked for
 * his choice.
 *
 * @param {object} dataSet The data set to save.
 * @param {string} name The name of the dataset.
 * @returns {SaveDataPromise} A promise to save the data set.
 */
export function save (dataSet, name) {
  const provider = selectProvider()
  return provider.save(dataSet, name)
}

/** Loads a data set for the given type of form.
 * Some provider can use the type to filter the available data sets.
 *
 * @param {object} [type] Whatever identifies the type of form.
 * @returns {LoadDataPromise} A promise to load a data set.
 */
export function load (type) {
  const provider = selectProvider()
  return provider.load(type)
}

/** Allow the user to choose a storage provider.
 * If only on provider is configured, this is returned utomatically.
 *
 * @returns {PersistenceProvider} A provider.
 */
function selectProvider () {
  if (providers.length === 1) {
    return providers[0]
  } else {
    // TODO show provider selector if more than one available
  }
}

/** Registerd a storage provider.
 *
 * @param {PersistenceProvider} provider A provider.
 * @returns {undefined}
 */
export function registerProvider (provider) {
  providers.push(provider)
}

/**
 * Interface for storage providers.
 *
 * @interface PersistenceProvider
 */

/** Loads a data set for the given type of form.
 +
 * Some provider can use the parameter type to filter the available data sets.
 *
 * @function
 * @name module:persistence/PersistenceManager~PersistenceProvider#load
 * @param {object} [type] Whatever identifies the type of form.
 * @returns {module:persistence/PersistenceManager~LoadDataPromise} A promise to load a data set.
 */

/** Saves the given data set.
 *
 * @function
 * @name module:persistence/PersistenceManager~PersistenceProvider#save
 * @param {object} dataset The data set to save.
 * @param {string} name The name of the dataset.
 * @returns {module:persistence/PersistenceManager~SaveDataPromise} A promise to save the data.
 */

/** Provider for single storage system. Special provider can inherits this
 * class to implement a concrete storage technology.
 *
 * @class
 * @implements {module:persistence/PersistenceManager~PersistenceProvider}
 * @abstract
 */
export class AbstractPersistenceProvider {
  /** Create a new storage provider.
   *
   * @param {string} name The name for the provider.
   */
  constructor (name) {
    /** The name of this provider.
     *
     * @type {string}
     */
    this.name = name
  }
}

/**
 * A promise to save a data set.
 *
 * If the promise is fulfilled it contains the saved data set.
 * If rejected, it contains an error.
 *
 * @typedef SaveDataPromise
 * @type {external:Promise.<object, external:Error>}
 * @promise SaveDataPromise
 * @fulfill {object} The saved data set.
 * @reject {external:Error} An Error.
 */

/**
 * A promise to load a data set.
 *
 * If the promise is fulfilled it contains the loaded data.
 * If rejected, it contains an error.
 *
 * @typedef LoadDataPromise
 * @type {external:Promise.<object, external:Error>}
 * @promise LoadDataPromise
 * @fulfill {object} The loaded data set.
 * @reject {external:Error} An Error.
 */
