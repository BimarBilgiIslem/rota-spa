﻿//#region Main Base Interfaces
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
}
/**
 * Request Options for GET ,POST verbs
 */
interface IRequestOptions {
    /**
     * Restful service endpoint uri
     */
    url?: string;
    /**
     * Map of strings or objects which will be serialized with the paramSerializer and appended as GET parameters.
     */
    params?: any;
    /**
    * Payload object
     * @description  Data to be sent as the request message data.
    */
    data?: any;
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
}
//#endregion

//#region Base Models
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
     * Model id
     */
    id: number;
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
//TODO:Obserable contructor interface eklenmeli
/**
 * Obserable model
 * @description Converts literal obj to dynamic model entity
 */
interface IObserableModel<TModel extends IBaseCrudModel> extends IBaseCrudModel {
    /**
     * Extend model 
     * @param source Source model 
     */
    extendModel?: (source: TModel) => void;
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
     * Register callback event for data change
     * @param callback Callback method
     */
    subscribeCollectionChanged?: (callback: IModelCollectionChangedEvent) => void;
    /**
     * Restore all added models to orginal values
     */
    revertOriginal?: () => void;
    /**
    * Find model in collection by id
    * @param id Model id
    * @returns {TModel} 
    */
    findById?: (id: number) => TModel & IObserableModel<TModel>;
    /** 
    * Find model in collection by gui
    * @param gui Model Gui
    * @returns {TModel} 
    */
    findByGui?: (gui: string) => TModel & IObserableModel<TModel>;
    /**
    * Filter the list in the list pass the iterator truth test.
    * @param callback Iterator function
    * @returns {IBaseListModel<TModel>}
    */
    where?: (fn: _.ListIterator<TModel, boolean>) => IBaseListModel<TModel>;
    /**
    * Returns the first element of the list pass the iterator truth test.
    * @param callback Iterator function
    * @returns {TModel}
    */
    firstOrDefault?: (fn?: _.ListIterator<TModel, boolean>) => TModel & IObserableModel<TModel>;
    /**
     *  Returns true if any of the values in the list pass the iterator truth test.
     * @param fn Iteratır function
     * @returns {boolean} 
     */
    any?: (fn: _.ListIterator<TModel, boolean>) => boolean;
    /**
    * Get count in the list pass the iterator truth test.
    * @param callback Iterator fuction
    * @returns {number} 
    */
    count?: (fn: _.ListIterator<TModel, boolean>) => number;
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
    * Delete model by id
     * @description Deletes item from list
    * @param id Model id
    * @returns {IBaseListModel<TModel>}
    */
    deleteById?: (id: number) => IBaseListModel<TModel>;
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
    /**
     * Sum values returned from iteration function
     * @param fn Iteration function
     * @returns {number} 
     */
    sum?: (fn: _.ListIterator<TModel, number>) => number;
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
interface IPagingListModel<TModel extends IBaseCrudModel> {
    /**
     * Grid current page data
     */
    data: IBaseListModel<TModel>;
    /**
     * Total record count
     */
    total?: number;
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
* BasePage options
*/
interface IBasePageOptions {
    /**
    * Form name,default rtForm defined in rtForm directive
    */
    formName?: string;
    /**
    * Scroll the top of the page when controller initiated
    */
    scrollToTop?: boolean;
}
/**
* BaseModelPage options
*/
interface IModelPageOptions extends IBasePageOptions {
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
     * New item field name ,default 'new'
     */
    newItemFieldValue?: string;
    /**
     * New item field value ,default 'id'
     */
    newItemFieldName?: string;
    /**
     * Create a unique number for id field when inserting
     */
    generateNewItemValue?: boolean;
    /**
     * Detail page state name of listing page
     */
    editState: string;
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
     * Store filter values while quiting state
     */
    storeFilterValues?: boolean;
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
}
/**
 * Crud page options given through constructor
 */
interface ICrudPageOptions extends IModelPageOptions {
    /**
     * New item field name ,default 'new'
     */
    newItemParamValue?: string;
    /**
     * New item field value ,default 'id'
     */
    newItemParamName?: string;
    /**
     * Create a unique number for id field when inserting
     */
    generateNewItemValue?: boolean;
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
interface IBaseListModelFilter extends IBaseModelFilter {
}
/**
 * Grid options include button options
 */
interface IGridOptions<TModel extends IBaseCrudModel> extends uiGrid.IGridOptionsOf<TModel> {
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
     * Custom row template attibutes
     */
    rowTemplateAttrs?: string[];
}
/**
 * List page localization  
 */
interface IListPageLocalization {
    kayitbulunamadi: string;
    deleteconfirm: string;
    deleteconfirmtitle: string;
    deleteselected: string;
    kayitsayisi: string;
}
//#endregion

//#region BaseCrudController
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
     * Readonly flag
     */
    readonly?: boolean;
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
 * Navigation direction for navigation buttons on crudButtons
 */
const enum NavigationDirection {
    Prev,
    Next
}
/**
 * Localized values for crud page
 */
interface ICrudPageLocalization {
    crudonay: string;
    modelbulunamadi: string;
    kayitkopyalandi: string;
    succesfullyprocessed: string;
    validationhatasi: string;
    bilinmeyenhata: string;
    silmeonay: string;
    silmeonaybaslik: string;
    kayitbasarisiz: string;
    okumamoduuyari: string;
    onayEvet: string;
    onayHayir: string;
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
     * User Model
     */
    jsonModel?: IBaseCrudModel;

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
    saveParsers: Array<IChainableMethod<any>>;
    /**
     * Parses used for deleting process
     */
    deleteParsers: Array<IChainableMethod<any>>;
}
/**
 * Crud types,Flagable
 */
const enum CrudType {
    Create = 1,
    Update = 2,
    Delete = 4
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
 * Bundle for all pages including all built-it and custom dependencies
 */
interface IBundle {
    /**
     * System angular services and thirdparty services 
     */
    systemBundles: { [s: string]: any };
    /**
     * User defined services
     */
    customBundles: { [s: string]: any };
}
/**
 * Parsers exception include notifictaion type and title
 */
interface IParserException extends IServerFailedResponseData {
    /**
     * Log title
     */
    title?: string;
    /**
     * Log type
     */
    logType?: LogType;
}
//#endregion