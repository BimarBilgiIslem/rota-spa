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

//#region Main Base Interfaces
interface IBaseService {
    serviceName: string;
}
/**
 * Base config for configuration objects
 */
interface IBaseConfig {
}
/**
 * Base config provider for all config providers
 */
interface IBaseConfigProvider<TConfig extends IBaseConfig> {
    config: TConfig;
    configure(config: TConfig): void;
}
/**
 * Dummy Base controller inhereted by all controller types
 */
interface IBaseController {
    /**
     * Called while menu is being changed
     * @param event Event
     * @param toState State to transition
     * @param toParams State params
     * @param fromState Stata from which transition
     */
    onExit?: (event: ng.IAngularEvent, toState: IRotaState, toParams: ng.ui.IStateParamsService, fromState: IRotaState) => void;
}
/**
 * Model controller interface
 */
interface IBaseModelController<TModel extends IBaseModel> extends IBaseController {
    modelPromise: ng.IPromise<TModel | TModel[] | IPagingListModel<TModel>>;
}

type GetModelFn<T extends IBaseModel> = (modelFilter?: IBaseModelFilter) => ng.IPromise<ModelVariants<T>> | ModelVariants<T>;
/**
 * Request Options for GET ,POST verbs
 */
interface IRequestOptions extends ng.IRequestShortcutConfig {
    /**
     * Restful service endpoint uri
     */
    url?: string;
    /**
     * Map of strings or objects which will be serialized with the paramSerializer and appended as GET parameters.
     */
    params?: object;
    /**
    * Payload object
     * @description  Data to be sent as the request message data.
    */
    data?: object;
    /**
     * Server controller name
     */
    controller?: string;
    /**
     * Server action name
     */
    action?: string;
    /**
     * Flag that caching will be implemented on client side
     */
    cache?: boolean;
    /**
     * Cache type
     */
    cacheType?: CacherType;
    /**
     * Optional cache key
     * @default if cachekey omitted,url+params will be used as default
     */
    cacheKey?: string;
    /**
    * Show spinner
    */
    showSpinner?: boolean;
    /**
     * Bypass error interceptor,default false
     */
    byPassErrorInterceptor?: boolean;
}
/**
 * Base api for all services requests restful server side
 */
interface IBaseApi {
    /**
    * Upload a file to remote server
    * @param file Selected file info
    * @param params Optional params to send to server
    */
    fileUpload(file: IFileInfo, params?: any): ng.IPromise<IFileUploadResponseData>;
}
/**
 * Api options used by decorators
 */
interface IApiOptions extends IBaseOptions {
    /**
     * Server controller api name
     * @description  Set "user" if your server api name is UserController for webapi backend
     */
    serverApi?: string;
    /**
     * Cross origin host name api will work with,which defined in global environment as "hosts" 
     */
    moduleId?: string;
}
/**
 * Api that includes custom methods for crud operations
 * @description Please refer to implemention file for restful service endpoint info
 */
interface IBaseCrudApi<TModel extends IBaseCrudModel> extends IBaseApi {
    /**
     * Make a get request to fetch all models filtered
     * @param filter Optional filter
     * @param controller Optional filter
     * @returns {ng.IPromise<TModel[]>}
     */
    getList(filter?: IBaseModelFilter, controller?: string): ng.IPromise<TModel[]>;
    /**
     * Make a get request to fetch all models filtered and paged
    * @param filter Optional filter
     * @param controller Optional filter
     * @returns {ng.IPromise<IPagingListModel<TModel>>}
     */
    getPagedList(filter?: IBaseModelFilter, controller?: string): ng.IPromise<IPagingListModel<TModel>>;
    /**
     * Make a get request to get model by id
     * @param id Unique id
     * @param controller Optional controller
     * @returns {ng.IPromise<TModel>}
     */
    getById(id: number, controller?: string): ng.IPromise<TModel>;
    /**
     * Make a post request to save model
     * @param model Model
     * @param controller Optional controller
     * @returns {ng.IPromise<ICrudServerResponseData>}
     */
    save(model: TModel, controller?: string): ng.IPromise<ICrudServerResponseData>;
    /**
     * Make a post request to delete model
     * @param id Unique id
     * @param controller Optional controller
     * @returns {ng.IPromise<any>}
     */
    delete(id: number, controller?: string): ng.IPromise<any>;
    /**
     * Export model
     * @param filter Filter
     * @param controller Server controller name
     * @returns {void} 
     */
    exportList(filter?: IBaseListModelFilter, controller?: string): void;
}
//#endregion

//#region Base Models
/**
 * Model variants
 */
type ModelVariants<TModel extends IBaseModel> = TModel | TModel[] | IPagingListModel<TModel>;
/**
 * Base model for all filtering classes
 */
interface IBaseModelFilter {
}
/**
 * Base report filter
 */
