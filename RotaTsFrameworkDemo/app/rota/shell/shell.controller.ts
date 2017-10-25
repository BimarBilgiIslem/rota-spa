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
    isMobileOrTablet: boolean;
    bgImageUrl: { [index: string]: string };
    vidOptions: IVideoOptions;
    viewPortClass?: string;
    currentYear: number;
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
        private titleBadges: ITitleBadges,
        private common: ICommon) {
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
        this.isMobileOrTablet = common.isMobileOrTablet();
        this.currentYear = (new Date()).getFullYear();
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
    }
    /**
     * Set active menu & app title
     */
    private setActiveMenuListener() {
        this.$scope.$watch<IHierarchicalMenu>(() => this.routing.activeMenu, (menu) => {
            this.$rootScope.appTitle = menu ? (`${menu.localizedTitle} - ${this.config.appTitle}`) : this.config.appTitle;
            if (this.config.homePageOptions)
                this.isHomePage = this.$location.url() === this.config.homePageOptions.url;
            //set viewpot width size
            this.viewPortClass =
                (this.config.enableContainerFluid || (menu && menu.isFullScreen)) ? 'container-fluid' : 'container';
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
    goQuickmenu(quickMenu: IQuickMenu): void {
        if (!quickMenu) return;
        if (quickMenu.url) {
            this.$window.location.replace(quickMenu.url);
        } else {
            this.routing.go(quickMenu.state);
        }
    }
    /**
     * Shows nav menus & settings modal for small devices
     */
    showNavMenu(): void {
        this.dialogs.showModal({
            isSideBar: true,
            windowClass: 'side-nav',
            viewPortSize: true,
            absoluteTemplateUrl: this.routeconfig.templates.navmenumobile,
            controller: 'ProfileModalController',
            controllerAs: 'profilevm'
        });
    }
    /**
     * Set Mbf visibility
     * @description Only visible in main page on mobile device.
     */
    isMbfVisible(): boolean {
        return (!this.isMobileOrTablet || this.isHomePage) &&
            this.config.enableQuickMenu && this.routing.quickMenus.length > 0;
    }
    //#endregion
}
//#endregion

//#region Injection
ShellController.$inject = ['$rootScope', '$scope', '$location', '$window', 'Routing', 'Config',
    'Dialogs', 'Constants', 'CurrentUser', 'CurrentCompany', 'RouteConfig', 'TitleBadges', 'Common'];
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.shell', []);
module.controller('ShellController', ShellController);
//#endregion
