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

//#region Imports
import { BaseController } from "./basecontroller"
import constants = require('config/constants')
//#endregion
/**
 * This controller is used for loading the any model data remotely or localy
 * @description ModelController is responsible for
 * Loading model
 * Error handling
 * Providing model life cycle methods
 * Model abstraction methods
 */
abstract class BaseModelController<TModel extends IBaseCrudModel> extends BaseController {
    //#region Static
    private static readonly defaultModelPageOptions: IModelPageOptions = {
        pkModelFieldName: constants.controller.DEFAULT_MODEL_ID_FIELD_NAME
    }
    //#endregion

    //#region Props
    protected _model: TModel | IBaseListModel<TModel> | IPagingListModel<TModel>;
    modelPromise: ng.IPromise<TModel | IBaseListModel<TModel> | IPagingListModel<TModel>>;
    //#endregion

    //#region Bundle Services
    protected $q: ng.IQService;
    protected $http: ng.IHttpService;
    static injects = BaseController.injects.concat(['$q', '$http']);
    //#endregion

    //#region Init
    constructor(bundle: IBundle, options?: IModelPageOptions) {
        super(bundle, angular.extend(BaseModelController.defaultModelPageOptions, options));
    }
    /**
    * Update bundle
    * @param bundle IBundle
    */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);

        this.$q = bundle.systemBundles['$q'];
        this.$http = bundle.systemBundles['$http'];
    }
    //#endregion

    //#region Methods
    /**
     * @abstract Abstract get model method
     * @param args Optional params
     */
    abstract getModel(modelFilter?: IBaseModelFilter): ng.IPromise<TModel> | TModel | ng.IPromise<IBaseListModel<TModel>> |
        IBaseListModel<TModel> | ng.IPromise<IPagingListModel<TModel>> | IPagingListModel<TModel>;
    /**
     * Loaded model method triggered at last
     * @param model
     */
    protected loadedModel(model: TModel | IBaseListModel<TModel> | IPagingListModel<TModel>): void {
        //send broadcast
        this.$rootScope.$broadcast(this.config.eventNames.modelLoaded, model);
    }
    /**
    * Set model for some optional modifications
    * @param model Model
    */
    protected setModel(model: TModel | IBaseListModel<TModel> | IPagingListModel<TModel>): TModel | IBaseListModel<TModel> | IPagingListModel<TModel> {
        return model;
    }
    /**
     * Overridable model definition method
     * @param modelFilter Optional Model filter 
     */
    defineModel(modelFilter?: IBaseModelFilter): ng.IPromise<TModel> | TModel | ng.IPromise<IBaseListModel<TModel>> |
        IBaseListModel<TModel> | ng.IPromise<IPagingListModel<TModel>> | IPagingListModel<TModel> {
        return this.getModel(modelFilter);
    }
    /**
     * Initiates getting data
     * @param args Optional params
     */
    protected initModel(modelFilter?: IBaseModelFilter): ng.IPromise<TModel | IBaseListModel<TModel> | IPagingListModel<TModel>> {
        const d = this.$q.defer();
        const defineModelResult = this.defineModel(modelFilter);

        const processModel = (model: TModel | IBaseListModel<TModel> | IPagingListModel<TModel>): void => {
            //call modelloaded event
            this.loadedModel(this._model = this.setModel(model));
            d.resolve(model);
        }

        if (this.common.isPromise(defineModelResult)) {
            (defineModelResult as ng.IPromise<any>).then((data: TModel | IBaseListModel<TModel> | IPagingListModel<TModel>) => {
                processModel(data);
            }, (reason: any) => {
                //TODO: can be changed depending on server excepion response
                //this.errorModel(reason.data || reason);
                d.reject(reason);
            });
        } else {
            processModel(defineModelResult);
        }
        return this.modelPromise = d.promise;
    }
    /**
     * Process chainable thenable functions
     * @param pipeline Thenable functions
     * @param params Optional parameters
     */
    protected initParsers<T>(pipeline: Array<IChainableMethod<T>>, ...params: any[]): ng.IPromise<T> {
        let result = this.common.promise();
        //iterate pipeline methods
        for (let i = 0; i < pipeline.length; i++) {
            result = ((promise: ng.IPromise<any>, method: IChainableMethod<T>) => {
                return promise.then((response: any) => {
                    response && params.push(response);
                    if (method) {
                        return method.apply(this, params);
                    }
                    return params;
                });
            })(result, pipeline[i]);
        }
        return result;
    }
    //#endregion

    //#region BaseController
    /**
    * Controller getting destroyed
    */
    protected destroy(): void {
        super.destroy();
        delete this._model;
    }
    //#endregion

}

export { BaseModelController }