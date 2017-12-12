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

import ObserableModel from "../base/obserablemodel";
import * as _s from "underscore.string";
//#region Common Service
class Common implements ICommon {
    serviceName: string = "Common Service";
    static injectionName = "Common";

    //#region Init
    constructor(private $q: ng.IQService, private $filter: ng.IFilterService,
        private $interpolate: ng.IInterpolateService, private config: IMainConfig,
        private securityconfig: ISecurityConfig, private tokens: ITokens) { }
    //#endregion

    //#region Promise Utils
    /**
     * Return promise with provided arg
     * @param p Arg
     */
    promise<T=any>(p?: T): ng.IPromise<T> {
        return this.$q.when<T>(p);
    }
    /**
     * Return rejected promise with reason
     * @param reason Arg
     */
    rejectedPromise<T>(reason?: T): ng.IPromise<T> {
        const d = this.$q.defer<T>();
        d.reject(reason);
        return d.promise;
    }
    /**
     * Return promise with provided arg if its not thenable
     * @param value Arg
     */
    makePromise<T>(value: any): ng.IPromise<T> {
        return this.isPromise(value) ? value : this.promise<T>(value);
    }
    /**
     * Check whether or not provided param is promise
     * @param value Arg
     */
    isPromise(value: any): value is ng.IPromise<any> {
        return value && angular.isFunction(value.then);
    }
    //#endregion

    //#region Path Utils
    /**
     * Check whether or not provided value ends with html extension
     * @param value Arg
     */
    isHtml(value: string): boolean {
        if (!this.isAssigned(value)) return false;
        return value.indexOf('html', value.length - 4) > -1;
    }
    /**
     * Extract file name from full path
     * @param path File full path
     */
    extractFileName(path: string): string {
        var fname = path.split('/').pop();
        var dotIndex = fname.indexOf('.');

        if (dotIndex > -1)
            return fname.substr(0, dotIndex);
        else
            return fname;
    }
    /**
     * Add prefix/suffix slash's
     * @param path Path
     */
    addSlash(path: string): string {
        return this.addPrefixSlash(this.addTrailingSlash(path));
    }
    /**
     * Add trailing slash
     * @param path Path
     */
    addTrailingSlash(path: string): string {
        var sonChar = path && path[path.length - 1];

        if (sonChar === '/')
            return path;
        else
            return path + '/';
    }
    /**
     * Add prefix slash
     * @param path Path
     */
    addPrefixSlash(path: string): string {
        const ilkChar = path && path[0];

        if (ilkChar === '/')
            return path;
        else
            return '/' + path;
    }

    /**
     * Convert relative url ro absolute url
     * @param relativeUrl Relative url
     */
    toUrl(relativeUrl: string, includeCacheBust: boolean = true): string {
        const absolutePath = window.require.toUrl(relativeUrl);
        if (includeCacheBust === false) return absolutePath.split("?")[0];
        return absolutePath;
    }
    /**
     * Get defined baseurl of requirejs config
     */
    getBasePath(): string {
        return this.toUrl('.').split("?")[0];
    }
    //#endregion

    //#region String Utils
    /**
     * Format string using interpolate service
     * @param src Source string with macros in it
     * @param context Context obj including macro values
     * @example
     * const src = 'Hello {{world}} !';
     * format(src,{world:'World'});
     * result => Hello World ! ;
     */
    format(src: string, context: any): string {
        return this.$interpolate(src)(context);
    }
    /**
     * Guard method checks for string
     * @param value Any object
     */
    isString(value: any): value is string {
        return angular.isString(value);
    }
    /**
     * Checks string value is not empty or null
     * @param value
     */
    isNullOrEmpty(value: string): boolean {
        if (this.isAssigned(value)) {
            const v = value.trim();
            return v === "";
        }
        return true;
    }
    //#endregion

