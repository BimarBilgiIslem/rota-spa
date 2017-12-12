﻿/*
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

//#region Profile Controller

/**
 * Profile controller 
 */
class ProfileController {
    /**
     * Links
     */
    helpLink?: string;
    profileLink?: string;
    //#region Init
    constructor(private $rootScope: IRotaRootScope,
        private $location: ng.ILocationService,
        private $window: ng.IWindowService,
        protected routing: IRouting,
        private config: IMainConfig,
        private dialogs: IDialogs,
        private constants: IConstants,
        private currentUser: IUser,
        private currentCompany: ICompany,
        private routeconfig: IRouteConfig,
        private security: ISecurity,
        private securityconfig: ISecurityConfig,
        private uploader: ng.angularFileUpload.IUploadService,
        private logger: ILogger,
        private localization: ILocalization,
        private hotkey: ng.hotkeys.HotkeysProvider,
        private common: ICommon) {
        //format user link
        if (config.profileLinkUri) {
            this.profileLink = encodeURI(common.format(config.profileLinkUri, this.currentUser));
        }
    }
    //#endregion

    //#region Methods
    /**
    * Change company
    * @param company Currently selected company 
    */
    setCompany(company: ICompany): void {
        this.security.setCompany(company);
    }
    /**
    * Change profile picture
    */
    changeAvatar(): void {
        if (!this.securityconfig.avatarUploadUri)
            throw new Error(this.constants.errors.NO_AVATAR_URI_PROVIDED);

        //format uri interpolated with currentUser
        const uri = this.common.format(this.securityconfig.avatarUploadUri, this.currentUser);
        this.dialogs.showFileUpload({
            allowedExtensions: this.constants.controller.ALLOWED_AVATAR_EXTENSIONS,
            showImageCroppingArea: true,
            title: this.localization.getLocal('rota.fotosec'),
            sendText: this.localization.getLocal('rota.fotodegistir')
        }).then((file): void => {
            this.uploader.upload({
                url: uri,
                method: 'POST',
                data: { file: (file as ICroppedImageUploadResult).image }
            }).then((): void => {
                this.logger.toastr.success({ message: this.localization.getLocal('rota.fotodegistirildi') });
                this.routing.reloadBrowser();
            });
        }, () => {
            this.logger.toastr.error({ message: this.localization.getLocal("rota.fotodegistirhata") });
        });
    }
    /**
     * Show feedback form
     */
    showFeedBackForm(): void {
        this.dialogs.showModal({
            bindToController: false,
            controllerAs: null,
            windowClass: 'feedback-form',
            sideBarPosition: "left",
            isSideBar: true,
            absoluteTemplateUrl: this.routeconfig.templates.feedback,
            controller: [
                '$scope', '$http', '$uibModalInstance', 'Config', 'Logger', 'Localization', 'CurrentUser',
                ($scope: IFeedBackScope, $http: ng.IHttpService, $uibModalInstance: ng.ui.bootstrap.IModalServiceInstance,
                    config: IMainConfig, logger: ILogger, localization: ILocalization, user: IUser) => {
                    $scope.model = {}
                    $scope.submit = () => {
                        $scope.responseInProcess = true;
                        $http.post(config.feedBackProviderUrl,
                            {
                                message: $scope.model.message,
                                rate: $scope.model.rate,
                                username: user.name,
                                userid: user.id,
                                email: user.email
                            }, <IRequestOptions>{ showSpinner: false }).then(() => {
                                logger.notification.info({
                                    autoHideDelay: 3500,
                                    notificationLayout: NotificationLayout.Top,
                                    message: localization.getLocal('rota.geribildirimbasarili')
                                });
                                $uibModalInstance.close();
                            },
                            () => {
                                logger.toastr.error({
                                    message: localization.getLocal('rota.geribildirimhata')
                                });
                            }).finally(() => {
                                $scope.responseInProcess = false;
                            });
                    }
                }
            ]
        });
    }
    /**
     * Go to help link if helpLinkUri provided
     */
    goToHelpLink(): void {
        const helpUri = encodeURI(this.common.format(this.config.helpLinkUri, this.routing.activeMenu));
        location.replace(helpUri);
    }
    /**
     * Logoff
     */
    logOff(): void {
        this.dialogs.showConfirm({
            message: this.localization.getLocal('rota.cikisonay'),
            okText: this.localization.getLocal('rota.cikis')
        }).then((): void => {
            this.security.logOff();
        });
    }
    /**
     * Change current language
     * @param $event Event
     * @param lang Language to be changed to
     */
    changeLanguage(lang: ILanguage): void {
        this.localization.currentLanguage = lang;
    }
    /**
     * Toggle cheatsheet
     * @returns {} 
     */
    toggleCheatSheet(): void {
        this.hotkey.toggleCheatSheet();
    }
    //#endregion
}

//#region Injection
ProfileController.$inject = ['$rootScope', '$location', '$window', 'Routing', 'Config',
    'Dialogs', 'Constants', 'CurrentUser', 'CurrentCompany', 'RouteConfig',
    'Security', 'SecurityConfig', 'Upload', 'Logger', 'Localization', 'hotkeys', 'Common'];
//#endregion

//#endregion

//#region Profile Controller for Modal 
class ProfileModalController extends ProfileController {
    //#region Props
    currentMenus: INavMenuItem[];
    parentMenu: INavMenuItem;
    //this flag to prevent animation of ngRepeat on initial render
    initiated: boolean;
    //#endregion

    //#region Init
    constructor($rootScope: IRotaRootScope,
        $location: ng.ILocationService,
        $window: ng.IWindowService,
        routing: IRouting,
        config: IMainConfig,
        dialogs: IDialogs,
        constants: IConstants,
        currentUser: IUser,
        currentCompany: ICompany,
        routeconfig: IRouteConfig,
        security: ISecurity,
        securityconfig: ISecurityConfig,
        uploader: ng.angularFileUpload.IUploadService,
        logger: ILogger,
        localization: ILocalization,
        hotkey: ng.hotkeys.HotkeysProvider,
        common: ICommon,
        private $modalInstance: ng.ui.bootstrap.IModalServiceInstance) {
        super($rootScope, $location, $window, routing, config, dialogs, constants,
            currentUser, currentCompany, routeconfig, security, securityconfig,
            uploader, logger, localization, hotkey, common);
        //init menus
        this.currentMenus = routing.navMenus;
        this.initiated = true;
    }
    //#endregion

    //#region Methods
    close(): void {
        this.$modalInstance.dismiss();
    }
    /**
     * Change nested menus
     * @param menu Parent menu to be actiavted
     */
    displayNextLevel(menu: INavMenuItem): void {
        if (!menu) {
            this.currentMenus = this.routing.navMenus;
            this.parentMenu = null;
            return;
        }

        if (menu.subtree && menu.subtree.length) {
            this.currentMenus = menu.subtree;
            this.parentMenu = menu;
        } else {
            this.$modalInstance.dismiss();
        }
    }
    //#endregion
}

//#region Injection
ProfileModalController.$inject = ProfileController.$inject.concat('$uibModalInstance');
//#endregion

//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.shell.profile', []);
module.controller('ProfileController', ProfileController)
    .controller('ProfileModalController', ProfileModalController);
//#endregion
