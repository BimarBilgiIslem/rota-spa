//#region Imports
import { BaseController } from "./basecontroller"
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
        super(bundle, options);
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