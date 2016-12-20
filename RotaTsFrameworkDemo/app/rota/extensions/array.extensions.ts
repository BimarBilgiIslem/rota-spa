/**
 * Extending global array
 */
declare global {
    interface Array<T> {
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
    }
}

/**
* Delete item of array
* @param args Iterator function or item itself to be deleted
*/
Array.prototype["delete"] = function (...args: any[]): void {
    if (args.length === 0) return null;

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

export { }