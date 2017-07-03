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

import * as _ from "underscore";
import * as _s from "underscore.string";
import * as moment from "moment";
/**
 * Obserablemodel responsible for tracking property changes and managing modelState algorithm
 */
class ObserableModel<TModel extends IBaseCrudModel> implements IObserableModel<TModel> {
    //#region Statics
    private static idField = "id";
    private static modelStateField = "modelState";
    private static modifiedPropsField = "modifiedProperties";
    private static stdFields = [ObserableModel.idField, ObserableModel.modelStateField];
    //#endregion

    //#region Standart Crud Props
    private _id: number;
    get id(): number { return this._id }
    set id(value: number) {
        if (this._readonly) return;
        this._id = value;
    }

    private _modelState: ModelStates;
    get modelState(): ModelStates { return this._modelState }
    set modelState(value: ModelStates) {
        if (this._readonly) return;

        const oldState = this._modelState;
        if (oldState === value) return;

        switch (value) {
            case ModelStates.Added:
                this._id = 0;
                //set all child as added
                this.iterateNavigationalModels(model => model.modelState = ModelStates.Added);
                break;
            case ModelStates.Deleted:
                if (oldState === ModelStates.Detached) return;
                if (oldState === ModelStates.Added) {
                    value = ModelStates.Detached;
                    break;
                }
                if (this._id === 0)
                    throw new Error("id must be valid when state set to deleted");

                if (oldState === ModelStates.Modified) {
                    this.revertOriginal();
                }
                //set all child as deleted
                this.iterateNavigationalModels(model => model.modelState = ModelStates.Deleted);
                break;
            case ModelStates.Modified:
                if (oldState !== ModelStates.Unchanged)
                    return;
            case ModelStates.Unchanged:
                break;
            case ModelStates.Detached:
                break;
        }
        this._modelState = value;
        //call change event
        this.fireDataChangedEvent(value, "modelState", value, oldState);
    }

    private __readonly: boolean;
    get _readonly(): boolean { return this.__readonly; }
    set _readonly(value: boolean) {
        if (this.__readonly === value) return;
        //set child array 
        this.iterateNavigationalModels(model => model._readonly = value);
        this.__readonly = value;
    }
    /**
     * Is Model dirty 
     */
    public _isDirty: boolean;
    /**
     * Orjinal values
     */
    public _orginalValues: TModel;
    /**
     * Globally unique id
     */
    public _gui: string;
    /**
     * All properties of model
     */
    public _values: IDictionary<any>;
    /**
     * Data changed event
     */
    private _dataChangeEvents: IModelDataChangedEvent[];
    //#endregion