interface IBaseReportFilter extends IBaseModelFilter {
}
/**
 * Base model 
 */
interface IBaseModel {
    /**
     * Model unique id
     */
    id?: number;
}
/**
 * Model states equivalent to Entity framework entity state
 */
const enum ModelStates {
    Detached = 1,
    Unchanged = 2,
    Added = 4,
    Deleted = 8,
    Modified = 16
}
/**
 * Base crud model
 */
interface IBaseCrudModel extends IBaseModel {
    /**
     * Model state
     * @description Should be used along with entityframework entity state
     */
    modelState: ModelStates;
    /**
     * Active flag
     */
    isActive?: boolean;
}
/**
 * Obserable model
 * @description Converts literal obj to dynamic model entity
 */
interface IObserableModel<TModel extends IBaseCrudModel> extends IBaseCrudModel {
    /**
      * Restore model to orginal values
      */
    revertOriginal?: () => void;
    /**
     * Remove model
     */
    remove?: () => void;
    /**
     * Clone model with orginal values
     */
    cloneModel?: () => TModel;
    /**
     * Copy values to orjinalvalues
     */
    acceptChanges?: () => void;
    /**
     * Converts obserabşe model to literal object
     * @param onlyChanges Flag that gets only model changes rather than whole model
     */
    toJson?: (onlyChanges?: boolean) => TModel;
    /**
     * Initial literal object to populate properties
     */
    _orginalValues?: IDictionary<any>;
    /**
     * Current Values
     */
    _values?: IDictionary<any>;
    /**
     * Readonly 
     */
    _readonly?: boolean;
    /**
     * Register data changes event
     * @param callback Callback
     */
    subscribeDataChanged?: (callback: IModelDataChangedEvent) => void;
    /**
     * Globally model identifier 
     */
    _gui?: string;
    /**
     * Is Model dirty 
     */
    _isDirty?: boolean;
}
/**
 * Includes crudmodel & obserable models and extends array with model functions
 */
interface IBaseListModel<TModel extends IBaseCrudModel> extends Array<TModel & IObserableModel<TModel>> {
    /**
    * Readonly 
    */
    _readonly?: boolean;
    /**
     * Parent Model of array
     */
    parentModel?: IObserableModel<IBaseCrudModel>;
    /**
     * Register callback event for data change
     * @param callback Callback method
     */
    subscribeCollectionChanged?: (callback: IModelCollectionChangedEvent) => void;
    /**
     * Restore all added models to orginal values
     */
    revertOriginal?: () => void;
    /** 
    * Find model in collection by gui
    * @param gui Model Gui
    * @returns {TModel} 
    */
    findByGui?: (gui: string) => TModel & IObserableModel<TModel>;
    /**
     * Remove model or mark model deleted
     * @description This is extension method defined in model.extensions
     * @param item Model item
     * @returns {IBaseListModel<TModel>}
     */
    remove?: (item: TModel) => IBaseListModel<TModel>;
    /**
     * Remove model by id
     * @description Sets its model state to Deleted
     * @param id Model id
     * @returns {IBaseListModel<TModel>}
     */
    removeById?: (id: number) => IBaseListModel<TModel>;
    /**
     * Remove all items
     * @returns {IBaseListModel<TModel>}
     */
    removeAll?: () => IBaseListModel<TModel>;
    /**
     * Add item to list
     * @param item TModel
     */
    add?: (item: TModel | IObserableModel<TModel>) => IBaseListModel<TModel>;
    /**
     * Adds new model and returns
     * @param values 
     * @returns {} 
     */
    new?: (values?: IBaseCrudModel) => TModel;
}

/**
 * Model chnaged event signature
 */
interface IModelDataChangedEvent {
    (action?: ModelStates, value?: any, oldValue?: any, key?: string): void;
}

interface IModelCollectionChangedEvent {
    (action?: ModelStates, value?: IBaseCrudModel): void;
}
/**
 * Base paing model for all listing pages
 */
interface IPagingListModel<TModel extends IBaseModel> {
    /**
     * Grid current page data
     */
    data: TModel[];
    /**
     * Total record count
     */
    total?: number;
}
/**
 * Model export options (etc : excel..)
 */
interface IExportOptions {
    fields: Array<string>;
    headers: Array<string>;
    exportType?: ModelExports;
    fileName?: string;
}
/**
 * Used for exporting grid on server including columns meta
 */
interface IExportFilter<TFilter extends IBaseListModelFilter> {
    options: IExportOptions,
    filter?: TFilter;
}
/**
 * Model exports
 */
const enum ModelExports {
    Excel = 1,
    Pdf = 2,
    Csv = 4
}
/**
 * Obj Enum bind type 
 */
interface IEnum {
    enumType: { [i: number]: string }
}
//#endregion

//#region Page Options
/**
 * Base options for all objects
 */
