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
import "./routing.config";
import "./loader.service";
import * as _ from "underscore";
import * as _s from "underscore.string";
//#endregion

//#region Routing Service
/**
 * This service wrapper of ui-router services and responsible for menus and static states
 */
class Routing implements IRouting {
    //#region Props
    serviceName: string = "Routing Service";
    static injectionName = "Routing";
    /**
     * Quick menus
     */
    quickMenus: IQuickMenu[];
    /**
     * Orj Menus 
     */
    private _states: IMenuModel[];
    get states(): IMenuModel[] { return this._states; }
    /**
     * Hierarchical menus
     */
    private _hierarchicalMenus: IHierarchicalMenu[];
    get hierarchicalMenus(): IHierarchicalMenu[] { return this._hierarchicalMenus; }
    /**
     * Nav Menus menus
     */
    private _navMenus: INavMenuItem[];
    get navMenus(): INavMenuItem[] { return this._navMenus; }
    /**
     * Active Menu
     */
    private _activeMenu: IHierarchicalMenu;
    get activeMenu(): IHierarchicalMenu { return this._activeMenu; }
    /**
     * Breadcrumbs
     */
    private _breadcrumbs: IBreadcrumb[];
    get breadcrumbs(): IBreadcrumb[] { return this._breadcrumbs; }
    /**
     * Get current state
     * @returns IRotaState{}
     */
    get current(): IRotaState { return this.$state.current; }
    /**
     * Get currrent states url
     * @returns {} 
     */
    get currentUrl(): string {
        return this.getUrlByState(this.current.name, this.$stateParams);
    }
    /**
     * Shell content state octate count
     * @description This indicator is used to determine if the state is nested or not
     */
    private shellContentStateOctateLen: number;
    private readonly newItemParamNameRegex: RegExp = new RegExp(`/:${this.constants.controller.DEFAULT_NEW_ITEM_PARAM_NAME}$`);
    //#endregion

    //#region Init
    static $inject = ['$window', '$state', '$stateParams', '$rootScope', '$q', '$urlRouter', '$location',
        '$stickyState', '$urlMatcherFactory', '$timeout', 'StateProvider', 'UrlRouterProvider',
        'RouteConfig', 'Loader', 'Common', 'Config', 'Logger', 'Localization', 'Base64', 'Constants', 'Caching'];
    //ctor
    constructor(
        private $window: ng.IWindowService,
        private $state: ng.ui.IStateService,
        public $stateParams: ng.ui.IStateParamsService,
        private $rootScope: IRotaRootScope,
        private $q: angular.IQService,
        private $urlRouter: ng.ui.IUrlRouterService,
        private $location: ng.ILocationService,
        private $stickyState: ng.ui.IStickyStateService,
        private $urlMatcherFactory: ng.ui.IUrlMatcherFactory,
        private $timeout: ng.ITimeoutService,
        private $stateProvider: ng.ui.IStateProvider,
        private $urlRouterProvider: ng.ui.IUrlRouterProvider,
        private routeconfig: IRouteConfig,
        private loader: ILoader,
        private common: ICommon,
        private config: IMainConfig,
        private logger: ILogger,
        private localization: ILocalization,
        private base64: IBase64,
        private constants: IConstants,
        private caching: ICaching) {
        //Register static states and events
        this.init();
        //static shell state octates count, default "shell.content" 
        this.shellContentStateOctateLen = this.constants.routing.SHELL_CONTENT_STATE_NAME.split('.').length;
    }
    /**
    * Register static states and events
    */
    private init(): void {
        //Master Page sections register
        this.registerShellSections();
        //Map static maps
        this.registerStaticPages();
        //State eventleri register ediyoruz
        this.registerEvents();
        //Register custom types
        this.registerCustomTypes();
    }
    //#endregion

