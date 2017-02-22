//#region Shell Controller
/**
 * Shell controller 
 */
class ShellController {
    //#region Props
    /**
     * Indicate whether the spinner will be shown
     */
    private _isBusy: boolean;
    get isBusy(): boolean { return this._isBusy; }
    /**
     * Ajax spinner options
     */
    private _spinnerOptions: SpinnerOptions;
    get spinnerOptions(): SpinnerOptions { return this._spinnerOptions; }
    /**
     * Indicates that menu will be in fullscreen container,default false
     */
    isHomePage: boolean;
    bgImageUrl: { [index: string]: string };
    vidOptions: IVideoOptions;
    //#endregion

    //#region Init
    constructor(private $rootScope: IRotaRootScope,
        private $scope: IShellScope,
        private $location: ng.ILocationService,
        private $window: ng.IWindowService,
        private routing: IRouting,
        private config: IMainConfig,
        private dialogs: IDialogs,
        private constants: IConstants,
        private currentUser: IUser,
        private currentCompany: ICompany,
        private routeconfig: IRouteConfig,
        private titleBadges: ITitleBadges) {
        //init settings
        this.setSpinner();
        this.setActiveMenuListener();
        //initial vars
        if (config.homePageOptions) {
            this.bgImageUrl = config.homePageOptions.imageUri &&
                { 'background-image': `url(${config.homePageOptions.imageUri})` };
            this.vidOptions = config.homePageOptions.videoOptions;
            this.isHomePage = $location.url() === config.homePageOptions.url;
        }
        $rootScope.appTitle = '';
        $rootScope.forms = {};
    }
    //#endregion

    //#region Shell Methods
    /**
    * Set spinner settings
    */
    private setSpinner() {
        //register main spinner events
        this.$rootScope.$on(this.config.eventNames.ajaxStarted, () => {
            this._isBusy = true;
        });
        this.$rootScope.$on(this.config.eventNames.ajaxFinished, () => {
            this._isBusy = false;
        });
        //spinner settings
        this._spinnerOptions = this.constants.controller.DEFAULT_SPINNER_OPTIONS;
    }
    /**
     * Set active menu & app title
     */
    private setActiveMenuListener() {
        this.$scope.$watch<IHierarchicalMenu>(() => this.routing.activeMenu, (menu) => {
            this.$rootScope.appTitle = menu ? (`${menu.title} - ${this.config.appTitle}`) : this.config.appTitle;
            if (this.config.homePageOptions)
                this.isHomePage = this.$location.url() === this.config.homePageOptions.url;
        });
    }
    /**
    * Refresh state
    */
    refresh(): void {
        this.routing.reload();
    }
    /**
     * Quick menu transition
     * @param quickMenu QuickMenu
     */
    goQuickmenu(quickMenu: IMenuModel): void {
        if (!quickMenu) return;

        if (quickMenu.menuUrl) {
            this.$window.location.href = quickMenu.menuUrl;
        } else {
            this.routing.go(quickMenu.name, quickMenu.params);
        }
    }
    /**
     * Shows nav menus & settings modal for small devices
     */
    showNavMenu(): void {
        this.dialogs.showModal({
            isSideBar: true,
            windowClass: 'side-nav',
            absoluteTemplateUrl: this.routeconfig.templates.navmenumobile,
            controller: 'ProfileModalController',
            controllerAs: 'profilevm'
        });
    }
    //#endregion
}
//#endregion

//#region Injection
ShellController.$inject = ['$rootScope', '$scope', '$location', '$window', 'Routing', 'Config',
    'Dialogs', 'Constants', 'CurrentUser', 'CurrentCompany', 'RouteConfig', 'TitleBadges'];
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.shell', []);
module.controller('ShellController', ShellController);
//#endregion