interface IBaseOptions {
    /**
     * Injection name is angular registration name 
     */
    registerName?: string;
}
/**
* BasePage options
*/
interface IBasePageOptions extends IBaseOptions {
    /**
    * Form name,default rtForm defined in rtForm directive
    */
    formName?: string;
    /**
    * Scroll the top of the page when controller initiated
    */
    scrollToTop?: boolean;
    /**
     * Redefine registerName as null|undefined
     */
    registerName: string;
}
/**
* BaseModelPage options
*/
interface IModelPageOptions extends IBasePageOptions {
    /**
    * New item field name ,default 'new'
    */
    newItemParamValue?: string;
    /**
     * New item field value ,default 'id'
     */
    newItemParamName?: string;
    /**
    * Initialize model runing the initModel method of formController     
    */
    initializeModel?: boolean;
}
/**
 * List page options
 */
interface IListPageOptions extends IModelPageOptions {
    /**
     * Detail page state name of listing page
     */
    editState?: string;
    /**
     * Grid paging is enabled or not
     */
    pagingEnabled?: boolean;
    /**
     * PageSize ,default config.defaultPageSize = 25
     */
    pageSize?: number;
    /**
     * Flag that if default messages will be shown
     */
    showMesssage?: boolean;
    /**
     * List Buttons visibilities
     */
    listButtonVisibility?: IListButtonsVisibility;
    /**
     * Store filter values while quiting state,default false
     */
    storeFilterValues?: boolean;
    /**
     * Storage type of filter,default sessionStorage
     */
    storefilterLocation?: CacherType;
    /**
     * Element to scroll to after searching completed
     */
    elementToScroll?: string;
    /**
     * Available export types,default pdf
     */
    modelExports?: ModelExports;
    /**
     * Refresh list interval,default null
     */
    refreshInterval?: 1 | 3 | 5 | 10;
    /**
     * Enable refresh list,default false
     */
    enableRefresh?: boolean;
    /**
     * Stick to the bottom of the navbar while scrolling to down,default true
     */
    enableStickyListButtons?: boolean;
}
/**
 * Widget Controller options
 */
interface IWidgetPageOptions extends IModelPageOptions {

}
/**
 * Directive options
 */
interface IDirectiveOptions extends IBaseOptions {
    /**
     * Redefine "registerName" as mandatory
     */
    registerName: string;
}
/**
 * List Buttons Visibilities
 */
interface IListButtonsVisibility {
    newButton?: boolean;
    searchButton?: boolean;
    clearButton?: boolean;
    exportButton?: boolean;
    deleteSelected?: boolean;
    storeFilter?: boolean;
    storeGridLayout?: boolean;
}
/**
 * Crud page options given through constructor
 */
interface ICrudPageOptions extends IModelPageOptions {
    /**
     * Flag that checks form dirty state and save model when exiting the form,default true
     */
    checkDirtyOnExit?: boolean;
    /**
     * Insert,Update,Delete process pipelines
     */
    parsers?: ICrudParsers;
    /**
     * Crud buttons visibility
     */
    crudButtonsVisibility?: ICrudButtonsVisibility;
    /**
     * Post only model changes when saving 
     * @description modifiedProperties added to model as well while this flag is true
     */
    postOnlyModelChanges?: boolean;
    /**
     * Change id param mainly "new to <number>" ,default true
     */
    changeIdParamOnSave?: boolean;
    /**
     * autoSave flag that enables saving within 30sec to localStorage for recovery cases,default false
     */
    autoSave?: boolean;
    /**
     * Readonly flag that model can not be changed
     */
    readOnly?: boolean;
    /**
    * Stick to the bottom of the navbar while scrolling to down,default true
    */
    enableStickyCrudButtons?: boolean;
}
/**
 * Crud Buttons Visibilies
 */
interface ICrudButtonsVisibility {
    newButton?: boolean;
    deleteButton?: boolean;
    revertBackButton?: boolean;
    copyButton?: boolean;
    saveButton?: boolean;
    saveContinueButton?: boolean;
}
/**
 * Modal page options
 */
interface IModalPageOptions extends IModelPageOptions {

}
//#endregion

//#region BaseListController 
/**
 * Base filter for all list pages
 */
interface IBaseListModelFilter extends IBaseModelFilter, IPager {
}
/**
 * Pager model
 */
interface IPager {
    /**
     * Current page index
     */
    pageIndex?: number;
    /**
     * Item count listed in a page
     */
    pageSize?: number;
}
/**
 * Grid options include button options
 */
