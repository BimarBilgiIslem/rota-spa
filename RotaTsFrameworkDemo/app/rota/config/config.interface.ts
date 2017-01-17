//#region Global Environment
/**
 * Environment settings
 */
interface IGlobalEnvironment {
    /**
     * App versison
     */
    appVersion: string,
    /**
     * Debugging flag
     */
    debugging: boolean,
    /**
     * Js caching of requireJs
     */
    cacheBusting: string,
    /**
     * Client Id of OpenId
     */
    clientId: string;
    /**
     * Authority uri for authentication
     */
    authority: string;
    /**
     * Allow anouynmous access
     */
    allowAnonymousAccess: boolean;
    /**
     * Elmah logging enabled client exceptions
     */
    elmahLoggingEnabled: boolean;
    /**
     * Elmah logging backend endpoint
     */
    elmahLoggingUrl?: string;
    /**
     * Report Viwer Url
     */
    reportViewerUrl?: string;
    /**
     * Session endppotiny for Report params session
     */
    reportControllerUrl?: string;
    /**
     * EntiForgerytokenEnabled flag
     */
    antiForgeryTokenEnabled?: boolean;
    /**
     * Cross Domain root Paths,like https://xdomain.com
     */
    xDomPaths?: { [index: string]: string };
}
//#endregion

//#region Main Config
/**
 * Common event names used through the app
 */
interface IEvents {
    /**
     * Broadcast when login/logoff happened
     */
    userLoginChanged: string;
    /**
     * Fired unauthorized action taken or token expires
     */
    loginRequired: string;
    /**
     * Fired when http request begins
     */
    ajaxStarted: string;
    /**
     * Fired when http request ends
     */
    ajaxFinished: string;
    /**
     * Fired when menu changed programtically/manually
     */
    menuChanged: string;
    /**
     * Fired when model loaded in BaseModelController
     */
    modelLoaded: string;
}
/**
 * Date time formats used in rtDatetime directive
 */
interface IDateTimeFormat {
    //All date Formats
    timeFormat: string;
    dateFormat: string;
    monthFormat: string;
    yearFormat: string;
    /**
    * Minute step value default 5
    */
    datePickerTimeMinStep?: number;
}
/**
 * CRUD Api action names
 * @description See defaults in constants
 */
interface ICrudActionNames {
    getList: string;
    getById: string;
    getPagedList: string;
    save: string;
    delete: string;
}
/**
 * DashBoard Setttings
 */
interface IDashboardSettings {
    widgetLoadingTemplate?: string;
}
/**
 * Main config settings
 */
interface IMainConfig extends IBaseConfig {
    /**
     * CRUD Api action names
     */
    crudActionNames?: ICrudActionNames;
    /**
     * Api path used when there is only one api in use
     */
    defaultApiPrefix?: string;
    /**
     * Default form element name
     */
    defaultFormName?: string,
    /**
     * New item id param value default name
     */
    defaultNewItemParamValue?: string,
    /**
     * New item id param default name
     */
    defaultNewItemParamName?: string,
    /**
     * Application version number
     */
    appVersion?: string;
    /**
     * App title
     */
    appTitle?: string;
    /**
     * Indicates that app is running in debug mode
     */
    debugMode?: boolean;
    /**
     * Common event names
     */
    eventNames?: IEvents;
    /**
     * Default grid page size
     */
    gridDefaultPageSize?: number;
    /**
     * Default grid options scope name
     */
    gridDefaultOptionsName?: string;
    /**
     * Grid Full feature list
     */
    gridFullFeatureList?: string;
    /**
     * Grid standart features list
     */
    gridStandartFeatureList?: string;
    /**
     * Supported languages
     * @description if new lang is added,nls folder must be updaded accordingly in resource 
     */
    supportedLanguages?: ILanguage[];
    /**
     * Exception will be logged to Elmah db
     */
    serverExceptionLoggingEnabled?: boolean;
    /**
     * Elmah logging endpoint
     */
    serverExceptionLoggingBackendUrl?: string;
    /**
     * DateTime formats
     */
    datetimeFormat?: IDateTimeFormat;
    /**
     * Only model changes will be posting to server
     */
    postOnlyModelChanges?: boolean;
    /**
    * Report Viwer Url
    */
    reportViewerUrl?: string;
    /**
     * Session endppotiny for Report params session
     */
    reportControllerUrl?: string;
    /**
     * Show company name on stratup next to avatar/user name
     */
    showCompanyName?: boolean;
    /**
     * Home page options
     */
    homePageOptions?: IHomePageOptions;
    /**
     * AutoSave interval in ms,default 
     */
    autoSaveInterval?: number;
    /**
     * Dashboard settings
     */
    dashboardSettings?: IDashboardSettings;
    /**
     * Logo Image file name.It must be under ~/Content/img - default place_holder.png
     */
    logoImageName?: string;
}
/**
 * Main config provider
 */
interface IMainConfigProvider extends IBaseConfigProvider<IMainConfig> {
}
//#endregion

//#region Home Settings
/**
 * HomePage settings
 */
interface IHomePageOptions {
    /**
     * Home page url,eg./dashboard
     */
    url: string;
    /**
     * Homepage Background image uri
     */
    imageUri?: string;
    /**
     * Homepage background video options
     */
    videoOptions?: IVideoOptions;
}
/**
 * Video options
 */
interface IVideoOptions {
    urlMp4?: string;
    urlWebm?: string;
    urlOgg?: string;
    poster: string;
}
//#endregion