    //#region Register Methods
    /**
     * Register custom types 
     */
    private registerCustomTypes(): void {
        //encoded param
        this.$urlMatcherFactory.type('encoded',
            {
                encode: (val: any, key: string) => {
                    return this.base64.encode(val);
                },
                decode: (val: string, key: string) => {
                    return this.base64.decode(val);
                },
                is: (val: any, key: string): boolean => {
                    return true;
                }
            });
    }
    /**
        * Register state events 
        */
    private registerEvents(): void {
        this.$rootScope.$on(this.constants.events.EVENT_STATE_CHANGE_SUCCESS, (event, toState: IRotaState) => {
            if (!toState) return;
            /**
             * Set breadcrumb datasource
             */
            const setBreadcrumb = (): void => {
                let menu = this.getActiveMenu(toState);
                const routelist: IBreadcrumb[] = [];
                while (menu) {
                    routelist.push(
                        {
                            text: menu.localizedTitle,
                            url: menu.absoluteUrl,
                            icon: menu.menuIcon
                        });
                    menu = menu.parentMenu;
                }
                this._breadcrumbs = routelist.reverse();
            }
            /**
             * Set current main menu 
             */
            const setActiveMenu = (): void => {
                const menu = this.getActiveMenu(toState);
                if (toState.name === this.constants.routing.SHELL_STATE_NAME || menu !== this.activeMenu) {
                    this._activeMenu = menu;
                    //set breadcrumb only when menu changes
                    setBreadcrumb();
                }
            }

            setActiveMenu();
        });

        this.$rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
            if (!error) return;
            switch (error.status) {
                //Not found
                case 404:
                    this.go(this.constants.routing.NOT_FOUND_STATE_NAME);
                    break;
                //Internal Error
                case 500:
                    this.go(this.constants.routing.INTERNAL_ERROR_STATE_NAME);
                    break;
            }
        });
    }
    /**
     * Register static pages
     */
    private registerStaticPages(): void {
        //404 page
        this.$stateProvider.state(this.constants.routing.NOT_FOUND_STATE_NAME,
            { url: 'error404', templateUrl: this.routeconfig.templates.error404 });
        //500 page
        this.$stateProvider.state(this.constants.routing.INTERNAL_ERROR_STATE_NAME,
            { url: 'error500', templateUrl: this.routeconfig.templates.error500 });
    }
    /**
     * Register shell section
     * @param statename State name
     * @param sections Sections
     * @param url url
     * @param sticky Sticky flag
     * @param resolve Resolve promise
     */
    private registerShellSection(statename: string, sections: any[], abstract?: boolean,
        url?: string, sticky?: boolean, resolve?: any): void {
        const views: { [name: string]: ng.ui.IState } = {};

        sections.forEach(section => {
            for (let state in section) {
                if (section.hasOwnProperty(state)) {
                    views[state] = {
                        templateUrl: section[state].templateUrl,
                        controller: section[state].controller,
                        controllerAs: section[state].controllerAs
                    };
                }
            }
        });
        this.$stateProvider.state(statename, <ng.ui.IStickyState>{
            abstract: abstract,
            url: url,
            views: views,
            sticky: sticky,
            resolve: resolve
        });
    }
    /**
    * Register shell sections
    */
    private registerShellSections(): void {
        const shellSections = [
            {
                'shell@': {
                    templateUrl: this.routeconfig.templates.shell,
                    controller: this.constants.routing.SHELL_CONTROLLER_NAME,
                    controllerAs: this.routeconfig.shellControllerAlias
                }
            },
            { 'header@shell': { templateUrl: this.routeconfig.templates.header } }
        ],
            contentSections = [{ '@shell': { templateUrl: this.routeconfig.templates.content } },
            { 'breadcrumb@shell.content': { templateUrl: this.routeconfig.templates.breadcrumb } },
            { 'badges@shell.content': { templateUrl: this.routeconfig.templates.badges } },
            { 'actions@shell.content': { templateUrl: this.routeconfig.templates.actions } },
            { 'currentcompany@shell.content': { templateUrl: this.routeconfig.templates.currentcompany } },
            { 'title@shell.content': { templateUrl: this.routeconfig.templates.title } }];
        //register shell state
        //UNDONE:add shell promise
        this.registerShellSection(this.constants.routing.SHELL_STATE_NAME, shellSections, false, '/', true);
        //register content state
        this.registerShellSection(this.constants.routing.SHELL_CONTENT_STATE_NAME, contentSections, true);
    }
    /**
     * Register state
     * @param state State     
     */
    private registerState(state: IMenuModel): IRouting {
        //only state name defined and host's name is matched
        if (!state.name || (state.host && this.config.host !== state.host)) return this;
        //check if already defined
        if (this.getState(state.name)) {
            this.logger.console.warn({ message: 'state already registered ' + state.name });
            return this;
        }
        //normalize template file path
        const templateFilePath = this.common.isHtml(state.templateUrl as string) ? this.toUrl(state.templateUrl as string) : state.templateUrl;
        //is nested state
        const isNestedState = this.isNestedState(state.name);
        //adjust url
        let url = ((state.url && (isNestedState ? '/' + state.url : state.url)) || '') as string;
        //check /:id param is available in state url.if available,this is a crud page
        if (this.newItemParamNameRegex.test(url)) {
            const idParamName = this.constants.controller.DEFAULT_NEW_ITEM_PARAM_NAME;
            const idParamValue = this.constants.controller.DEFAULT_NEW_ITEM_PARAM_VALUE;
            //replace :id param to more strict type.id must be either numeric value or 'new' value
            url = url.replace(`:${idParamName}`, `{${idParamName}:[0-9]+|${idParamValue}}`);
            //default params for crud pages
            const defaultParams = {};
            defaultParams[idParamName] = idParamValue;
            defaultParams[this.constants.controller.DEFAULT_READONLY_PARAM_NAME] = true;
            defaultParams[this.constants.controller.PREVIEW_MODE_PARAM_NAME] = false;
            state.params = this.common.extend(defaultParams, state.params);
        }
        //define state obj
        const stateObj: IRotaState = {
            hierarchicalMenu: state.hierarchicalMenu,
            abstract: state.abstract,
            templateUrl: templateFilePath,
            controller: state.controller,
            controllerAs: this.routeconfig.contentControllerAlias,
            url: url,
            params: state.params,
            isNestedState: isNestedState,
            resolve: {
                stateInfo: (): IStateInfo => {
                    return {
                        isNestedState: isNestedState,
                        stateName: state.name,
                        isStickyTab: state.sticky
                    }
                },
                $modalInstance: angular.noop,
                modalParams: angular.noop
            }
        };
        //sticky settings 
        if (state.sticky) {
            const views: { [index: string]: ng.ui.IState } = {};
            views[state.name] = {
                controller: state.controller,
                templateUrl: templateFilePath,
                controllerAs: this.routeconfig.contentControllerAlias
            }
            stateObj.views = views;
            stateObj.sticky = true;
        }
        //controller load
        if (angular.isString(stateObj.controller)) {
            const cntResolve = { load: () => this.loader.resolve(state.controllerUrl) };
            stateObj.resolve = angular.extend(stateObj.resolve, cntResolve);
        } else {
            //if no controller defined and abstract is set,generic template injected here
            if (state.abstract) {
                stateObj.template = '<div ui-view></div>';
            }
        }
        //register
        this.$stateProvider.state(state.name, stateObj);
        return this;
    }
    //#endregion

    //#region Menu Methods
    /**
    * Add states with menu definitions
    * @param states States
    */
    addMenus(states: IMenuModel[]): IRouting {
        this._states = states || [];
        //create hierarchical & navbar menus
        this._hierarchicalMenus = this.createHierarchicalMenus();
        //register states
        try {
            this._states.forEach((state: IMenuModel) => {
                this.registerState(state);
            });
            //create nav menus *this must be called after registration of states*
            this._navMenus = this.createNavMenus();
            //add quick menus
            this.createQuickMenus();
        } finally {
            this.$urlRouter.sync();
            this.$urlRouter.listen();
        }
        return this;
    }
    /**
     * Create nav menu items
     * @param menus
     */
    private createNavMenus(menus?: IHierarchicalMenu[], parent?: INavMenuItem): INavMenuItem[] {
        const navMenus: INavMenuItem[] = [];

        (menus || this._hierarchicalMenus).where(menu => menu.isMenu)
            .forEach(menu => {
                if (menu.startGroup) {
                    navMenus.push({ text: 'divider' });
                }
                const navMenu: INavMenuItem = {
                    text: menu.localizedTitle,
                    url: this.getMenuAbsoluteUrl(menu),
                    icon: menu.menuIcon,
                    parent: parent
                }
                navMenu.subtree = menu.subMenus && this.createNavMenus(menu.subMenus, navMenu);
                navMenus.push(navMenu);
                //update url on menu
                menu.absoluteUrl = navMenu.url;
            });
        return navMenus;
    }
    /**
     * Create NavBar menus
     */
    private createHierarchicalMenus(): IHierarchicalMenu[] {
        const rootMenus = this.getMenusByParentId();

        if (!rootMenus.length) {
            this.logger.console.error({ message: this.constants.errors.NOT_ROOT_MENU_FOUND });
        }
        //generate menus recursively
        return this.createHierarchicalMenusRecursive(rootMenus);
    }
    /**
     * Create nav menu items recursively
     * @param parentMenus Parent Menus
     * @param parentNavMenu Parent Menu
     */
    private createHierarchicalMenusRecursive(parentMenus: IMenuModel[], parentMenu?: IHierarchicalMenu): IHierarchicalMenu[] {
        const menus: IHierarchicalMenu[] = [];
        parentMenus.forEach((state: IMenuModel) => {
            //create hierarchical menu
            const menu = angular.copy<IHierarchicalMenu>(state as IHierarchicalMenu);
            //set helper props
            menu.localizedTitle = state.title || (state.titleI18N && this.localization.getLocal(state.titleI18N));
            menu.parentMenu = parentMenu;
            //create subnav menus
            const subMenus = this.getMenusByParentId(state.id);
            if (subMenus.length) {
                menu.subMenus = this.createHierarchicalMenusRecursive(subMenus, menu);
            }
            menus.push(menu);
            //update state 
            state.hierarchicalMenu = menu;
        });
        return menus;
    }
    /**
     * Add quick menus
     */
    private createQuickMenus(): void {
        //default quickmenus
        const qMenus: IQuickMenu[] = this._states.where(state => state.isQuickMenu).map(menu => {
            return {
                url: menu.menuUrl,
                text: menu.hierarchicalMenu.localizedTitle,
                icon: menu.menuIcon,
                state: menu.name
            }
        });
        //user-defined quickmenus
        const staleMenus = [],
            uqMenus = this.caching.localStorage.get<string[]>(this.constants.routing.QUICKMENU_STORAGE_KEY) || [];
        uqMenus.forEach(sname => {
            let state: IRotaState;
            if (state = this.getState(sname)) {
                const menu = this.getActiveMenu(state);
                menu.isQuickMenu = true;
                qMenus.push({
                    text: menu.localizedTitle,
                    icon: menu.menuIcon,
                    state: sname
                });
            } else {
                staleMenus.push(sname);
            }
        });
        //add
        this.quickMenus = qMenus.slice(0, this.constants.routing.MAX_QUICKMENU_LEN);
        //remove stale states if any 
        if (staleMenus.length) {
            uqMenus.delete(sname => staleMenus.indexOf(sname) > -1);
            this.caching.localStorage.store(this.constants.routing.QUICKMENU_STORAGE_KEY, uqMenus);
        }
    }
    /**
     * Add current menu to quick menus
     */
    addCurrentMenuToQuickMenus(): void {
        const qmenus = this.caching.localStorage.get<string[]>(this.constants.routing.QUICKMENU_STORAGE_KEY) || [];
        const selInd = qmenus.indexOf(this.current.name);

        if (!this.activeMenu.isQuickMenu) {
            if (selInd === -1) {
                if (this.quickMenus.length >= this.constants.routing.MAX_QUICKMENU_LEN) {
                    this.logger.toastr.warn({
                        message: this.localization.getLocal("rota.hizliemenuadetkisiti", this.constants.routing.MAX_QUICKMENU_LEN)
                    });
                    return;
                }
                qmenus.push(this.current.name);
                this.activeMenu.isQuickMenu = true;
            }
        } else {
            if (selInd > -1) {
                qmenus.splice(selInd, 1);
                this.activeMenu.isQuickMenu = false;
            } else {
                this.logger.toastr.warn({
                    message: this.localization.getLocal("rota.hizlimenusilmehatasi")
                });
                return;
            }
        }
        this.caching.localStorage.store(this.constants.routing.QUICKMENU_STORAGE_KEY, qmenus);
        this.createQuickMenus();
    }
    //#endregion

    //#region Utils
    /**
    * Get base host url
    * @returns {string} 
    */
    getHostUrl(): string {
        return location.protocol + "//" + location.host;
    }
    /**
    * Go to state
    * @param stateName State name
    * @param params State params
    * @param options State options
    */
    go(stateName: string, params?, options?: ng.ui.IStateOptions): ng.IPromise<any> {
        return this.$state.go(stateName, params, options);
    }
    /**
     * Change address bar url without reloading
     * @param params
     */
    changeUrl<T>(params: IDictionary<T>): ng.IPromise<any> {
        return this.go(this.current.name, params,
            { notify: false, reload: false });
    }
    /**
     * Reload state
     */
    reload(): ng.IPromise<any> {
        return this.$state.reload();
    }
    /**
     * Go preview page
     */
    goBack(): void {
        this.$window.history.go(-1);
    }
    /**
     * Full reload
     */
    reloadBrowser(): void {
        this.$window.location.replace("");
    }
    /**
     * Set the startup state when app get bootstrapped
     * @param defaultState Startup state
     * @param params State params
     */
    start(defaultState: string, params?: any): void {
        const currentUrl = this.$location.url();

        if (currentUrl === "" || currentUrl === "/") {
            this.$timeout(() => {
                this.go(defaultState || this.constants.routing.SHELL_STATE_NAME, params);
            }, 0);
        }
    }
    /**
     * Get href uri from state
     * @param stateName State Name
     * @param params Optional params
     */
    getUrlByState(stateName: string, params?: any): string {
        if (!stateName) return null;
        return this.$state.href(stateName, params);
    }
    /**
        * Check state is active
        * @param stateName State name
        * @param params Optional Params
        */
    isActive(stateName: string, params?: any): boolean {
        return this.$state.is(stateName, params);
    }
    /**
    * Check state is in active pipeline
    * @param stateName State name
    * @param params Optional Params
    */
    isInclude(stateName: string, params?: any): boolean {
        return this.$state.includes(stateName, params);
    }
    /**
    * Get states by parentId
    * @param parentId State parentId
    */
    getMenusByParentId(parentId?: number): IMenuModel[] {
        const menus = _.filter(this._states, (item: IMenuModel) => {
            if (this.common.isAssigned(parentId)) {
                return item.parentId === parentId;
            }
            return !this.common.isAssigned(item.parentId);
        });
        return _.sortBy(menus, this.constants.controller.DEFAULT_MODEL_ORDER_FIELD_NAME);
    }
    /**
    * Get state by name
    * @param stateName
    */
    getState(stateName: string): IRotaState {
        if (!stateName) return undefined;
        return <IRotaState>this.$state.get(stateName);
    }
    /**
     * Convert relative url ro absolute url
     * @param relativeUrl Relative url
     */
    toUrl(relativeUrl: string): string {
        return window.require.toUrl(relativeUrl);
    }
    /**
     * Get defined baseurl of requirejs config
     */
    getBasePath(): string {
        return this.toUrl('.');
    }
    /**
     * Get absolute uri of menu 
     * @param menu Menu
     */
    getMenuAbsoluteUrl(menu: IMenuModel): string {
        const reluri = menu.menuUrl ||
            (menu.name && this.$state.href(menu.name, menu.params)) ||
            (menu.url && /[^?|:]*/.exec(menu.url as string)[0]);

        if (menu.host && menu.host !== this.config.host) {
            return this.toUrl(`${menu.host}/${reluri}`);
        } else {
            return reluri;
        }
    }
    /**
     * Returns whether provided state is nested 
     * @param name State name
     */
    private isNestedState(name: string): boolean {
        return name.split('.').length > (this.shellContentStateOctateLen + 1);
    }
    /**
     * Get active menu eliminating nested states
     * @param state Optional state
     */
    getActiveMenu(state?: IRotaState): IHierarchicalMenu {
        let menu = (state || this.current).hierarchicalMenu;
        while (menu && this.isNestedState(menu.name)) {
            menu = menu.parentMenu;
        }
        return menu;
    }
    //#endregion
}
//#endregion

