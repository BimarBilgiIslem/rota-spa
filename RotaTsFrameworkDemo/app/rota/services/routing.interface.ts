﻿//#region Menu & State Base Objects
/**
 * State options used in controllers
 */
interface IStateInfo {
    /**
     * State name
     */
    stateName: string;
    /**
     * Flag that state will be nested state
     */
    isNestedState: boolean;
    /**
     * Flag that state will sticky tab
     */
    isStickyTab?: boolean;
    /**
     * Current state url
     */
    url?: string;
}
/**
 * Menu Item
 */
interface IMenuItem {
    /**
     * Menu title
     */
    title?: string;
    /**
     * Menu title localization title
     */
    titleI18N?: string;
    /**
     * Menu order 
     */
    order?: number,
    /**
     * Menu fontawesome icon
     * @description go to http://fortawesome.github.io/Font-Awesome/icons/ for icons library
     */
    menuIcon?: string;
    /**
     * Url to where menu item clicked to go when isLink set to true
     */
    menuUrl?: string;
    /**
     * Starts a new group
     */
    startGroup?: boolean;
    /**
     * Parent id value for nesting
     */
    parentId?: number,
    /**
     * Flag that state menu will be visible on menu list
     */
    isMenu?: boolean;
    /**
     * Indicates that menu will be in fullscreen container,default false
     */
    isFullScreen?: boolean;
    /**
     * Shortcut defined for this menu item
     */
    shortCut?: string;
    /**
     * Indicates that menu is added as quick menu
     */
    isQuickMenu?: boolean;
}
/**
 * State that links states with menus
 */
interface IRotaState extends ng.ui.IStickyState {
    navMenu?: INavMenuItem;

    /**
     * State controller url
     */
    controllerUrl?: string;
}
/**
 * Base menu viewmodel object 
 */
interface IMenuModel extends IRotaState, IMenuItem, IBaseModel {
    id: number;
}
/**
 * Breadcrumb object
 */
interface IBreadcrumb {
    text: string;
    url: string;
    icon?: string;
}
/**
 * NavBar item - (ui-navbar directive)
 */
interface INavMenuItem {
    name: string;
    url?: string;
    link?: string;
    params?: IDictionary<any>;
    visible?: boolean;
    icon?: string;
    parent?: INavMenuItem;
    subtree?: INavMenuItem[];
    isFullScreen?: boolean;
    isNested?: boolean;
}

//#endregion

//#region Routing config
/**
 * Route config
 */
interface IRouteConfig extends IBaseConfig {
    /**
     * Base shell path
     */
    shellPath?: string;
    /**
     * Error 404 not found state url
     */
    error404StateUrl?: string;
    /**
     * Error 500 internal error state url
     */
    error500StateUrl?: string;
    /**
     * if there is no such state demanded,it will be transitioned to inactiveStateUrl
     */
    inactiveStateUrl?: string;
    /**
    * Content controller alias name 
    */
    contentControllerAlias?: string;
    /**
     * Modal controller alias name 
     */
    shellControllerAlias?: string;
}
/**
 * Routing config provider
 */
interface IRouteConfigProvider extends IBaseConfigProvider<IRouteConfig> {
}
//#endregion

//#region Routing service
/**
 * Routing service
 */
interface IRouting extends IBaseService {
    /**
     * Active state params
     */
    $stateParams: ng.ui.IStateParamsService;
    /**
     * Active state url
     */
    currentUrl: string;
    /**
     * All registered states
     */
    states: IMenuModel[];
    /**
     * All menus registered
     */
    menus: INavMenuItem[];
    /**
     * Breadcrumbs
     */
    breadcrumbs: IBreadcrumb[];
    /**
     * Current selected menu
     */
    activeMenu: INavMenuItem;
    /**
     * Current state
     */
    current: IRotaState;
    /**
     * Add menus
     * @param states Menu states
     * @returns {IRouting} Routing service
     */
    addMenus(states: IMenuModel[]): IRouting;
    /**
     * Go to state
     * @param state  State to go
     * @param params State parameters
     * @param options Optional settings of state
     * @returns {ng.IPromise<any>} Promise of any
     */
    go(state: string, params?: any, options?: ng.ui.IStateOptions): ng.IPromise<any>;
    /**
     * Reload content page
     * @returns {ng.IPromise<any>} Promise
     */
    reload(): ng.IPromise<any>;
    /**
     * Initial state when application bootstraped
     * @param stateName State name
     * @param params State parameters     
     */
    start(stateName: string, params?: any): void;
    /**
    * Get href uri from state
    * @param stateName State Name
    * @param params Optional params
    */
    getUrlByState(stateName: string, params?: any): string;
    /**
   * Get state by name
   * @param stateName
   */
    getState(stateName: string): IRotaState;
    /**
    * Check state is active
    * @param stateName State name
    * @param params Optional Params
    * @param includes Flag that state is relatively or absolutely active
    */
    isActive(stateName: string, params?: any, includes?: boolean): boolean;
    /**
    * Check state is in active pipeline
    * @param stateName State name
    * @param params Optional Params
    */
    isInclude(stateName: string, params?: any): boolean;
    /**
     * Convert relative url ro absolute url
     * @param relativeUrl Relative url
     */
    toUrl(relativeUrl: string): string;
    /**
    * Get active menu eliminating nested states
    * @param state Optional state
    */
    getActiveMenu(state?: IRotaState): INavMenuItem;
}

//#endregion
