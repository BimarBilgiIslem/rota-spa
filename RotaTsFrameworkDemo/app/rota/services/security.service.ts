//#region Imports
import "./security.config"
import OidcManager = require('config/oidc-manager')
//#endregion

//#region Security Service
class Security implements ISecurity {
    serviceName: 'Security Service';

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
        this.$rootScope.$broadcast(this.constants.events.EVENT_COMPANY_CHANGED, company);
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
     * Set current company
     */
    private setCurrentCompany(): void {
        let selectedCompany = null;
        const storedCompany = this.caching.sessionStorage
            .get<IStorageCurrentCompany>(this.constants.security.STORAGE_NAME_CURRENT_COMPANY);

        const companyId = (storedCompany && storedCompany.id) || this.securityConfig.defaultCompanyId;

        if (this.common.isAssigned(companyId)) {
            selectedCompany = _.findWhere(this.securityConfig.authorizedCompanies, { id: companyId });
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
        OidcManager.instance.signinRedirect();
    }
    /**
     * Logoff
     */
    logOff(): void {
        OidcManager.instance.signoutRedirect();
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
        OidcManager.instance.events.addUserLoaded(user => {
            this.$rootScope.$apply(() => {
                this.setCredentials(user);
            });
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
    .service('Security', Security)
    .value('CurrentUser', {})
    .value('CurrentCompany', {})
    .value('Tokens', {});
//#endregion

//#region Initialize Security
serviceModule.run(['Security', 'SecurityConfig', 'Logger', (security: ISecurity, securityconfig: ISecurityConfig, logger: ILogger) => {
    //Log
    logger.console.warn({
        message: `Security is initiated with AllowAnonymousAccess ${securityconfig.allowAnonymousAccess ? 'true' : 'false'}`
    });

    if (!securityconfig.allowAnonymousAccess) {
        security.initSecurity();
    }
}]);
//#endregion

export { Security }
