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
import BaseApi from "./baseapi";
//#endregion
/**
 * Base Crud Api for all api services
 * @description Please refer to the static endpoint names defined below for info
 */
class BaseCrudApi<TModel extends IBaseCrudModel> extends BaseApi {
    //#region Props
    protected $rootScope: IRotaRootScope;
    //#endregion

    //#region Init
    /**
     * Note that $rootScope is injected to communicate
       with global rtDownload located in content page for exporting model
     */
    static injects = BaseApi.injects.concat(['$rootScope']);
    /**
    * Update bundle
    * @param bundle IBundle
    */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        this.$rootScope = bundle.services["$rootscope"];
    }
    //#endregion

    //#region Standart Crud Methods
    /**
     * Make a get request to fetch all models filtered
     * @param filter Optional filter
     * @param controller Optional filter
     * @returns {ng.IPromise<TModel[]>}
     */
    getList(filter?: IBaseListModelFilter, controller?: string): ng.IPromise<TModel[]> {
        return this.get<TModel[]>({
            action: this.config.crudActionNames.getList,
            controller: controller,
            params: filter
        });
    }

    /**
    * Make a get request to fetch all models filtered and paged
   * @param filter Optional filter
    * @param controller Optional filter
    * @returns {ng.IPromise<IPagingListModel<TModel>>}
    */
    getPagedList(filter?: IBaseListModelFilter, controller?: string): ng.IPromise<IPagingListModel<TModel>> {
        return this.get<IPagingListModel<TModel>>({
            action: this.config.crudActionNames.getPagedList,
            controller: controller,
            params: filter
        });
    }

    /**
    * Make a get request to get model by id
    * @param id Unique id
    * @param controller Optional controller
    * @returns {ng.IPromise<TModel>}
    */
    getById(id: number, controller?: string): ng.IPromise<TModel> {
        if (!id || id <= 0 || !this.common.isNumber(id)) {
            this.logger.console.error({ message: 'getById/id param must be number but received ' + id });
            return this.common.promise();
        }
        return this.get<TModel>({
            action: this.config.crudActionNames.getById,
            controller: controller,
            params: { id: id }
        });
    }

    /**
    * Make a post request to save model
    * @param model Model
    * @param controller Optional controller
    * @returns {ng.IPromise<ICrudServerResponseData>}
    */
    save(model: TModel, controller?: string): ng.IPromise<ICrudServerResponseData> {
        return this.post<ICrudServerResponseData>({
            action: this.config.crudActionNames.save,
            controller: controller, data: model
        });
    }

    /**
    * Make a post request to delete model
    * @param id Unique id
    * @param controller Optional controller
    * @returns {ng.IPromise<any>}
    */
    delete(id: number, controller?: string): ng.IPromise<any> {
        return this.post({ url: this.getAbsoluteUrl(this.config.crudActionNames.delete, controller) + '?id=' + id });
    }
    /**
     * Export model with provided filter
     * @param filter Filter and export options
     * @param controller Optional controller
     */
    exportList(filter?: IExportFilter<IBaseListModelFilter>, controller?: string): void {
        const url = `${this.getAbsoluteUrl(this.config.crudActionNames.exportList, controller)}`;
        //starts download in rtDownload
        this.$rootScope.$broadcast(this.constants.events.EVENT_START_FILEDOWNLOAD, { url, filter });
    }
    //#endregion
}
//export
export default BaseCrudApi 