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

//#region Shortcuts
/**
 * Promise shortcut
 */
interface IP<T> extends ng.IPromise<T> {
}
/**
 * Promise shortcut
 */
interface IPany extends ng.IPromise<any> {
}

//#endregion

//#region Common Interfaces
/**
 * Modified root scope 
 */
interface IRotaRootScope extends ng.IRootScopeService {
    appTitle: string;
    forms: any;
    isCollapsed: boolean;
}
/**
 * Used for chainable promise function
 */
interface IChainableMethod<T> {
    (...args: any[]): ng.IPromise<T> | void;
}
/**
 * Result structure returned after caching file in server
 */
interface IFileUploadResponseData extends IBaseServerResponseData {
    /**
     * Cache Key
     */
    newUid?: string;
    /**
     * Old cache key
     */
    oldUid?: string;
}
/**
 * Base server data object
 */
interface IBaseServerResponseData {
}
/**
 * Base server abstract response
 */
interface IBaseServerResponse<TResponseData extends IBaseServerResponseData> extends ng.IHttpPromiseCallbackArg<TResponseData> {
}
/**
 * Common server error response
 * @example {
  "message": "The request entity's media type 'text/plain' is not supported for this resource.",
  "exceptionMessage": "No MediaTypeFormatter is available to read an object of type 'RotaLoginCredentials' from content with media type 'text/plain'.",
  "exceptionType": "System.Net.Http.UnsupportedMediaTypeException",
  "stackTrace": "   at System.Net.Http.HttpContentExtensions.ReadAsAsync[T](HttpContent content, Type type,
     IEnumerable`1 formatters, IFormatterLogger formatterLogger, CancellationToken cancellationToken)\r\n
     at System.Web.Http.ModelBinding.FormatterParameterBinding.ReadContentAsync(HttpRequestMessage request, Type type,
     IEnumerable`1 formatters, IFormatterLogger formatterLogger, CancellationToken cancellationToken)"
} */
interface IServerFailedResponseData extends IBaseServerResponseData {
    /**
     * Generic exception message
     */
    message?: string;
    /**
     * Invalid request message detail
     */
    messageDetail?: string;
    /**
     * Exception message when debugging
     */
    exceptionMessage?: string;
    /**
     * Server type of exception
     */
    exceptionType?: string;
    /**
     * Stack trace used for debugging
     */
    stackTrace?: string;
    /**
     * Custom error messages 
     */
    errorMessages?: Array<string>;
}
/**
 * Server crud response
 */
interface ICrudServerResponseData extends IBaseServerResponseData {
    /**
     * Crud Model
     */
    entity?: IBaseCrudModel,
    /**
     * User defined warning messages from server
     */
    warningMessages?: Array<string>;
    /**
     * User defined success messages from server
     */
    successMessages?: Array<string>;
    /**
     * User defined info messages from server
     */
    infoMessages?: Array<string>;
}

interface IKeyValuePair<T> {
    key: string;
    value: T;
}

interface IDictionary<T extends {}> {
    [index: string]: T
}

//#endregion

//#region Common Service
/**
 * Common service 
 */