    //#region Methods
    /**
     * Iterate navigational models
     * @param cb Callback
     */
    private iterateNavigationalModels(cb: (model: IObserableModel<IBaseCrudModel>) => void): void {
        _.each(this._values, (childItem): void => {
            if (_.isArray(childItem)) {
                _.each(childItem, (item: IObserableModel<IBaseCrudModel>) => {
                    if (item instanceof ObserableModel) {
                        cb(item);
                    }
                });
            } else if (childItem instanceof ObserableModel) {
                cb(childItem);
            }
        });
    }
    /**
     * get value depending on prop type 
     * @param value Prop value
     */
    private mapProperty(value: any): any {
        //if value is array,converto to ObserableModel array
        if (_.isArray(value)) {
            const subModels: IBaseListModel<IBaseCrudModel> = [];
            //set parent model
            subModels.parentModel = this;
            //listen collection for signal of model is being changed
            subModels.subscribeCollectionChanged(() => {
                this.fireDataChangedEvent();
            });
            //iterate nested models
            for (let jsubModel of value) {
                subModels.add(new ObserableModel(jsubModel, this));
            }
            return subModels;
        } else
            //if value is literal obj,convert to ObserableModel
            if (_.isObject(value)) {
                const navModel = new ObserableModel(value, this);
                //register datachange event to notify parent model
                navModel.subscribeDataChanged((action?: ModelStates, value?: any, oldValue?: any, key?: string) => {
                    this.fireDataChangedEvent(action, value, oldValue, key);
                });
                return navModel;
            }
        //otherwise,return primitive type
        return this.extractValue(value);
    }
    /**
     * Extract value depending on value type
     * @param value
     */
    private extractValue(value: any): any {
        //if value is date,create new date instance
        if (moment.isDate(value)) {
            return new Date(value);
        }
        //otherwise,return primitive type
        return value;
    }
    /**
     * Remove item setting Deleted state
     */
    remove(): void {
        this.modelState = ModelStates.Deleted;
    }
    /**
     * Restore model to orgin values
     */
    revertOriginal(): void {
        this.initProperties();
    }
    /**
    * Clone model with orginal values
    * @returns {IBaseCrudModel}
    */
    cloneModel(): TModel & IObserableModel<TModel> {
        const newModel = new ObserableModel(this._orginalValues);
        return <any>newModel;
    }
    /**
     * Convert model class to simple json object
     * @description Remove symbols which starts with _ and all functions
     */
    toJson(onlyChanges?: boolean): TModel {
        const jsonModel = {}, modifiedProps = [];
        //get properties of this object itself
        const allValues = _.chain(this)
            .keys()
            .union(ObserableModel.stdFields)
            .filter(key => { return !_s.startsWith(key, '$$') && !_s.startsWith(key, '_') })
            .reduce<_.Dictionary<any>>((memo, curr) => {
                memo[curr] = this[curr];
                return memo;
            }, {})
            .value();
        //convert literal obj recursively
        _.each(allValues, (value, key) => {
            if (_.isArray(value)) {
                const jArray = _.chain(value)
                    .filter(item => item instanceof ObserableModel)
                    .filter((item: IBaseCrudModel) => item.modelState !== ModelStates.Detached)
                    .map<IObserableModel<IBaseCrudModel>>((item: IObserableModel<IBaseCrudModel>) => item.toJson(onlyChanges))
                    .filter(item => !_.isEmpty(item))
                    .value();
                if (!onlyChanges || jArray.length)
                    jsonModel[key] = jArray;
            } else if (value instanceof ObserableModel) {
                if (value.modelState !== ModelStates.Detached) {
                    const navigationalModel = (value as IObserableModel<IBaseCrudModel>).toJson(onlyChanges);
                    if (!onlyChanges || !_.isEmpty(navigationalModel)) {
                        jsonModel[key] = navigationalModel;
                    }
                }
            } else {
                if (!onlyChanges || this.modelState === ModelStates.Added || this._orginalValues[key] !== value) {
                    jsonModel[key] = this.extractValue(value);
                    modifiedProps.unshift(key);
                }
            }
        });

        if (!_.isEmpty(jsonModel) && onlyChanges) {
            jsonModel[ObserableModel.idField] = this.id;

            if (this.modelState === ModelStates.Modified) {
                jsonModel[ObserableModel.modifiedPropsField] = _.difference(modifiedProps, ObserableModel.stdFields);
            }
        }

        return jsonModel as TModel;
    }
    /**
    * Copy values to orjinalvalues
    */
    acceptChanges(): void {
        this._orginalValues = this.toJson();
    }
    /**
     * Register datachanged callback recursively for model itself and all nested models
     * @param callback
     */
    subscribeDataChanged(callback: IModelDataChangedEvent): void {
        this._dataChangeEvents.push(callback);
    }
    /**
     * Fire data chanfed event
     * @param key Key
     * @param value Value
     * @param modelState modelstate of model
     */
    fireDataChangedEvent(action?: ModelStates, key?: string, newValue?: any, oldValue?: any): void {
        this._isDirty = true;

        if (this._dataChangeEvents) {
            for (let i = 0; i < this._dataChangeEvents.length; i++) {
                this._dataChangeEvents[i].call(this, action, newValue, oldValue, key);
            }
        }
    }
    /**
     * Set all literal props to property
     * @param crudModel
     */
    private initProperties(): void {
        this._values = {};
        this._isDirty = false;
        //set standart field
        if (this._orginalValues[ObserableModel.idField])
            this._id = this._orginalValues[ObserableModel.idField];
        if (this._orginalValues[ObserableModel.modelStateField])
            this._modelState = this._orginalValues[ObserableModel.modelStateField];
        //remove standart fields
        const purgedModel = _.omit(this._orginalValues, ObserableModel.stdFields);
        //define prop map 
        const modelPropsMap = _.mapObject(purgedModel, (value, key): PropertyDescriptor => {
            //convert array or nav props to obserable
            this._values[key] = this.mapProperty(value);

            const propMap: PropertyDescriptor = {
                enumerable: true,
                configurable: true,
                get: () => { return this._values[key]; },
                set: (newValue: any) => {
                    //return if readonly
                    if (this._readonly) return;

                    const oldValue = this._values[key];
                    //check equality
                    if (!_.isEqual(oldValue, newValue)) {
                        this._values[key] = newValue;
                        //set modelState
                        this.modelState = ModelStates.Modified;
                        //call datachanged event
                        this.fireDataChangedEvent(ModelStates.Modified, key, newValue, oldValue);
                    }
                }
            };
            return propMap;
        });
        //extend object with crud model props
        Object.defineProperties(this, modelPropsMap);
    }

    constructor(initialValues?: Partial<TModel>, public _parentModel?: IObserableModel<IBaseCrudModel>) {
        //set initial values
        this._id = 0;
        this._modelState = ModelStates.Detached;
        this._gui = _.uniqueId('model_');
        this._values = {} as TModel;
        this._orginalValues = {} as TModel;
        this._dataChangeEvents = [];
        this._isDirty =
            this.__readonly = false;

        if (!initialValues) return;
        this._orginalValues = initialValues instanceof ObserableModel ? initialValues.toJson() : initialValues;
        //init
        this.initProperties();
    }
    //#endregion
}

export { ObserableModel }