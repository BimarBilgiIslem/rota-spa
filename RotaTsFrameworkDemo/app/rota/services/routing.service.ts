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
    /**
     * Quick menus
     */
    quickMenus: IMenuItem[] = [];
    /**
     * Orj Menus 
     */
    private _states: IMenuModel[];
    get states(): IMenuModel[] { return this._states; }
    /**
     * Hierarchical menus
     */
    private _menus: IHierarchicalMenuItem[];
    get menus(): IHierarchicalMenuItem[] { return this._menus; }
    /**
     * Breadcrumbs
     */
    private _breadcrumbs: IBreadcrumb[];
    get breadcrumbs(): IBreadcrumb[] { return this._breadcrumbs; }
    /**
     * Active Menu
     */
    private _activeMenu: IHierarchicalMenuItem;
    get activeMenu(): IHierarchicalMenuItem { return this._activeMenu; }
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
    //#endregion

    //#region Init
    static $inject = ['$state', '$stateParams', '$rootScope', '$q', '$urlRouter', '$location',
        '$stickyState', '$urlMatcherFactory', '$timeout', 'StateProvider', 'UrlRouterProvider',
        'RouteConfig', 'Loader', 'Common', 'Config', 'Logger', 'Localization', 'Base64', 'Constants'];
    //ctor
    constructor(private $state: ng.ui.IStateService,
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
        private constants: IConstants) {
        //Register static states and events
        this.init();
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

    //#region State Active Methods
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

    //#endregion

    //#region State Register Methods
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
        this.$rootScope.$on('$stateChangeSuccess', (event, toState: IRotaState) => {
            /**
             * Find parent abstract state if state is partial
             */
            const getMenu = (_menu?: IHierarchicalMenuItem): IHierarchicalMenuItem => {
                let menu = _menu || toState.hierarchicalMenu;
                while (menu && menu.isNestedState) {
                    menu = menu.parentMenu;
                }
                return menu;
            }
            /**
             * Set breadcrumb datasource
             */
            const setBreadcrumb = (): void => {
                let menu = getMenu();
                const routelist: IBreadcrumb[] = [];
                while (menu) {
                    routelist.push(
                        {
                            text: menu.title,
                            url: menu.menuUrl || this.getUrlByState(menu.state),
                            icon: menu.menuIcon
                        });
                    menu = menu.parentMenu && getMenu(menu.parentMenu);
                }
                this._breadcrumbs = routelist.reverse();
            }
            /**
             * Set current main menu 
             */
            const setActiveMenu = (): void => {
                //find parent abstract state if state is partial
                const menu = getMenu();
                if (toState.name === this.constants.routing.SHELL_STATE_NAME || menu !== this.activeMenu) {
                    this._activeMenu = menu;
                    this.$rootScope.$broadcast(this.config.eventNames.menuChanged, menu);
                }
            }

            if (!toState) return;
            setActiveMenu();
            setBreadcrumb();
        });

        this.$rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
            if (!error) return;
            //TODO:Hata tipine gore işlem yapılmali
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
            { url: 'error404', templateUrl: this.routeconfig.error404StateUrl });
        //500 page
        this.$stateProvider.state(this.constants.routing.INTERNAL_ERROR_STATE_NAME,
            { url: 'error500', templateUrl: this.routeconfig.error500StateUrl });
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
                        templateUrl: this.toUrl(this.routeconfig.shellPath + section[state].templateUrl),
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
            { 'shell@': { templateUrl: 'shell.html', controller: 'ShellController', controllerAs: this.routeconfig.shellControllerAlias } },
            { 'header@shell': { templateUrl: 'header.html' } }
        ],
            contentSections = [{ '@shell': { templateUrl: 'content.html' } },
            { 'breadcrumb@shell.content': { templateUrl: 'breadcrumb.html' } },
            { 'notification@shell.content': { templateUrl: 'notification.html' } },
            { 'badges@shell.content': { templateUrl: 'badges.html' } }
            ];
        //register shell state
        //UNDONE:add shell promise
        this.registerShellSection(this.constants.routing.SHELL_STATE_NAME, shellSections, false, '/', true);
        //register content state
        this.registerShellSection(this.constants.routing.SHELL_CONTENT_STATE_NAME, contentSections, true);
    }
    /**
    * Register states
    */
    private registerStates(): void {
        //Create default state params
        const defaultParams = {};
        defaultParams[this.constants.controller.DEFAULT_NEW_ITEM_PARAM_NAME] =
            this.constants.controller.DEFAULT_NEW_ITEM_PARAM_VALUE;
        defaultParams[this.constants.controller.DEFAULT_READONLY_PARAM_NAME] = true;
        //filter to get real states 
        const states: IMenuModel[] = _.filter(this._states, (state: IMenuModel) => {
            return !!state.name;
        });
        //register states
        states.forEach((state: IMenuModel) => {
            this.registerState(state, defaultParams);
        });
    }
    /**
     * Register state
     * @param state State
     */
    private registerState(state: IRotaState, defaultParams?: IDictionary<any>): IRouting {
        //Check if already defined
        if (this.getState(state.name)) {
            this.logger.console.warn({ message: 'state already registered ' + state.name });
            return this;
        }
        if (!this.common.isAssigned(state.hierarchicalMenu)) {
            this.logger.console.warn({ message: state.name + ' state\'s parent is not exists so state is skipped', data: state });
            return this;
        }
        //set temlate path based on baseUrl - works both html and dynamic file server
        const templateFilePath = this.common.isHtml(<string>state.templateUrl) ?
            window.require.toUrl(<string>state.templateUrl) : state.templateUrl;
        //#region Define State Object
        //set url
        let url = "";
        if (state.url) {
            url = <string>(state.hierarchicalMenu.isNestedState || state.hierarchicalMenu.isStickyTab ? '/' + state.url : state.url);
        }
        //State Object
        const stateObj: IRotaState = {
            sticky: state.sticky,
            deepStateRedirect: state.deepStateRedirect,
            abstract: state.abstract,
            template: state.template,
            templateUrl: templateFilePath,
            controller: state.controller,
            //ControllerAs syntax used as default 'vm'
            controllerAs: this.routeconfig.contentControllerAlias,
            hierarchicalMenu: state.hierarchicalMenu,
            url: url,
            params: angular.extend(defaultParams, state.params),
            //Resolve params
            resolve: {
                stateInfo: (): IStateInfo => {
                    return {
                        isNestedState: state.hierarchicalMenu.isNestedState,
                        stateName: state.name,
                        isStickyTab: state.hierarchicalMenu.isStickyTab
                    }
                },
                authenticated: [
                    'Security', (security: ISecurity) => security.isStateAuthenticated(state)
                ],
                antiForgeryToken: [
                    'Security', (security: ISecurity) => {
                        if (security.securityConfig.antiForgeryTokenEnabled &&
                            !state.hierarchicalMenu.isNestedState) {
                            return security.getAntiForgeryToken(state);
                        }
                    }
                ],
                $modalInstance: angular.noop,
                modalParams: angular.noop
            }
        };
        //if its tab state,must be added to views object 
        if (state.hierarchicalMenu && state.hierarchicalMenu.isStickyTab) {
            const views: { [index: string]: ng.ui.IState } = {};
            views[state.name] = {
                controller: state.controller,
                templateUrl: templateFilePath,
                controllerAs: this.routeconfig.contentControllerAlias
            }
            stateObj.views = views;
            stateObj.sticky = true;
        }
        //#endregion

        //#region Controller Resolve
        //Main Controller load
        if (angular.isString(stateObj.controller)) {
            const cntResolve = this.loader.resolve({
                controllerUrl: state.controllerUrl,
                templateUrl: <string>state.templateUrl
            });
            stateObj.resolve = angular.extend(stateObj.resolve, cntResolve);
        } else {
            //if no controller defined and abstract is set,generic template injected here
            if (state.abstract) {
                stateObj.template = '<div ui-view></div>';
            }
        }
        //#endregion

        //register state
        this.$stateProvider.state(state.name, stateObj);
        return this;
    }
    //#endregion

    //#region Menu Methods
    /**
       * Get states by parentId
       * @param parentId State parentId
       */
    private getStatesByParentId(parentId?: number): IMenuModel[] {
        const menus = _.filter(this._states, (item: IMenuModel) => {
            if (this.common.isAssigned(parentId)) {
                return item.parentId === parentId;
            }
            return !this.common.isAssigned(item.parentId);
        });
        return _.sortBy(menus, this.constants.controller.DEFAULT_MODEL_ORDER_FIELD_NAME);
    }
    /**
     * Convert states to hierarchical node way
     */
    private toHierarchicalMenu(): IHierarchicalMenuItem[] {
        const rootMenus = this.getStatesByParentId();
        this.shellContentStateOctateLen = this.constants.routing.SHELL_CONTENT_STATE_NAME.split('.').length;

        if (!rootMenus.length) {
            throw new Error(this.constants.errors.NOT_ROOT_MENU_FOUND);
        }
        //generate menus recursively
        return this.getMenusRecursively(rootMenus);
    }
    /**
     * Get states (menus) recursively
     * @param parentStates Parent states
     * @param parentMenu Parent menu
     */
    private getMenusRecursively(parentStates: IMenuModel[], parentMenu?: IMenuItem): IHierarchicalMenuItem[] {
        const menus: IHierarchicalMenuItem[] = [];

        parentStates.forEach((state: IMenuModel) => {
            const menu = angular.copy<IHierarchicalMenuItem>(state);
            menu.parentMenu = parentMenu;
            menu.state = state.name;
            //update title
            menu.title = menu.title || (menu.titleI18N && this.localization.getLocal(menu.titleI18N));
            //set isNestedState flag
            if (menu.state) {
                menu.isNestedState = menu.state.split('.').length > (this.shellContentStateOctateLen + 1);
            }
            state.hierarchicalMenu = menu;
            //Set substates
            var subStates = this.getStatesByParentId(state.id);
            if (subStates.length) {
                menu.subMenus = this.getMenusRecursively(subStates, menu);
            }
            //set quickmenu
            if (menu.isQuickMenu)
                this.quickMenus.push(menu);
            menus.push(menu);
        });
        return menus;
    }

    //#endregion

    //#region State Utils
    /**
         * Get state by name
         * @param stateName
         */
    getState(stateName: string): IRotaState {
        if (!this.common.isAssigned(stateName)) return undefined;
        return <IRotaState>this.$state.get(stateName);
    }
    /**
     * Add states with menu definitions
     * @param states States
     */
    addMenus(states: IMenuModel[]): IRouting {
        this._states = states || [];
        this._menus = this.toHierarchicalMenu();
        try {
            this.registerStates();
        } finally {
            this.$urlRouter.sync();
            this.$urlRouter.listen();
        }
        return this;
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
     * Reload state
     */
    reload(): ng.IPromise<any> {
        return this.$state.reload();
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
        return this.$state.href(stateName, params);
    }
    /**
     * Convert relative url ro absolute url
     * @param relativeUrl Relative url
     */
    toUrl(relativeUrl: string): string {
        return window.require.toUrl(relativeUrl);
    }
    //#endregion
}
//#endregion

//#region Config
var config = ($provide: ng.auto.IProvideService,
    $stateProvider: ng.ui.IStateProvider,
    $urlRouterProvider: ng.ui.IUrlRouterProvider,
    $stickyStateProvider: ng.ui.IStickyStateProvider,
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
}
config.$inject = ['$provide', '$stateProvider', '$urlRouterProvider', '$stickyStateProvider', 'Constants'];
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.routing', ['rota.services.routing.config', 'rota.services.loader', 'ui.router',
    'ct.ui.router.extras.sticky', 'ct.ui.router.extras.dsr']);
module.service('Routing', Routing)
    .config(config);
//#endregion

export { Routing }