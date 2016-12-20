import { ObserableModel } from "../base/obserablemodel";
/**
 * Set readonly prop of array
 */
Object.defineProperty(Array.prototype, "_readonly",
    {
        enumerable: false,
        configurable: true,
        get: function () {
            return this.__readonly;
        },
        set: function (value) {
            if (this.__readonly === value) return;
            //set all child models readonly 
            _.each(this, (item: IObserableModel<IBaseCrudModel>) => item._readonly = value);
            this.__readonly = value;
        }
    });
/**
 * Revert all items to original values
 */
Array.prototype["revertOriginal"] = function (): void {
    for (let oModel of this) {
        if (oModel.modelState === ModelStates.Added ||
            oModel.modelState === ModelStates.Detached) {
            this.remove(oModel);
            continue;
        }
        oModel.revertOriginal();
    }
}
/**
* Find model in collection by id
* @param id Model id
* @returns {IBaseCrudModel}
*/
Array.prototype["findById"] = function (id: number): IBaseCrudModel {
    const item = _.findWhere(this, { id: id });
    return item as IBaseCrudModel;
}
/**
 * Find model in collection by gui 
 * @param gui Gui
 * @returns {IBaseCrudModel}
 */
Array.prototype["findByGui"] = function (gui: string): IBaseCrudModel {
    const item = _.findWhere(this, { gui: gui });
    return item as IBaseCrudModel;
}
/**
 * Get count in the list pass the iterator truth test.
 * @param callback Iterator fuction
 * @returns {number} 
 */
Array.prototype["count"] = function (callback: _.ListIterator<IBaseCrudModel, boolean>): number {
    const items = this.where(this, callback);
    return items !== null ? items.length : 0;
}
/**
 *  Returns true if any of the values in the list pass the iterator truth test.
 * @param fn Iterator function
 * @returns {boolean} 
 */
Array.prototype["any"] = function (callback: _.ListIterator<IBaseCrudModel, boolean>): boolean {
    return _.some(this, callback);
}
/**
 * Filter the list in the list pass the iterator truth test.
  * @param callback Iterator function
 * @returns {IBaseListModel<TModel>}
 */
Array.prototype["where"] = function (callback: _.ListIterator<IBaseCrudModel, boolean>): Array<IBaseCrudModel> {
    return _.filter<IBaseCrudModel>(this, callback);
}
/**
 * Returns the first element of the list pass the iterator truth test.
  * @param callback Iterator function
 * @returns {IBaseListModel}
 */
Array.prototype["firstOrDefault"] = function (callback?: _.ListIterator<IBaseCrudModel, boolean>): IBaseCrudModel {
    let result = this;
    if (callback)
        result = this.where(callback);
    return result[0];
}
/**
* Delete model by id
* @param id Model id
* @returns {IBaseListModel<TModel>}
*/
Array.prototype["deleteById"] = function (id: number): Array<IBaseCrudModel> {
    const items = _.where(this, { id: id });
    items.forEach((item): void => {
        const index = this.indexOf(item);
        index > -1 && this.splice(index, 1);
    });
    return this;
}
/**
 * Remove model from collection either deleting or marking deleted
 * @param model 
 * @returns {IBaseListModel<TModel>}
 */
Array.prototype["remove"] = function (model: IObserableModel<IBaseCrudModel>): Array<IBaseCrudModel> {
    model.remove();
    return this;
}
/**
* Remove model by id
* @param id Model id
* @returns {IBaseListModel<TModel>}
*/
Array.prototype["removeById"] = function (id: number): Array<IBaseCrudModel> {
    const items = _.where(this, { id: id });
    items.forEach((item): void => {
        (this as IBaseListModel<IBaseCrudModel>).remove(<IBaseCrudModel>item);
    });
    return this;
}
/**
* Remove all items
* @returns {IBaseListModel<TModel>}
*/
Array.prototype["removeAll"] = function (): Array<IBaseCrudModel> {
    this.forEach((item): void => {
        (this as IBaseListModel<IObserableModel<IBaseCrudModel>>).remove(item);
    });
    return this;
}
/**
 * Add new item to collection and return
 * @returns {IBaseCrudModel}
 */
Array.prototype["new"] = function (values?: IBaseCrudModel): IBaseCrudModel {
    const item = new ObserableModel(values);
    (this as IBaseListModel<IObserableModel<IBaseCrudModel>>).add(item);
    return item;
}
/**
* Add item to list
* @param item TModel
*/
Array.prototype["add"] = function (model: IBaseCrudModel | IObserableModel<IBaseCrudModel>): Array<IBaseCrudModel> {
    //Check same unique gui literally same obj
    if (this.any(a => a._gui === (model as IObserableModel<IBaseCrudModel>)._gui))
        return this;
    //convert literal to obserable 
    if (!(model instanceof ObserableModel)) {
        model = new ObserableModel(model);
    }
    //set readonly - this is hack for rtMultiSelect.
    (model as IObserableModel<IBaseCrudModel>)._readonly = this._readonly;
    //Return if readonly
    if (this._readonly) return this;
    //validation
    if (this.any(a => a.id === model.id && a.id !== 0)) {
        throw new Error(`cannot be added to list with the same unique id (${model.id})`);
    }
    //register model changes event
    const self = this;
    (model as IObserableModel<IBaseCrudModel>).subscribeDataChanged(function (action?: ModelStates): void {
        //only added or deleted model changes events accepted 
        if (self._collectionChangedEvents) {
            for (let i = 0; i < self._collectionChangedEvents.length; i++) {
                const callbackItem = self._collectionChangedEvents[i];
                callbackItem.call(self, action, this);
            }
        }
    });
    //add item to array
    this.push(model);
    //set added if detached
    if (model.modelState === ModelStates.Detached) {
        (model as IObserableModel<IBaseCrudModel>).acceptChanges();
        model.modelState = ModelStates.Added;
    }

    return this;
}
/**
 * Register callback event for all collection changes
 * @param callback Callback method
 */
Array.prototype["subscribeCollectionChanged"] = function (callback: IModelCollectionChangedEvent, includeAllChanges?: boolean): void {
    if (!this._collectionChangedEvents) this._collectionChangedEvents = [];
    this._collectionChangedEvents.push(callback);
}
/**
 * Sum values returned from iteration function
 * @param callBack Iteration function
 * @returns {number} 
 */
Array.prototype["sum"] = function (callBack: _.ListIterator<IBaseCrudModel, number>): number {
    return _.reduce<IBaseCrudModel, number>(this, (total, item, index, list) => {
        total += callBack(item, index, list);
        return total;
    }, 0);
}