//#region Config
var config = ($provide: ng.auto.IProvideService,
    $stateProvider: ng.ui.IStateProvider,
    $urlRouterProvider: ng.ui.IUrlRouterProvider,
    $stickyStateProvider: ng.ui.IStickyStateProvider,
    $locationProvider: ng.ILocationProvider,
    constants: IConstants) => {
    //make runtime config
    $provide.factory('StateProvider', () => $stateProvider);
    $provide.factory('UrlRouterProvider', () => $urlRouterProvider);
    $urlRouterProvider.deferIntercept();
    //redirect to / when only host entered in url
    $urlRouterProvider.when('', '/');
    //to prevent infinite loop https://github.com/angular-ui/ui-router/issues/600#issuecomment-47228922
    $urlRouterProvider.otherwise(($injector: ng.auto.IInjectorService) => {
        const $state = $injector.get("$state") as ng.ui.IStateService;
        $state.go(constants.routing.NOT_FOUND_STATE_NAME);
    });
    //Sticky mode log monitoring
    $stickyStateProvider.enableDebug(false);
    //Enable Html5 mode
    $locationProvider.html5Mode(true);
}
config.$inject = ['$provide', '$stateProvider', '$urlRouterProvider', '$stickyStateProvider', '$locationProvider', 'Constants'];
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.routing', ['rota.services.routing.config', 'rota.services.loader', 'ui.router',
    'ct.ui.router.extras.sticky', 'ct.ui.router.extras.dsr']);
module.service(Routing.injectionName, Routing)
    .config(config);
//#endregion

export { Routing }