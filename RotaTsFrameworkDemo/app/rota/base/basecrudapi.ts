//#region Imports
import { BaseApi } from "./baseapi";
//#endregion
/**
 * Base Crud Api for all api services
 * @description Please refer to the static endpoint names defined below for info
 */
class BaseCrudApi<TModel extends IBaseCrudModel> extends BaseApi {
    //#region Init
    constructor(bundle: IBundle, controller?: string, moduleId?: string) {
        super(bundle, controller, moduleId);
    }
    //#endregion

    //#region Utils
    //#endregion

    //#region Standart Crud Methods
    /**
     * Make a get request to fetch all models filtered
     * @param filter Optional filter
     * @param controller Optional filter
     * @returns {ng.IPromise<TModel[]>}
     */
    getList(filter?: IBaseModelFilter, controller?: string): ng.IPromise<TModel[]> {
        return this.get<TModel[]>({ action: this.constants.server.ACTION_NAME_LIST, controller: controller, params: filter });
    }
    /**
    * Make a get request to fetch all models filtered and paged
   * @param filter Optional filter
    * @param controller Optional filter
    * @returns {ng.IPromise<IPagingListModel<TModel>>}
    */
    getPagedList(filter?: IBaseModelFilter, controller?: string): ng.IPromise<IPagingListModel<TModel>> {
        return this.get<IPagingListModel<TModel>>({ action: this.constants.server.ACTION_NAME_PAGED_LIST, controller: controller, params: filter });
    }
    /**
    * Make a get request to get model by id
    * @param id Unique id
    * @param controller Optional controller
    * @returns {ng.IPromise<TModel>}
    */
    getById(id: number, controller?: string): ng.IPromise<TModel> {
        return this.get<TModel>({ action: this.constants.server.ACTION_NAME_GET_BY_ID, controller: controller, params: { id: id } });
    }
    /**
    * Make a post request to save model
    * @param model Model
    * @param controller Optional controller
    * @returns {ng.IPromise<ICrudServerResponseData>}
    */
    save(model: TModel, controller?: string): ng.IPromise<ICrudServerResponseData> {
        return this.post<TModel>({ action: this.constants.server.ACTION_NAME_SAVE, controller: controller, data: model });
    }
    /**
    * Make a post request to delete model
    * @param id Unique id
    * @param controller Optional controller
    * @returns {ng.IPromise<any>}
    */
    delete(id: number, controller?: string): ng.IPromise<any> {
        return this.post({ url: this.getAbsoluteUrl(this.constants.server.ACTION_NAME_DELETE, controller) + '?id=' + id });
    }
    //#endregion
}

export { BaseCrudApi }