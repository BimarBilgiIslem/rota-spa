/*
 * Copyright 2017 Bimar Bilgi İşlem A.Ş.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Extending global array
 */
declare global {
    interface Array<T> {
        /**
       * Find model in collection by id
       * @param id Model id
       * @returns {TModel} 
       */
        findById?: (id: number) => T;
        /**
         * Find index of provided predicate
         * @param callback Iterator function
         * @returns {number} 
         */
        findIndex?: (callback?: _.ListIterator<T, boolean>) => number;
        /**
         * Delete item from list
         * @param item Item
         */
        delete(item: T): void;
        /**
         * Delete items on which passed the iterator truth test.
         * @param callback Iterator function
         */
        delete(callback?: _.ListIterator<T, boolean>): void;
        /**
         * Delete model by id
         * @description Deletes item from list
         * @param id Model id
         * @returns {IBaseListModel<TModel>}
         */
        deleteById?: (id: number) => Array<T>;
        /**
         *  Returns true if any of the values in the list pass the iterator truth test.
         * @param fn Iteratır function
         * @returns {boolean} 
         */
        any?: (fn: _.ListIterator<T, boolean>) => boolean;
        /**
        * Get count in the list pass the iterator truth test.
        * @param callback Iterator fuction
        * @returns {number} 
        */
        count?: (fn: _.ListIterator<T, boolean>) => number;
        /**
        * Filter the list in the list pass the iterator truth test.
        * @param callback Iterator function
        * @returns {IBaseListModel<TModel>}
        */
        where?: (fn: _.ListIterator<T, boolean>) => Array<T>;
        /**
        * Returns the first element of the list pass the iterator truth test.
        * @param callback Iterator function
        * @returns {TModel}
        */
        firstOrDefault?: (fn?: _.ListIterator<T, boolean>) => T;
        /**
       * Sum values returned from iteration function
       * @param fn Iteration function
       * @returns {number} 
       */
        sum?: (fn: _.ListIterator<T, number>) => number;
        /**
	    * A convenient version of what is perhaps the most common use-case for map: extracting a list of
	    * property values.
	    * @param list The list to pluck elements out of that have the property `propertyName`.
	    * @param propertyName The property to look for on each element within `list`.
	    * @return The list of elements within `list` that have the property `propertyName`.
	    **/
        pluck?: <TK extends keyof T>(propName: TK) => Array<T[TK]>;
    }
}
/**
 * Find model by its id
 * @param id 
 * @returns {} 
 */
Array.prototype.findById = function (id) {
    const item = _.findWhere(this, { id: id });
    return item;
};
/**
 * Find index of provided predicate
 * @param callback Iterator function
 * @returns {number} 
 */
Array.prototype.findIndex = function (callback: _.ListIterator<{}, boolean>) {
    return _.findIndex(this, callback);
};
/**
* Delete item of array
* @param args Iterator function or item itself to be deleted
*/
Array.prototype.delete = function (...args: any[]): void {
    if (args.length === 0) return;

    if (_.isFunction(args[0])) {
        const result = _.filter(this, args[0]);
        result.forEach((item) => {
            this.delete(item);
        });
    } else {
        const index = this.indexOf(args[0]);
        index > -1 && this.splice(index, 1);
    }
}
/**
 * Delete item by its id field
 * @param id 
 * @returns {} 
 */
Array.prototype.deleteById = function (id) {
    var _this = this;
    var items = _.where(this, { id: id });
    items.forEach(function (item) {
        var index = _this.indexOf(item);
        index > -1 && _this.splice(index, 1);
    });
    return this;
};
/**
 * Get count in the list pass the iterator truth test.
 * @param callback Iterator fuction
 * @returns {number} 
 */
Array.prototype.count = function (callback: _.ListIterator<any, boolean>): number {
    const items = this.where(this, callback);
    return items !== null ? items.length : 0;
}
/**
 *  Returns true if any of the values in the list pass the iterator truth test.
 * @param fn Iterator function
 * @returns {boolean} 
 */
Array.prototype.any = function (callback: _.ListIterator<any, boolean>): boolean {
    return _.some(this, callback);
}
/**
 * Filter the list in the list pass the iterator truth test.
  * @param callback Iterator function
 * @returns {IBaseListModel<TModel>}
 */
Array.prototype.where = function (callback: _.ListIterator<any, boolean>): Array<any> {
    return _.filter(this, callback);
}
/**
 * Returns the first element of the list pass the iterator truth test.
  * @param callback Iterator function
 * @returns {IBaseListModel}
 */
Array.prototype.firstOrDefault = function (callback?: _.ListIterator<any, boolean>): any {
    let result = this;
    if (callback)
        result = this.where(callback);
    return result[0];
}
/**
 * Sum values returned from iteration function
 * @param callBack Iteration function
 * @returns {number} 
 */
Array.prototype.sum = function (callBack: _.ListIterator<any, number>): number {
    return _.reduce<any, number>(this, (total, item, index, list) => {
        total += callBack(item, index, list);
        return total;
    }, 0);
}
/**
 * Extract a array with provided property name
 * @returns {Array<any>}
 */
Array.prototype.pluck = function (propName: string): Array<any> {
    return _.pluck(this, propName);
};

export { }