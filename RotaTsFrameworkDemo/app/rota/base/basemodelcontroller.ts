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
import BaseController from "./basecontroller"
import { Validators } from "../services/validators.service";
//#endregion
/**
 * This controller is used for loading the any model data remotely or localy
 * @description ModelController is responsible for
 * Loading model
 * Error handling
 * Providing model life cycle methods
 * Model abstraction methods
 */
abstract class BaseModelController<TModel extends IBaseModel> extends BaseController {
    //#region Props
    protected _model: ModelVariants<TModel>;
    modelPromise: ng.IPromise<ModelVariants<TModel>>;
    /**
     * List controller options
     */
    get modelPageOptions(): IModelPageOptions { return this.options as IModelPageOptions; }
    //#endregion

    //#region Bundle Services
    protected $http: ng.IHttpService;
    static injects = BaseController.injects.concat(['$http']);
    //#endregion

    //#region Init
    constructor(bundle: IBundle) {
        super(bundle);
        //options update
        this.modelPageOptions.newItemParamName =
            this.modelPageOptions.newItemParamName || this.config.defaultNewItemParamName;
        this.modelPageOptions.newItemParamValue =
            this.modelPageOptions.newItemParamValue || this.config.defaultNewItemParamValue;
        //get new instance of validator service
        this.validators = this.$injector.instantiate(Validators) as IValidators;
        this.validators.controller = this;
    }
    /**
    * Update bundle
    * @param bundle IBundle
    */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        this.$http = bundle.services['$http'];
    }
    //#endregion

    //#region Methods
    /**
     * @abstract Abstract get model method
     * @param args Optional params
     */
    abstract getModel(modelFilter?: IBaseModelFilter): ng.IPromise<ModelVariants<TModel>>;
    /**
     * Loaded model method triggered at last
     * @param model
     */
    protected loadedModel(model: ModelVariants<TModel>): void {
        //send broadcast
        this.$rootScope.$broadcast(this.config.eventNames.modelLoaded, model);
    }
    /**
    * Set model for some optional modifications
    * @param model Model
    */
    protected setModel(model: ModelVariants<TModel>): ModelVariants<TModel> {
        return model;
    }
    /**
     * Overridable model definition method
     * @param modelFilter Optional Model filter 
     */
    chooseModelSource(modelFilter?: IBaseModelFilter): ng.IPromise<ModelVariants<TModel>> {
        return this.getModel(modelFilter);
    }
    /**
     * Initiates getting data
     * @param args Optional params
     */
    initModel(modelFilter?: IBaseModelFilter): ng.IPromise<ModelVariants<TModel>> {
        const d = this.$q.defer<ModelVariants<TModel>>();
        const defineModelResult = this.chooseModelSource(modelFilter);

        if (this.common.isAssigned(defineModelResult)) {
            defineModelResult.then((data: ModelVariants<TModel>) => {
                //call setModel
                this._model = this.setModel(data);
                //call loadedModel
                this.loadedModel(this._model);
                d.resolve(data);
            }, (reason: any) => {
                d.reject(reason);
            });
        } else {
            d.reject("model data is missing");
        }
        return this.modelPromise = d.promise;
    }
    /**
     * this method is called from decorator with all injections are available
     * initModel is called as default
     */
    initController(): void {
        if (this.modelPageOptions.initializeModel) this.initModel();
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

export default BaseModelController



