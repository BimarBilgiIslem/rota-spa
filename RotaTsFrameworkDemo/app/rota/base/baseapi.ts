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
import { InjectableObject } from "./injectableobject";
//#endregion

enum RequestMethod {
    get,
    post,
    put,
    delete
}

/**
 * Base Api for all api services
 */
class BaseApi extends InjectableObject implements IBaseApi {
    //#region Props
    $q: angular.IQService;
    $http: ng.IHttpService;
    $httpParamSerializer: (object: any) => string;
    uploader: ng.angularFileUpload.IUploadService;
    common: ICommon;
    config: IMainConfig;
    localization: ILocalization;
    caching: ICaching;
    logger: ILogger;
    constants: IConstants;
    //url options
    controller?: string;
    moduleId?: string;
    //#endregion


    //#region Init
    static injects = InjectableObject.injects.concat(['$q', '$http', '$httpParamSerializer', 'Config', 'Common',
        'Localization', 'Caching', 'Logger', 'Upload', 'Constants']);
    /**
   * Init bundle
   * @param bundle
   */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        this.$q = bundle.services['$q'];
        this.$http = bundle.services['$http'];
        this.$httpParamSerializer = bundle.services['$httpparamserializer'];
        this.config = bundle.services['config'];
        this.common = bundle.services['common'];
        this.localization = bundle.services['localization'];
        this.caching = bundle.services['caching'];
        this.logger = bundle.services['logger'];
        this.uploader = bundle.services['upload'];
        this.constants = bundle.services['constants'];
    }

    constructor(bundle: IBundle) {
        super(bundle);
        //set options
        this.controller = (bundle.options as IApiOptions).serverApi;
        this.moduleId = (bundle.options as IApiOptions).moduleId;
    }
    //#endregion

    //#region Methods
    /**
     * Upload a file to remote server
     * @param file Selected file info
     * @param params Optional params to send to server
     */
    fileUpload(file: IFileInfo, params?: any): ng.IPromise<IFileUploadResponseData> {
        return this.uploader.upload(<any>{
            showSpinner: false,
            url: this.getAbsoluteUrl(this.constants.server.ACTION_NAME_DEFAULT_FILE_UPLOAD),
            method: RequestMethod[RequestMethod.post],
            data: this.common.extend({ file: file }, params)
        }).then((response: IBaseServerResponse<IFileUploadResponseData>): IFileUploadResponseData => {
            this.logger.console.log({ message: `'${file.name}' file succesfully uploaded` });
            return response.data;
        });
    }
    /**
    * Make get request with cache options
    * @param options Request Options
    */
    get<TResult>(options: IRequestOptions): ng.IPromise<TResult>;
    /**
    * Make get request
    * @param url Url
    * @param params Optional params
    * @returns {IPromise<T>} Promise
    */
    get<TResult>(action: string, params?: object): ng.IPromise<TResult>;
    /**
   * Make get request
   * @param url Url
   * @param params Optional params
   * @param cache Optional caching will be applied
   * @returns {IPromise<T>} Promise
   */
    get<TResult>(action: string, params?: object, cache?: boolean): ng.IPromise<TResult>;
    get<TResult>(...args: any[]): ng.IPromise<TResult> {
        return this.makeRequest<TResult>(RequestMethod.get, ...args);
    }
    /**
    * Make get request with cache options
    * @param options Request Options
    */
    post<TResult>(options: IRequestOptions): ng.IPromise<TResult>;
    /**
     * Make post request
     * @param url Url
     * @param data Payload object
     * @returns {IPromise<T>} Promise
     */
    post<TResult>(action: string, data?: object): ng.IPromise<TResult>;
    /**
     * Make post request
     * @param url Url
     * @param data Payload object
     * @param cache Optional caching will be applied
     * @returns {IPromise<T>} Promise
     */
    post<TResult>(action: string, data?: object, cache?: boolean): ng.IPromise<TResult>;
    post<TResult>(...args: any[]): ng.IPromise<TResult> {
        return this.makeRequest<TResult>(RequestMethod.post, ...args);
    }
    //#endregion

    //#region Utils
    /**
    * Generic request method using caching
    * @param method Request Method
    * @param args Request args
    */
    private makeRequest<TResult>(method: RequestMethod, ...args: any[]): ng.IPromise<TResult> {
        if (args.length === 0) return null;

        let options: IRequestOptions;
        if (this.common.isString(args[0])) {
            options = {
                action: args[0],
                cache: args[2]
            };
            options[method === RequestMethod.post ? "data" : "params"] = args[1];
        } else {
            options = args[0] as IRequestOptions;
        }
        //update url
        options.url = options.url || this.getAbsoluteUrl(options.action, options.controller);
        //check if cache is active and returns cached data
        if (options.cache) {
            const cacheKey = options.cacheKey || this.buildUrl(options.url, this.common.extend(options.params, options.data));
            const cachedData = this.caching.cachers[options.cacheType || CacherType.CacheStorage].get<TResult>(cacheKey);

            if (this.common.isAssigned(cachedData)) {
                return this.$q.when(cachedData);
            }
        }
        //remote request
        return this.$http(<any>{
            method: RequestMethod[method],
            url: options.url,
            data: options.data || "",
            headers: {
                "Content-Type": "application/json"
            },
            params: options.params,
            showSpinner: options.showSpinner
        })
            .then((response: IBaseServerResponse<TResult>): TResult => {
                //cache if configured
                if (options.cache) {
                    const cacheKey = options.cacheKey || this.buildUrl(options.url, options.params);
                    this.caching.cachers[options.cacheType || CacherType.CacheStorage].store(cacheKey, response.data);
                }
                return response.data;
            });
    }
    /**
     * Generate url with url and params
     * @param url Url
     * @param params Params object
     */
    buildUrl(url: string, params?: any): string {
        if (!params) return url;

        const parts = [];

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                let value = params[key];
                if (!this.common.isAssigned(value)) continue;
                if (!this.common.isArray(value)) value = [value];

                value.forEach((v): void => {
                    if (angular.isObject(v)) {
                        if (angular.isDate(v)) {
                            v = v.toISOString();
                        } else {
                            v = angular.toJson(v);
                        }
                    }
                    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
                });
            }
        }
        if (parts.length > 0) {
            url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
        }
        return url;
    }
    /**
     * Generate uri with action,controller and api prefix
     * @param action Action
     * @param controller Optional controller name
     */
    getAbsoluteUrl(action: string, controller?: string): string {
        let url = `${this.config.defaultApiPrefix}/${controller || this.controller}/${action}`;
        //if xdom module is defined
        //TODO:Same origin might be eliminated
        if (!this.common.isNullOrEmpty(this.moduleId)) {
            url = window.require.toUrl(`${this.moduleId}/${url}`);
        }
        return url;
    }
    //#endregion
}

export { BaseApi }