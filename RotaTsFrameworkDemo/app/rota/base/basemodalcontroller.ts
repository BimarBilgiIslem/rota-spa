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
import { BaseModelController } from './basemodelcontroller';
import { ObserableModel } from "./obserablemodel";
//#endregion
/**
 * Base Modal controller
 */
class BaseModalController<TModel extends IBaseCrudModel> extends BaseModelController<TModel>
    implements IBaseModalController {
    //#region Statics,Members,Props
    private static readonly defaultOptions: IModalPageOptions = {
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
    get model(): TModel & IObserableModel<TModel> { return this._model as TModel & IObserableModel<TModel>; }
    set model(value: TModel & IObserableModel<TModel>) {
        if (this.isAssigned(value)) {
            this._model = value;
        }
    }
    /**
     * Modal params
     * @returns {} 
     */
    get params(): any { return this.instanceOptions.params }

    /**
    * Modal Page options
    * @returns {IModalPageOptions} 
    */
    get modalPageOptions(): IModalPageOptions { return this.options as IModalPageOptions }
    //#endregion

    //#region InjcetableObject
    /**
    * Update bundle
    * @param bundle IBundle
    */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        this.$uibModalInstance = bundle.systemBundles["$uibmodalinstance"];
        this.instanceOptions = bundle.systemBundles["instanceoptions"] || {};
        //Inject optional custom services if any
        if (this.instanceOptions.services) {
            this.instanceOptions.services.forEach((service): void => {
                this.defineService(service, this.$injector.get(service));
            });
        }
    }
    //#endregion

    //#region Init
    /**
     * Extend crud page options with user options
     * @param bundle Service Bundle
     * @param options User options
     */
    private static extendOptions(bundle: IBundle, options?: IModalPageOptions): IModalPageOptions {
        const modalPageOptions: IModalPageOptions = angular.merge({}, BaseModalController.defaultOptions, options);
        return modalPageOptions;
    }

    constructor(bundle: IBundle, options?: IModalPageOptions) {
        super(bundle, BaseModalController.extendOptions(bundle, options));

        if (this.modalPageOptions.initializeModel) {
            this.initModel();
        }
    }
    //#endregion

    //#region Modal 
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
    closeModal(): void {
        this.model.revertOriginal();
        this.$uibModalInstance.dismiss(this.model);
    }
    //#endregion

    //#region BaseModelController
    /**
     * Get model
     */
    getModel(): TModel {
        return this.instanceOptions.model;
    }
    /**
     * Convert model to obserable 
     * @param model Literal model
     */
    setModel(model: TModel): TModel & IObserableModel<TModel> {
        if (!(model instanceof ObserableModel)) {
            return new ObserableModel<TModel>(model) as any;
        }
        return model as any;
    }
    //#endregion
}

export { BaseModalController }