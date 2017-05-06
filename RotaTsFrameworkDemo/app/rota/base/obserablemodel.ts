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
import constants = require('config/constants')
/**
 * Obserablemodel responsible for tracking property changes and managing modelState algorithm
 */
class ObserableModel<TModel extends IBaseCrudModel> extends Object implements IObserableModel<TModel> {
    //#region Statics
    private static idField = constants.controller.DEFAULT_MODEL_ID_FIELD_NAME;
    private static modelStateField = "modelState";
    private static modifiedPropsField = "modifiedProperties";
    private static stdFields = [ObserableModel.idField, ObserableModel.modelStateField];
    //#endregion

    //#region Standart Crud Props
    get id(): number { return this[`_${this._pkFieldName}`] }
    set id(value: number) {
        if (this._readonly) return;
        this[`_${this._pkFieldName}`] = value;
    }

    private _modelState: ModelStates;
    get modelState(): ModelStates { return this._modelState }
    set modelState(value: ModelStates) {
        if (this._readonly) return;

        const oldState = this._modelState;
        if (oldState === value) return;

        switch (value) {
            case ModelStates.Added:
                this._values[this._pkFieldName] = 0;
                break;
            case ModelStates.Deleted:
                if (oldState === ModelStates.Detached) return;
                if (oldState === ModelStates.Added) {
                    value = ModelStates.Detached;
                    break;
                }
                if (this._values[this._pkFieldName] === 0)
                    throw new Error(`id must be valid when state set to deleted ${this._pkFieldName}`);
                //set all child models state
                _.each(this._values, (childItem): void => {
                    if (_.isArray(childItem)) {
                        _.each(childItem, (item: IBaseCrudModel) => {
                            if (item.modelState)
                                item.modelState = value;
                        });
                    }
                });
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
        _.chain(this._values)
            .filter(item => _.isArray(item))
            .each(item => item._readonly = value);
        this.__readonly = value;
    }

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
    extractValue(value: any): any {
        if (moment.isDate(value)) {
            return new Date(value);
        }
        return value;
    }
    /**
     * Extend model with source param 
     * @param source Source Model
     */
    extendModel(source: IObserableModel<TModel>): void {
        this[`_${this._pkFieldName}`] = source[`_${this._pkFieldName}`];
        this._modelState = source.modelState;
        this.initProperties(source.toJson());
        this.fireDataChangedEvent(this.modelState);
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
        //bind events for nested fresh models
        for (let event of this._dataChangeEvents) {
            const subCollections = _.filter<IBaseListModel<TModel>>(this._values, item => _.isArray(item));
            _.each(subCollections, items => {
                items.subscribeCollectionChanged(event);
            });
        }
    }
    /**
    * Clone model with orginal values
    * @returns {IBaseCrudModel}
    */
    cloneModel(): TModel & IObserableModel<TModel> {
        const newModel = new ObserableModel(this._values);
        return <any>newModel;
    }
    /**
     * Convert model class to simple json object
     * @description Remove symbols which starts with _ and all functions
     */
    toJson(onlyChanges?: boolean): TModel {
        const jsonModel = {}, modifiedProps = [];
        //get properties 
        const allValues = _.chain(this)
            .keys()
            .union(ObserableModel.stdFields)
            .filter(key => { return !_s.startsWith(key, '$$') && !_s.startsWith(key, '_') })
            .reduce((memo, curr) => {
                if (curr === this._pkFieldName) {
                    memo[curr] = this.id;
                } else {
                    memo[curr] = this[curr];
                }
                return memo;
            }, {})
            .value();
        //convert literal obj recursivly
        _.each(<_.Dictionary<any>>allValues, (value, key) => {
            if (_.isArray(value)) {
                const jArray = _.chain(value)
                    .filter((item: IBaseCrudModel) => item.modelState !== ModelStates.Detached)
                    .map<IObserableModel<IBaseCrudModel>>((item: IObserableModel<IBaseCrudModel>) => item.toJson(onlyChanges))
                    .filter(item => !_.isEmpty(item))
                    .value();
                if (!onlyChanges || jArray.length)
                    jsonModel[key] = jArray;
            } else {
                if (!onlyChanges || this.modelState === ModelStates.Added || this._orginalValues[key] !== value) {
                    jsonModel[key] = this.extractValue(value);
                    modifiedProps.unshift(key);
                }
            }
        });

        if (!_.isEmpty(jsonModel) && onlyChanges) {
            jsonModel[this._pkFieldName] = this.id;
            jsonModel[ObserableModel.modifiedPropsField] = _.difference(modifiedProps, ObserableModel.stdFields);
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
        //register dataChanged event for nested models
        const subCollections = _.filter<IBaseListModel<IBaseCrudModel>>(this._values, item => _.isArray(item));
        _.each(subCollections, items => {
            items.subscribeCollectionChanged(callback);
        });
    }
    /**
     * Fire data chanfed event
     * @param key Key
     * @param value Value
     * @param modelState modelstate of model
     */
    private fireDataChangedEvent(action?: ModelStates, key?: string, newValue?: any, oldValue?: any): void {
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
    private initProperties(values?: IDictionary<any>): void {
        this._values = {};
        //remove standart fields
        const purgedModel = _.omit(values || this._orginalValues, ObserableModel.stdFields);
        //define prop map 
        const modelPropsMap = _.mapObject(purgedModel, (value, key): PropertyDescriptorMap => {
            //check array
            if (_.isArray(value)) {
                const subModels = ([] as IBaseListModel<IBaseCrudModel>);
                _.each<IBaseCrudModel>(value, jModel => { subModels.add(new ObserableModel(jModel)) });
                this._values[key] = subModels;
            } else {
                //set private 
                this._values[key] = this.extractValue(value);
            }

            const propMap: PropertyDescriptorMap = {
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

    constructor(initialValues?: any, private _pkFieldName: string = ObserableModel.idField) {
        super();
        //set initial values
        this[`_${_pkFieldName}`] = 0;
        //replace id field name
        if (_pkFieldName !== ObserableModel.idField) {
            ObserableModel.stdFields[0] = _pkFieldName;
        }
        this._modelState = ModelStates.Detached;
        this._gui = _.uniqueId('model_');
        this._values =
            this._orginalValues = {} as TModel;
        this._dataChangeEvents = [];
        this.__readonly = false;

        if (!initialValues) return;

        this._orginalValues = (initialValues instanceof ObserableModel) ?
            (initialValues as IObserableModel<TModel>).toJson() : initialValues;

        if (initialValues[_pkFieldName])
            this[`_${_pkFieldName}`] = initialValues[_pkFieldName];
        if (initialValues[ObserableModel.modelStateField])
            this._modelState = initialValues[ObserableModel.modelStateField];

        this.initProperties();
    }
    //#endregion
}

export { ObserableModel }