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

//#region Imports
import "./security.config"
import OidcManager = require('config/oidc-manager')
//#endregion

//#region Security Service
class Security implements ISecurity {
    serviceName: 'Security Service';
    static injectionName = "Security";

    //#region Init
    constructor(
        private $window: ng.IWindowService,
        private $rootScope: IRotaRootScope,
        private $http: ng.IHttpService,
        public securityConfig: ISecurityConfig,
        private config: IMainConfig,
        private common: ICommon,
        private caching: ICaching,
        private logger: ILogger,
        public currentUser: IUser,
        public currentCompany: ICompany,
        public tokens: ITokens,
        private constants: IConstants) {
        //set current company
        this.setCurrentCompany();
    }
    //#endregion

    //#region Utils
    /**
     * Set company from UI
     * @param company Company to be selected
     */
    setCompany(company: ICompany): void {
        if (this.currentCompany && this.currentCompany.id === company.id) return;
        //store current company
        this.caching.sessionStorage.store<ICompany>(
            this.constants.security.STORAGE_NAME_CURRENT_COMPANY, company, false);
        //store map settings of company that is to be sent to the server in header meta
        this.caching.sessionStorage.store<RequestHeaders>(
            this.constants.security.STORAGE_NAME_REQUEST_HEADER_MAPS, this.config.requestHeaderMaps, false);
        //redirect to home page
        this.$window.location.replace("");
    }
    /**
     * Set current company
     */
    private setCurrentCompany(): void {
        let selectedCompany = null;
        const storedCompany = this.caching.sessionStorage
            .get<ICompany>(this.constants.security.STORAGE_NAME_CURRENT_COMPANY, null, false);

        const companyId = (storedCompany && this.common.isAssigned(storedCompany.id)) ? storedCompany.id : this.securityConfig.defaultCompanyId;
        if (this.common.isAssigned(companyId)) {
            selectedCompany = this.securityConfig.authorizedCompanies.findById(companyId);
        }

        if (!selectedCompany && this.securityConfig.authorizedCompanies && this.securityConfig.authorizedCompanies.length) {
            selectedCompany = this.securityConfig.authorizedCompanies[0];
        }
        angular.extend(this.currentCompany, selectedCompany);
    }
    //#endregion

    //#region UnAuthorized Methods
    /**
     * Clear crdentials and redirect to login page
     */
    handleUnAuthorized(): void {
        delete this.$http.defaults.headers.common['Authorization'];
        this.currentUser = null;
        //redirect to oip
        this.logOff();
    }
    /**
     * Logoff
     */
    logOff(): void {
        OidcManager.signOut();
    }
    //#endregion

    //#region Authorize Methods
    /**
     * Set currentuser value service and broadcast a loginchanged event
     * @param model Profile model
     */
    setCredentials(model: IProfileModel<IUser>): void {
        //set auth header for http adapter
        const header = 'Bearer ' + model.access_token;
        delete this.$http.defaults.headers.common['Authorization'];
        this.$http.defaults.headers.common['Authorization'] = header;
        //save tokens for internal usage
        this.tokens.idToken = model.id_token;
        this.tokens.accessToken = model.access_token;
        //combine user claims provided by OIC and server profile structure
        this.currentUser = angular.extend(
            this.currentUser,
            model.profile,
            this.securityConfig.userProfile
        );
        this.logger.console.log({ message: 'user logged-in as ' + model.profile.name, data: model.profile });
    }
    /**
     * Starts authorization phase
     */
    initSecurity(): void {
        if (!this.common.isNotEmptyObject(OidcManager.user)) {
            return this.handleUnAuthorized();
        }
        //Set auth header,currentUser
        this.setCredentials(OidcManager.user);
        //update user when silent renew occured
        OidcManager.userRenewed(user => {
            this.setCredentials(user);
        });
        //listen for loginRequired event to redirect to login page
        this.$rootScope.$on(this.config.eventNames.loginRequired,
            () => {
                this.handleUnAuthorized();
            });
    }
    //#endregion
}

//#region Injection
Security.$inject = ['$window', '$rootScope', '$http', 'SecurityConfig', 'Config', 'Common',
    'Caching', 'Logger', 'CurrentUser', 'CurrentCompany', 'Tokens', 'Constants'
];
//#endregion
//#endregion

//#region Register
const serviceModule: ng.IModule = angular.module('rota.services.security', ['rota.services.security.config']);
serviceModule
    .service(Security.injectionName, Security)
    .value('CurrentUser', {})
    .value('CurrentCompany', {})
    .value('Tokens', {});
//#endregion

//#region Initialize Security
serviceModule.run(['Security', 'Environment', (security: ISecurity, env: IGlobalEnvironment) => {
    if (!env.allowAnonymous)
        security.initSecurity();
}]);
//#endregion

export { Security }
