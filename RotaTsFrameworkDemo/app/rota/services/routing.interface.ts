//#region Menu & State Base Objects
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
    /**
     * Hierarchical menu for navigation
     */
    hierarchicalMenu?: IHierarchicalMenu;
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
 * Hierarchical menu items for navigation stuff
 */
interface IHierarchicalMenu extends IMenuModel {
    parentMenu?: IHierarchicalMenu;
    subMenus?: IHierarchicalMenu[];
    //helper props
    localizedTitle?: string;
    absoluteUrl?: string;
}
/**
 * Used for navigational things
 */
interface IBaseNavigationModel {
    text: string;
    url?: string;
    icon?: string;
}
/**
 * Breadcrumb object
 */
interface IBreadcrumb extends IBaseNavigationModel {

}
/**
 * Mbf struct
 */
interface IQuickMenu extends IBaseNavigationModel {
    state?: string;
}
/**
 * NavBar item 
 */
interface INavMenuItem extends IBaseNavigationModel {
    parent?: INavMenuItem;
    subtree?: INavMenuItem[];
}

//#endregion

//#region Routing config
interface ITemplates {
    error404?: string;
    error500?: string;
    shell?: string;
    header?: string;
    content?: string;
    breadcrumb?: string;
    badges?: string;
    actions?: string;
    currentcompany?: string;
    title?: string;
    userprofile?: string;
    navmenumobile?: string;
}

/**
 * Route config
 */
interface IRouteConfig extends IBaseConfig {
    /**
     * Html templates
     */
    templates?: ITemplates;
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
    navMenus: INavMenuItem[];
    /**
     * Hierarchical menus & states
     */
    hierarchicalMenus: IHierarchicalMenu[];
    /**
     * Breadcrumbs
     */
    breadcrumbs: IBreadcrumb[];
    /**
     * Current selected menu
     */
    activeMenu: IHierarchicalMenu;
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
     * Add current menu to quick menus
     */
    addCurrentMenuToQuickMenus(): void;
    /**
     * Go to state
     * @param state  State to go
     * @param params State parameters
     * @param options Optional settings of state
     * @returns {ng.IPromise<any>} Promise of any
     */
    go(state: string, params?: any, options?: ng.ui.IStateOptions): ng.IPromise<any>;
    /**
     * Go preview page
     */
    goBack(): void;
    /**
     * Reload content page
     * @returns {ng.IPromise<any>} Promise
     */
    reload(): ng.IPromise<any>;
    /**
     * Full reload
     */
    reloadBrowser(): void;
    /**
     * Change address bar url without reloading
     * @param params
     */
    changeUrl<T>(params: IDictionary<T>): ng.IPromise<any>;
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
    getActiveMenu(state?: IRotaState): IHierarchicalMenu;
    /**
    * Get base host url
    * @returns {string} 
    */
    getHostUrl(): string;
}

//#endregion
