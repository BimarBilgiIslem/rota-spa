//#region Imports
import { App } from "rota/config/app";
//#endregion

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
    navCollapsed: boolean;
    //#endregion

    //#region Init
    constructor(private $rootScope: IRotaRootScope,
        private $scope: IShellScope,
        private $location: ng.ILocationService,
        private $window: ng.IWindowService,
        private hotkey: ng.hotkeys.HotkeysProvider,
        private uploader: ng.angularFileUpload.IUploadService,
        private securityConfig: ISecurityConfig,
        private routing: IRouting,
        private config: IMainConfig,
        private logger: ILogger,
        private titleBadges: ITitleBadges,
        private localization: ILocalization,
        private security: ISecurity,
        private dialogs: IDialogs,
        private caching: ICaching,
        private routeConfig: IRouteConfig,
        private constants: IConstants) {
        //init settings
        this.setSpinner();
        this.setActiveMenuListener();
        //initial vars
        this.navCollapsed = true;
        if (config.homePageOptions) {
            this.bgImageUrl = config.homePageOptions.imageUri &&
                { 'background-image': `url(${config.homePageOptions.imageUri})` };
            this.vidOptions = config.homePageOptions.videoOptions;
            this.isHomePage = $location.url() === config.homePageOptions.url;
        }
        $rootScope.appTitle = '';
        $rootScope.forms = {};
        $scope.supportedLanguages = this.config.supportedLanguages;
        $scope.currentLanguage = localization.currentLanguage;
        $scope.currentUser = security.currentUser;
        $scope.currentCompany = security.currentCompany;
        $scope.authorizedCompanies = securityConfig.authorizedCompanies;
        if (securityConfig.avatarUri)
            $scope.avatarUri = securityConfig.avatarUri;
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
        this.$scope.$watch<INavMenuItem>(() => this.routing.activeMenu, (menu) => {
            this.$rootScope.appTitle = menu ? (`${menu.name} - ${this.config.appTitle}`) : this.config.appTitle;
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
     * Change current language
     * @param $event Event
     * @param lang Language to be changed to
     */
    changeLanguage($event: ng.IAngularEvent, lang: ILanguage) {
        this.localization.currentLanguage = lang;
        $event.preventDefault();
    }
    /**
     * Logoff
     */
    logOff(): void {
        this.dialogs.showConfirm({ message: this.localization.getLocal('rota.cikisonay') }).then((): void => {
            this.security.logOff();
        });
    }
    /**
     * Change selected company
     * @param companyId
     */
    setCompany(company: ICompany): void {
        if (App.onCompanyChanged) {
            const result = App.onCompanyChanged(company);
            if (result === true) {
                return;
            }
        }

        this.caching.sessionStorage.store<IStorageCurrentCompany>(
            this.constants.security.STORAGE_NAME_CURRENT_COMPANY,
            {
                id: company.id,
                companyId: company.companyId,
                roleId: company.roleId
            });
        //redirect to home page
        this.$window.location.replace("");
    }
    /**
     * Change profile picture
     */
    changeAvatar(): void {
        if (!this.securityConfig.avatarUploadUri)
            throw new Error(this.constants.errors.NO_AVATAR_URI_PROVIDED);

        this.dialogs.showFileUpload({
            allowedExtensions: this.constants.controller.ALLOWED_AVATAR_EXTENSIONS,
            showImageCroppingArea: true,
            title: this.localization.getLocal('rota.fotosec'),
            sendText: this.localization.getLocal('rota.fotodegistir')
        }).then((file): void => {
            this.uploader.upload({
                url: this.securityConfig.avatarUploadUri,
                method: 'POST',
                data: { file: (file as ICroppedImageUploadResult).image }
            }).then((): void => {
                this.logger.toastr.success({ message: this.localization.getLocal('rota.fotodegistirildi') });
                this.$window.location.reload();
            });
        });
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
    //#endregion
}
//#endregion

//#region Injection
ShellController.$inject = ['$rootScope', '$scope', '$location', '$window', 'hotkeys', 'Upload', 'SecurityConfig', 'Routing', 'Config', 'Logger',
    'TitleBadges', 'Localization', 'Security', 'Dialogs', 'Caching', 'RouteConfig', 'Constants'];
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.shell', []);
module.controller('ShellController', ShellController);
//#endregion
