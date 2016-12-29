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
    uploader: ng.angularFileUpload.IUploadService;
    common: ICommon;
    config: IMainConfig;
    localization: ILocalization;
    caching: ICaching;
    logger: ILogger;
    constants: IConstants;
    //#endregion

    //#region Init
    static injects = InjectableObject.injects.concat(['$q', '$http', 'Config', 'Common', 'Localization', 'Caching', 'Logger', 'Upload', 'Constants']);
    /**
   * Init bundle
   * @param bundle
   */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        this.$q = bundle.systemBundles['$q'];
        this.$http = bundle.systemBundles['$http'];
        this.config = bundle.systemBundles['config'];
        this.common = bundle.systemBundles['common'];
        this.localization = bundle.systemBundles['localization'];
        this.caching = bundle.systemBundles['caching'];
        this.logger = bundle.systemBundles['logger'];
        this.uploader = bundle.systemBundles['upload'];
        this.constants = bundle.systemBundles['constants'];
    }

    constructor(bundle: IBundle, public controller?: string, private moduleId?: string) {
        super(bundle);
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
    get<T extends IBaseModel>(options: IRequestOptions): ng.IPromise<T>;
    /**
    * Make get request
    * @param url Url
    * @param params Optional params
    * @returns {IPromise<T>} Promise
    */
    get<T extends IBaseModel>(action: string, params?: any): ng.IPromise<T>;
    /**
   * Make get request
   * @param url Url
   * @param params Optional params
   * @param cache Optional caching will be applied
   * @returns {IPromise<T>} Promise
   */
    get<T extends IBaseModel>(action: string, params?: any, cache?: boolean): ng.IPromise<T>;
    get<T extends IBaseModel>(...args: any[]): ng.IPromise<T> {
        return this.makeRequest<T>(RequestMethod.get, ...args);
    }
    /**
    * Make get request with cache options
    * @param options Request Options
    */
    post<T extends IBaseModel>(options: IRequestOptions): ng.IPromise<T>;
    /**
     * Make post request
     * @param url Url
     * @param data Payload object
     * @returns {IPromise<T>} Promise
     */
    post<T extends {}>(action: string, data?: any): ng.IPromise<T>;
    /**
     * Make post request
     * @param url Url
     * @param data Payload object
     * @param cache Optional caching will be applied
     * @returns {IPromise<T>} Promise
     */
    post<T extends {}>(action: string, data?: any, cache?: boolean): ng.IPromise<T>;
    post<T extends {}>(...args: any[]): ng.IPromise<T> {
        return this.makeRequest<T>(RequestMethod.post, ...args);
    }
    //#endregion

    //#region Utils
    /**
    * Generic request method using caching
    * @param method Request Method
    * @param args Request args
    */
    makeRequest<T>(method: RequestMethod, ...args: any[]): ng.IPromise<T> {
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
            const cachedData = this.caching.cachers[options.cacheType || CacherType.CacheStorage].get(cacheKey);

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
            .then((response: IBaseServerResponse<T>): T => {
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
                    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));
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