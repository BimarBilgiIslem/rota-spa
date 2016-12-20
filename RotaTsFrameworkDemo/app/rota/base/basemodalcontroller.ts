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
    constructor(bundle: IBundle, options?: IModalPageOptions) {
        super(bundle, options);

        const modalPageOptions = this.common.extend<IModalPageOptions>({ initializeModel: true }, options);

        if (modalPageOptions.initializeModel) {
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
            return <any>new ObserableModel<TModel>(model);
        }
        return <any>model;
    }
    //#endregion
}

export { BaseModalController }