interface IGridOptions<TModel extends IBaseModel> extends uiGrid.IGridOptionsOf<TModel> {
    /**
     * Flag that show edit button on grid 
     */
    showEditButton?: boolean;
    /**
     * Flag that show delete button on grid
     */
    showDeleteButton?: boolean;
    /**
     * Row formatting function,returns class name for row
     * @description Must return class name row to be applied
     * @param row Cuurent row
     * @returns {string} 
     */
    rowFormatter?(row: uiGrid.IGridRowOf<TModel>): string;
    /**
     * Context menu html template id
     */
    showContextMenu?: boolean;
    /**
     * Enables row click to go to detail state
     */
    enableRowClickToEdit?: boolean;
    /**
     * Enables row double click to go to detail state
     */
    enableRowDoubleClickToEdit?: boolean;
    /**
     * Custom row template attibutes
     */
    rowTemplateAttrs?: string[];
    /**
     * Hidden action buttons on mobile device,default false
     */
    hiddenActionButtonsOnMobile?: boolean;
}
/**
 * Shortcut flag for column visibility on mobile device
 */
declare namespace uiGrid {
    interface IColumnDefOf<TEntity> {
        hiddenOnMobile?: boolean;
    }
}
/**
 * Base list controller
 */
interface IBaseListController<TModel extends IBaseModel, TModelFilter extends IBaseListModelFilter> extends IBaseModelController<TModel> {
    options: IListPageOptions;
    initSearchModel(pager?: IPager, scrollToElem?: ng.IAugmentedJQuery): ng.IPromise<TModel[] | IPagingListModel<TModel>>;
}
//#endregion

//#region BaseCrudController
/**
 * Base list controller
 */
interface IBaseCrudController<TModel extends IBaseCrudModel> extends IBaseModelController<TModel> {
    options: ICrudPageOptions;
}
/**
 * base model filtering object for crud pages
 */
interface IBaseFormModelFilter extends IBaseModelFilter {
    /**
     * Model id
     */
    id: number;
}
/**
 * General State params for crud pages
 */
interface ICrudPageStateParams<TModel extends IBaseCrudModel> extends ng.ui.IStateParamsService {
    id: number | string;
    /**
     * Model
     */
    model: TModel;
    /**
     * Readonly flag,default false
     */
    readonly?: boolean;
    /**
     * Preview mode flag,default false
     */
    preview?: boolean;
}
/**
 * Flags for Crud pages
 */
interface ICrudPageFlags {
    /**
   * Show that model is in new mode
   */
    isNew?: boolean;
    /**
     * Saving flag
     */
    isSaving?: boolean,
    /**
     * Deleting flag
     */
    isDeleting?: boolean,
    /**
     * Copying flag
     */
    isCloning?: boolean;
}
/**
 * Save options
 */
interface ISaveOptions {
    /**
     * Show the model is in new mode
     */
    isNew?: boolean;
    /**
     * Flag that continues to new model after saving
     */
    goon?: boolean;
    /**
     * Show message after saving
     */
    showMessage?: boolean;
    /**
     * Save success message
     */
    message?: string;
    /**
     * Literal object model
     */
    jsonModel?: IBaseCrudModel;
    /**
     * Must be true if custom transition occured on afterSaveModel method
     */
    redirectHandled?: boolean;
}
/**
 * Delete Options
 */
interface IDeleteOptions {
    /**
     * Show message after saving
     */
    showMessage?: boolean;
    /**
    * User Model
    */
    model?: IBaseCrudModel;
    /**
     * Model id
     */
    key: number;
    /**
     * Show confirm dialog
     */
    confirm?: boolean;
    /**
    * User Model
    */
    jsonModel?: IBaseCrudModel;
}
/**
 * Crud Parsers
 */
interface ICrudParsers {
    /**
     * Parses used for saving process
     */
    saveParsers: Array<IChainableMethod<IParserException>>;
    /**
     * Parses used for deleting process
     */
    deleteParsers: Array<IChainableMethod<IParserException>>;
}
//#endregion

//#region BaseModalController
interface IBaseModalController {
    $uibModalInstance: ng.ui.bootstrap.IModalServiceInstance;
    /**
     * Instance Options
     */
    instanceOptions: IModalInstanceOptions;
    /**
     * Close modal with result
     * @param data Result
     */
    modalResult(data: any): void;
    /**
    * Close modal with dismiss
    */
    closeModal(): void;
}

//#endregion

//#region Common
/**
 * Generic controller scope used by directives
 */
interface IControllerScope<TController extends IBaseController> {
    vm: TController
}
/**
 * Bundle for all pages including all built-it and custom dependencies
 */
interface IBundle {
    /**
     * System angular services and thirdparty services 
     */
    services: IDictionary<any>;
    /**
     * Options of injectable object
     */
    options?: IBaseOptions;
}
/**
 * Parsers exception include notifictaion type and title
 */
interface IParserException extends IValidationResult {
    /**
     * Log title
     */
    title?: string;
    /**
     * Log type
     * @description Log type must be 
     */
    logType: LogType.Error | LogType.Warn;
}
//#endregion