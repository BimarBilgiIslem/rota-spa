﻿/*
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
import BaseModelController from './basemodelcontroller';
import ObserableModel from "./obserablemodel";
//#endregion
/**
 * Base Modal controller
 */
class BaseModalController<TModel extends IBaseModel, TParams = any> extends BaseModelController<TModel>{
    //#region Statics,Members,Props
    private static readonly defaultOptions: IModalPageOptions = {
        registerName: null,
        initializeModel: true
    }
    static injects = BaseModelController.injects.concat(['$uibModalInstance', 'instanceOptions']);
    /**
     * Modal instance
     */
    $uibModalInstance: ng.ui.bootstrap.IModalServiceInstance;
    /**
     * Instance Options
     */
    instanceOptions: IModalInstanceOptions;
    /**
    * Model object
    * @returns {TModel}
    */
    get model(): TModel { return this._model as TModel; }
    set model(value: TModel) {
        if (this.isAssigned(value)) {
            this._model = value;
        }
    }
    /**
     * Modal params
     * @returns {} 
     */
    get params(): TParams { return this.instanceOptions.params }

    /**
    * Modal Page options
    * @returns {IModalPageOptions} 
    */
    get modalPageOptions(): IModalPageOptions { return this.options as IModalPageOptions }
    //#endregion

    constructor(bundle: IBundle) {
        //call base constructor
        super(bundle);
    }
    //#region InjcetableObject
    /**
    * Update bundle
    * @param bundle IBundle
    */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        this.$uibModalInstance = bundle.services["$uibmodalinstance"];
        this.instanceOptions = bundle.services["instanceoptions"] || {};
    }
    //#endregion

    //#region Modal 
    /**
    * Validation for modals
    */
    applyValidatitons(): angular.IPromise<IParserException> {
        const validateResult = super.applyValidatitons();
        validateResult.catch((err: IParserException) => {
            this.logger.toastr.warn({ message: err.message, title: err.title });
        });
        return validateResult;
    }
    /**
     * Close modal if validation success
     * @param data Result
     */
    ok(data: any): void {
        this.applyValidatitons().then(() => {
            this.modalResult(data);
        });
    }
    /**
     * Close modal with result
     * @param data Result
     */
    modalResult(data: any): void {
        this.$uibModalInstance.close(data || this.model);
    }
    /**
     * Close modal with dismiss
     */
    closeModal(reason?: any): void {
        if (this.common.isObserableModel(this.model)) {
            this.model.revertOriginal();
        }
        this.$uibModalInstance.dismiss(reason || this.model);
    }
    //#endregion

    //#region BaseModelController
    /**
     * Get model
     */
    getModel(): ng.IPromise<TModel> {
        return this.common.promise(this.instanceOptions.model);
    }
    /**
     * Convert model to obserable 
     * @param model Literal model
     */
    setModel(model: TModel): TModel {
        if (this.common.isObserableModel(model)) {
            return model as any;
        }
        if (!(this.instanceOptions.convertToObserableModel === false)) {
            return new ObserableModel(model) as any;
        }
        return model as any;
    }
    //#endregion
}
//Exports
export default BaseModalController