    //#region Utils
    /**
     * Add access token to url
     * @param url
     */
    appendAccessTokenToUrl(url: string): string {
        return this.updateQueryStringParameter(url,
            this.securityconfig.accessTokenQueryStringName,
            this.tokens.accessToken);
    }
    /**
     * Get first item which is not null or undefined
     * @param args Parameters
     * @returns {T} Result
     */
    iif<T>(...args: T[]): T {
        for (let item of args) {
            if (this.isAssigned(item)) {
                return item;
            }
        }
        return undefined;
    }
    /**
     * Dynamically set favicon
     * @param iconPath
     */
    setFavIcon(iconPath?: string): void {
        if (!iconPath) iconPath = this.config.favIconName;
        const link = (document.querySelector("link[rel*='icon']") || document.createElement('link')) as HTMLLinkElement;
        link.type = 'image/' + (iconPath.split('.').pop() === "ico" ? "x-icon" : "png");
        link.rel = 'shortcut icon';
        link.href = iconPath;
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    /**
     * Check if request is restfull service request
     * @param config Rewurst config
     * @returns {boolean} 
     */
    isApiRequest(config: ng.IRequestConfig): boolean {
        if (config.method === "GET" || config.method === "POST") {
            return _s.startsWith(config.url, this.config.defaultApiPrefix);
        }
        return false;
    }
    /**
     * Get FontAwesome icon name on file extension
     * @param fileExtension File extension
     */
    getFaIcon(fileExtension: string): string {
        fileExtension = fileExtension.toLowerCase();
        switch (fileExtension) {
            case "pdf":
                return "file-pdf-o";
            case "xls":
            case "xlsx":
                return "file-excel-o";
            case "doc":
            case "docx":
                return "file-word-o";
            case "jpeg":
            case "jpg":
            case "png":
                return "file-image-o";
            case "rar":
            case "zip":
                return "file-zip-o";
            case "txt":
                return "file-text-o";
            case "mp3":
            case "wav":
                return "file-audio-o";
            default:
                return "file-o";
        }
    }
    /**
     * Safe apply 
     * @param $scope Scope
     * @param fn Optional method
     */
    safeApply($scope: ng.IScope, fn: string): void {
        var phase = $scope.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn) {
                $scope.$eval(fn);
            }
        } else {
            if (fn) {
                $scope.$apply(fn);
            } else {
                $scope.$apply();
            }
        }
    }
    /**
    * Put prefix to all values in curly brackets defined in value
    * @param value String Value 
    * @param prefix Prefix
    */
    updateExpressions(value: string, prefix: string): string {
        return value.replace(/\{{(.*?]*)\}}/g, (match, value): string => {
            return `{{${prefix}.${value}}}`;
        });
    }
    /**
     * Filter array using "or" operator
     * @param list List to be filtered
     * @param fields Fields seperated with comma
     * @param keyword Search Keyword
     */
    filterArray<T>(list: T[], fields: string, keyword: string): T[] {
        const result: T[] = [];
        fields.split(',').forEach((filterName): void => {
            const filter = {};
            filter[filterName] = keyword;
            const filteredList = this.$filter('filter')<T>(list, filter);
            filteredList.forEach((item): void => {
                if (result.indexOf(item) === -1) {
                    result.unshift(item);
                }
            });
        });
        return result;
    }
    /**
     * Check that value is assigned and not empty object
     * @param value Value to be evuluated
     */
    isNotEmptyObject(value: any): boolean {
        return this.isAssigned(value) && !_.isEmpty(value);
    }
    /**
     * Set model's property to some value incursivly
     * @param model Model
     * @param fieldName Field name
     * @param defaultValue Value
     */
    setModelValue(model: IBaseModel, fieldName: string, defaultValue: string | number): void {
        if (!this.isAssigned(model)) return;
        for (let field in model) {
            if (model.hasOwnProperty(field)) {
                if (this.isArray(model[field])) {
                    model[field].forEach((item): void => {
                        this.setModelValue(item, fieldName, defaultValue);
                    });
                } else {
                    if (field === fieldName) {
                        model[field] = defaultValue;
                    }
                }
            }
        }
    }
    /**
     * Gets unique number
     */
    private _uniqueNumber: number = 100;
    getUniqueNumber(): number {
        return this._uniqueNumber = this._uniqueNumber + 1;
    }
    /**
     * Extend TSource
     * @param source Source of TSource
     * @param destinations Destinations of any
     */
    extend<TSource>(source: TSource, ...extensions: any[]): TSource {
        return <TSource>angular.extend(source || {}, ...extensions);
    }
    /**
     * Merge source with all destinations
     * @param source Source of TSource
     * @param destinations Destinations of any
     */
    merge<TSource>(source: TSource, extension: any): TSource {
        return source = this.extend(source, extension);
    }
    /**
     * Return true if value nor null and undefined
     * @param value Any object
     */
    isAssigned(value: any): boolean {
        return [undefined, null].indexOf(value) === -1
    }
    /**
     * Guard method checks for array objects
     * @param value Any object
     */
    isArray(value: any): value is Array<any> {
        return value instanceof Array;
    }
    /**
   * Guard method checks for object
   * @param value
   */
    isObject(value: any): value is object {
        return angular.isObject(value);
    }
    /**
     * Guard method checks for function
     * @param value
     */
    isFunction(value: any): value is Function {
        return angular.isFunction(value);
    }
    /**
     * Guard method checks for number
     * @param value
     */
    isNumber(value: any): value is Number {
        return angular.isNumber(value);
    }
    /**
     * Guard method checks for defined
     * @param value
     */
    isDefined(value: any): value is any {
        return angular.isDefined(value);
    }
    /**
     * Convert html to plain text
     * @param html Html  
     */
    htmlToPlaintext(html: string): string {
        if (!html) return '';
        return html.replace(/<[^>]+>/gm, '');
    }
    /**
     * PreventDefault utility method
     * @param $event Angular event
     */
    preventClick(event: ng.IAngularEvent | Event | JQueryEventObject): boolean {
        if (!event) return false;
        (event as Event).preventDefault && (event as Event).preventDefault();
        (event as Event).stopPropagation && (event as Event).stopPropagation();
        return false;
    }
    /**
    * Convert object to generic array
    * @param obj Object to convert
    */
    convertObjToArray<T>(obj: any): Array<T> {
        const result = new Array<T>();
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                result.push(obj[prop]);
            }
        }
        return result;
    }
    /**
     * Convert Enum obj to Array for binding
     * @param value Enum object
     */
    convertEnumToArray(value: any): any[] {
        const result = [];
        for (let item in value) {
            if (value.hasOwnProperty(item) && /^\d+$/.test(item)) {
                const key = parseInt(item);
                const text = value[item];
                result.push({ key: key, text: text });
            }
        }
        return result;
    }
    /**
     * Generate unique number
     */
    getRandomNumber(): string {
        return ((Date.now() + Math.random()) * Math.random()).toString().replace(".", "");
    }
    /**
     * Update querystring of uri with provided key value
     * @param uri
     * @param key
     * @param value
     */
    updateQueryStringParameter(uri: string, key: string, value: string): string {
        const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        const separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    }
    /**
     * Flag that device is mobile or tablet
     */
    isMobileOrTablet(): boolean {
        return window.__IS_TOUCHABLE;
    }
    //#endregion

    //#region Model Utils
    /**
     * Get new crud model
     * @param props
     */
    newCrudModel<TModel extends IBaseCrudModel>(...props: any[]): TModel {
        return <TModel>this.extend<IBaseCrudModel>({ id: 0, modelState: ModelStates.Detached }, ...props);
    }
    /**
     * Get new obserable model
     * @param initalValues
     */
    newObserableModel<TModel extends IBaseCrudModel>(initalValues?: any): IObserableModel<TModel> {
        return new ObserableModel<TModel>(initalValues);
    }
    /**
     * Check whether model is valid crudModel
     * @param model
     */
    isCrudModel(model: any): model is IBaseCrudModel {
        return this.isAssigned(model) && this.isAssigned(model.modelState);
    }
    /**
     * Check agaist model is obserable instance
     * @param model
     */
    isObserableModel(model: any): model is IObserableModel<any> {
        return model instanceof ObserableModel;
    }
    //#endregion
}
//#endregion

//#region Injection
Common.$inject = ['$q', '$filter', '$interpolate', 'Config', 'SecurityConfig', 'Tokens'];
//#endregion

//#region Register
const module: ng.IModule = angular.module('rota.services.common', [])
    .service(Common.injectionName, Common);
//#endregion

export { Common }