interface ICommon extends IBaseService {
    /**
     * Dynamically set favicon
     * @param iconPath if falsy is passed,config.favIconName will be assigned
     */
    setFavIcon(iconPath?: string): void;
    /**
     * Check if request is restfull service request
     * @param config Rewurst config
     * @returns {boolean} 
     */
    isApiRequest(config: ng.IRequestConfig): boolean;
    /**
     * Get FontAwesome icon name on file extension
     * @param fileExtension File extension
     */
    getFaIcon(fileExtension: string): string;
    /**
    * Safe apply 
    * @param $scope Scope
    * @param fn Optional method
    */
    safeApply($scope: ng.IScope, fn: string): void;
    /**
   * Put prefix to all values in curly brackets defined in value
   * @param value String Value 
   * @param prefix Prefix
   */
    updateExpressions(value: string, prefix: string): string;
    /**
     * Filter array using "or" operator
     * @param list List to be filtered
     * @param fields Fields seperated with comma
     * @param keyword Search Keyword
     */
    filterArray<T>(list: T[], fields: string, keyword: string): T[];
    /**
     * Check that value is assigned and not empty object
     * @param value Value to be evuluated
     */
    isNotEmptyObject(value: any): boolean;
    /**
     * Set model's property to some value incursivly
     * @param model Model
     * @param fieldName Field name
     * @param defaultValue Value
     */
    setModelValue(model: IBaseModel, fieldName: string, defaultValue: string | number): void;
    /**
     * Gets unique number
     * @returns {number} 
     */
    getUniqueNumber(): number;
    /**
    * Return promise with provided arg
    * @param p Arg
    */
    promise<T>(p?: T): ng.IPromise<T>;
    /**
    * Return rejected promise with reason
    * @param reason Arg
    */
    rejectedPromise<T>(reason?: T): ng.IPromise<T>;
    /**
    * Return promise with provided arg if its not thenable
    * @param value Arg
    */
    makePromise<T>(value: any): ng.IPromise<T>;
    /**
    * Check whether or not provided param is promise
    * @param value Arg
    */
    isPromise(value: any): value is ng.IPromise<any>;
    /**
   * Check whether or not provided value ends with html extension
   * @param value Arg
   */
    isHtml(value: string): boolean;
    /**
    * Extract file name from full path
    * @param path File full path
    */
    extractFileName(path: string): string;
    /**
    * Add prefix/suffix slash's
    * @param path Path
    */
    addSlash(path: string): string;
    /**
   * Add trailing slash
   * @param path Path
   */
    addTrailingSlash(path: string): string;
    /**
     * Add prefix slash
     * @param path Path
     */
    addPrefixSlash(path: string): string;
    /**
    * Check whether model is valid crudModel
    * @param model
    */
    isCrudModel(model: any): model is IBaseCrudModel;
    /**
    * Check whether model is valid obserable
    * @param model
    */
    isObserableModel(model: any): model is IObserableModel<any>;
    /**
     * Get a new crud model 
     * @param props
     */
    newCrudModel<TModel extends IBaseCrudModel>(...props: any[]): TModel;
    /**
     * Get new obserable model
     * @param initalValues
     */
    newObserableModel<TModel extends IBaseCrudModel>(initalValues?: any): IObserableModel<TModel>;
    /**
     * Extend T
     * @param source Source of T
     * @param extensions Destinations of T
     */
    extend<TSource>(source: TSource, ...extensions: Partial<TSource>[]): TSource;
    /**
    * Merge source with all destinations
    * @param source Source of TSource
    * @param destinations Destinations of any
    */
    merge<TSource>(source: TSource, ...destinations: any[]): TSource;
    /**
     * Checks string value is not empty or null
     * @param value
     */
    isNullOrEmpty(value: string): boolean;
    /**
     * Return true if value nor null and undefined
     * @param value Any object
     */
    isAssigned(value: any): boolean;
    /**
     * Guard method checks for string
     * @param value Any object
     */
    isString(value: any): value is string;
    /**
     * Guard method checks for number
     * @param value
     */
    isNumber(value: any): value is Number;
    /**
   * Guard method checks for array objects
   * @param value Any object
   */
    isArray(value: any): value is Array<any>;
    /**
    * Guard method checks for function
    * @param value
    */
    isFunction(value: any): value is Function;
    /**
     * Guard method checks for defined
     * @param value
     */
    isDefined(value: any): value is any;
    /**
    * Convert html to plain text
    * @param html Html  
    */
    htmlToPlaintext(html: string): string;
    /**
    * PreventDefault utility method
    * @param $event Angular event
    */
    preventClick(event: ng.IAngularEvent | Event | JQueryEventObject): boolean;
    /**
    * Convert object to generic array
    * @param obj Object to convert
    */
    convertObjToArray<T>(obj: any): Array<T>;
    /**
    * Convert Enum obj to Array for binding
    * @param value Enum object
    */
    convertEnumToArray(value: any): any[];
    /**
     * Generate unique number
     */
    getRandomNumber(): string;
    /**
     * Update querystring of uri with provided key value
     * @param uri
     * @param key
     * @param value
     */
    updateQueryStringParameter(uri: string, key: string, value: string): string;
    /**
    * Flag that device is mobile or tablet
    */
    isMobileOrTablet(): boolean;
}
//#endregion
