//#region Imports
import "./security.config"
//#endregion

//#region JWTHelper
/**
 * JWT helper service
 */
class JwtHelper implements IJWTHelper {
    //#region Props
    metadata: IOpenIdMetaData;
    authendpoint: string;
    jwks: IJwks;
    authority: string;
    //#endregion

    //#region Init
    constructor(private $http: ng.IHttpService,
        private $q: ng.IQService,
        private securityConfig: ISecurityConfig,
        private logger: ILogger,
        private common: ICommon,
        private constants: IConstants) {

        this.metadata = null;
        this.authendpoint = null;
        this.jwks = null;
        this.authority = securityConfig.authority;

        if (this.authority && this.authority.indexOf(constants.security.AUTHORITY_PART) < 0) {
            if (this.authority[this.authority.length - 1] !== '/') {
                this.authority += '/';
            }
            this.authority += constants.security.AUTHORITY_PART;
            this.logger.console.info({ message: 'authority is set to ' + this.authority });
        } else {
            this.logger.console.error({ message: 'authority is not defined' });
        }
    }

    //#endregion

    //#region Methods
    /**
    * Shortcut way of rejection promise
    * @param cause Reason
    * @returns {ng.IPromise<string>} 
    */
    reject(cause?: string): ng.IPromise<string> {
        return this.common.rejectedPromise(cause);
    }
    /**
   * Load metadata information using authority 
   * @returns {ng.IPromise<IOpenIdMetaData>}
   */
    loadMetadata(): ng.IPromise<IOpenIdMetaData | string> {
        this.logger.console.log({ message: 'getting metadata' });

        if (!this.common.isAssigned(this.authority)) {
            return this.reject("no authority configured");
        }

        if (this.common.isAssigned(this.metadata)) {
            return this.common.promise(this.metadata);
        }

        return this.$http.get(this.authority).then((response: IBaseServerResponse<IOpenIdMetaData>): IOpenIdMetaData => {
            return this.metadata = response.data;
        });
    }
    /**
   * Gets authorization endpoint uri using metadata
   * @returns {ng.IPromise<string>} 
   */
    loadAuthorizationEndpoint(): ng.IPromise<string> {
        this.logger.console.log({ message: 'loading autorization endpoint' });

        if (this.common.isAssigned(this.authendpoint)) {
            return this.common.promise(this.authendpoint);
        }

        return this.loadMetadata().then((metadata: IOpenIdMetaData): string | ng.IPromise<string> => {
            if (!this.common.isAssigned(metadata.authorization_endpoint)) {
                return this.reject("metadata does not contain authorization_endpoint");
            }
            return this.authendpoint = metadata.authorization_endpoint;
        });
    }
    /**
   * Load user profile using profile end point in case loadUserProfile flag is true
   * @param accessToken Access Token
   * @returns {ng.IPromise<IUser>}
   */
    loadUserProfile(accessToken: string): ng.IPromise<IUser | string> {
        return this.loadMetadata().then((metadata: IOpenIdMetaData): any => {
            if (!this.common.isAssigned(metadata.userinfo_endpoint)) {
                return this.reject("Metadata does not contain userinfo_endpoint");
            }

            return this.$http({
                headers: { 'Authorization': 'Bearer ' + accessToken },
                method: 'GET',
                url: metadata.userinfo_endpoint
            }).then((response: ng.IHttpPromiseCallbackArg<IUser>) => response.data);
        });
    }
    /**
    * Create Logout request using metadata
    * @param idTokenHint Id Token
    * @returns {ng.IPromise<string>}
    */
    createLogoutRequest(idTokenHint: string): ng.IPromise<string> {
        return this.loadMetadata().then((metadata: IOpenIdMetaData): string | ng.IPromise<string> => {
            if (!this.common.isAssigned(metadata.end_session_endpoint)) {
                return this.reject('no end_session_endpoint in metadata');
            }

            let url = metadata.end_session_endpoint;
            if (idTokenHint && this.securityConfig.postLogoutRedirectUri) {
                url += "?post_logout_redirect_uri=" + encodeURIComponent(this.securityConfig.postLogoutRedirectUri);
                url += "&id_token_hint=" + encodeURIComponent(idTokenHint);
            }
            return url;
        });
    }
    /**
   * Get signing key using metadata
   * @returns {ng.IPromise<string>}
   */
    loadX509SigningKey(): ng.IPromise<string> {

        const parseKeys = (jwks: IJwks): ng.IPromise<string> => {
            if (!jwks.keys || !jwks.keys.length) {
                return this.reject("signing keys empty");
            }

            var key = jwks.keys[0];
            if (key.kty !== "RSA") {
                return this.reject("signing key not RSA");
            }

            if (!key.x5c || !key.x5c.length) {
                return this.reject("RSA keys empty");
            }

            return this.common.promise(key.x5c[0]);
        }

        if (this.common.isAssigned(this.jwks)) {
            return parseKeys(this.jwks);
        }

        return this.loadMetadata().then((metadata: IOpenIdMetaData): ng.IPromise<string> => {
            if (!this.common.isAssigned(metadata.jwks_uri)) {
                return this.reject("metadata does not contain jwks_uri");
            }

            return this.$http.get(metadata.jwks_uri).then((response: IBaseServerResponse<IJwks>) => {
                this.jwks = response.data;
                return parseKeys(response.data);
            }, (err: IServerFailedResponseData): ng.IPromise<string> => {
                return this.reject("Failed to load signing keys (" + err.message + ")");
            });
        });
    }
    /**
    * Validate Id Token comparing state,nonce etc..
    * @param idToken Id Token
    * @param nonce Nonce - Number once
    * @returns {ng.IPromise<IClaims>}
    */
    validateIdToken(idToken: string, nonce: string): ng.IPromise<IClaims | string> {
        return this.loadX509SigningKey().then((cert: string): any => {
            const jws = new KJUR.jws.JWS();

            if (jws.verifyJWSByPemX509Cert(idToken, cert)) {
                const idTokenContents = JSON.parse(jws.parsedJWS.payloadS);

                if (nonce !== idTokenContents.nonce) {
                    return this.reject("Invalid nonce");
                }

                return this.loadMetadata().then((metadata: IOpenIdMetaData): ng.IPromise<any> => {
                    if (idTokenContents.iss !== metadata.issuer) {
                        return this.reject("Invalid issuer");
                    }

                    if (idTokenContents.aud !== this.securityConfig.clientId) {
                        return this.reject("Invalid audience");
                    }

                    var now = Math.round(Date.now() / 1000);

                    var diff = now - idTokenContents.iat;
                    if (diff > (5 * 60)) {
                        return this.reject("Token issued too long ago");
                    }

                    if (idTokenContents.exp < now) {
                        return this.reject("Token expired");
                    }
                    return this.common.promise(idTokenContents);
                });

            } else {
                return this.reject("JWT failed to validate");
            }
        });
    }
    /**
     * Filters claims using openIdBuiltInClaims
     * @param claims All Claims
     * @returns {IUser} 
     */
    filterProtocolClaims(claims: any): IUser {
        this.constants.security.OPEN_ID_BUILTIN_CLAIMS.forEach(claim => {
            delete claims[claim];
        });
        return claims;
    }

    //#endregion
}
//#endregion

//#region Security Service
class Security implements ISecurity {
    serviceName: 'Security Service';
    //#region Props
    private expiresAt: number;

    initPromise: ng.IPromise<IProfileModel<IUser> | string>;
    /**
     * Authorization flag
     * @returns {boolean} 
     */
    get isAuthenticated(): boolean {
        return !_.isEmpty(this.currentUser) && !this.expired;
    }
    /**
     * Returns true if id token expired
     * @returns {boolean} 
     */
    get expired(): boolean {
        const now = Math.round(Date.now() / 1000);
        return this.expiresAt < now;
    }
    /**
     * Returns time span for expiration
     * @returns {} 
     */
    get expiresIn(): number {
        const now = Math.round(Date.now() / 1000);
        return this.expiresAt - now;
    }
    //#endregion

    //#region Init
    constructor(private $rootScope: IRotaRootScope,
        private $http: ng.IHttpService,
        private $q: ng.IQService,
        public securityConfig: ISecurityConfig,
        private config: IMainConfig,
        private common: ICommon,
        private localization: ILocalization,
        private caching: ICaching,
        private logger: ILogger,
        private jwthelper: IJWTHelper,
        public currentUser: IUser,
        public currentCompany: ICompany,
        public tokens: ITokens,
        private constants: IConstants) {

        this.expiresAt = Math.round(Date.now() - 1 / 1000);
        /**
         * Listen for loginRequired event to redirect to login page
         */
        $rootScope.$on(config.eventNames.loginRequired, () => {
            this.handleUnAuthorized();
        });
        //set current company
        this.setCurrenyCompany();
    }
    //#endregion

    //#region Utils
    /**
     * Set current company
     */
    setCurrenyCompany(): void {
        let selectedCompany = null;
        const companyId = this.caching.sessionStorage.get(this.constants.security.STORAGE_NAME_COMPANY_ID)
            || this.securityConfig.defaultCompanyId;

        if (this.common.isAssigned(companyId)) {
            selectedCompany = _.findWhere(this.securityConfig.authorizedCompanies, { id: companyId });
        }

        if (!selectedCompany && this.securityConfig.authorizedCompanies && this.securityConfig.authorizedCompanies.length) {
            selectedCompany = this.securityConfig.authorizedCompanies[0];
        }
        angular.extend(this.currentCompany, selectedCompany);
    }
    /**
     * Shortcut way of rejecting promise
     * @param cause Reason
     */
    reject(cause?: string): ng.IPromise<string> {
        return this.common.rejectedPromise(cause);
    }
    /**
    * Used by routing service to show view
    * @param state  State obj
    * @description if promise resolved,state is authenticated
    * @returns {ng.IPromise<any>}
    */
    isStateAuthenticated(state: IRotaState): ng.IPromise<any> {
        const d = this.$q.defer();
        if (!this.securityConfig.allowAnonymousAccess) {
            this.initPromise.then(() => {
                if (this.isAuthenticated) {
                    d.resolve();
                } else {
                    d.reject();
                }
            });
        } else {
            d.resolve();
        }
        return d.promise;
    }
    //#endregion

    //#region UnAuthorized Methods
    /**
     * Clear all cache and headers
     */
    clearCredentials(): void {
        this.logger.console.warn({ message: 'All authorization token and user info cleared' });
        this.caching.localStorage.remove(this.securityConfig.tokenStorageName);
        delete this.$http.defaults.headers.common['Authorization'];
        this.currentUser = null;
    }
    /**
     * Clear crdentials and redirect to login page
     */
    handleUnAuthorized(): ng.IPromise<any> {
        this.clearCredentials();
        return this.createTokenRequest().then((request) => {
            this.caching.sessionStorage.store(this.securityConfig.stateTempStorageName, request.settings);
            window.location.href = request.url;
        });
    }
    /**
     * Logoff
     */
    logOff(): ng.IPromise<any> {
        //Request logout endpoint
        return this.jwthelper.createLogoutRequest(this.tokens.idToken).then(url => {
            //Clear token 
            this.clearCredentials();
            //Go logout
            window.location.href = url;
        });
    }
    //#endregion

    //#region Token Methods
    /**
     * Get token from storage and initiate authorization
     */
    initToken(): ng.IPromise<IProfileModel<IUser> | string> {
        const storageName = this.securityConfig.tokenStorageName;
        const tokenModel = this.caching.sessionStorage.get<ITokenModel>(storageName);

        if (this.common.isNotEmptyObject(tokenModel)) {
            this.caching.sessionStorage.remove(storageName);

            return this.handleUserModel(tokenModel).then(profile => {
                const model: IProfileModel<IUser> = {
                    profile: profile,
                    id_token: tokenModel.id_token,
                    access_token: tokenModel.access_token,
                    expires_in: tokenModel.expires_in
                };

                this.caching.localStorage.store(storageName, model);
                return model;
            });
        }
        const profileModel = this.caching.localStorage.get<IProfileModel<IUser>>(storageName);

        if (this.common.isNotEmptyObject(profileModel)) {
            return this.common.promise(profileModel);
        }
        return this.reject();
    }
    /**
     * Generate token request uri using metadata
     */
    createTokenRequest(): ng.IPromise<ITokenRequest> {
        this.logger.console.log({ message: "Creating token request" });
        var self = this;
        //Meta bilgisinden auth endposint bilgisini al
        return this.jwthelper.loadAuthorizationEndpoint().then(authorizationEndpoint => {
            //Redirect Uri & State
            const state = this.common.getRandomNumber();
            const nonce = this.common.getRandomNumber();
            //Url parts
            const settings = {
                state: state,
                nonce: nonce,
                client_id: self.securityConfig.clientId,
                response_type: self.securityConfig.responseType,
                redirect_uri: self.securityConfig.redirectUri,
                scope: `${this.constants.security.DEFAULT_ROTA_SCOPES} ${this.securityConfig.scope}`
            };

            let url = authorizationEndpoint + '?';
            for (let key in settings) {
                if (settings.hasOwnProperty(key)) {
                    url += `${key}=${encodeURIComponent(settings[key])}&`;
                }
            }

            return {
                settings: {
                    nonce: nonce,
                    state: state
                },
                url: url
            };
        });
    }
    /**
     * Validates id token 
     * @param model Token Model
     */
    checkToken(model: ITokenModel): ng.IPromise<IClaims | string> {
        //Get state to compare
        const requestSettings = this.caching.sessionStorage.get<ITempSessionData>(this.securityConfig.stateTempStorageName);
        this.caching.sessionStorage.remove(this.securityConfig.stateTempStorageName);
        //Kontroller
        if (!requestSettings) {
            return this.reject("No request state loaded");
        }
        if (!requestSettings.state) {
            return this.reject("No state loaded");
        }
        if (model.state !== requestSettings.state) {
            return this.reject("Invalid state");
        }

        if (!requestSettings.nonce) {
            return this.reject("No nonce loaded");
        }

        if (!model.id_token) {
            return this.reject("No identity token");
        }

        if (!model.access_token) {
            return this.reject("No access token");
        }
        //Validate JWT open_id token and return claims
        return this.jwthelper.validateIdToken(model.id_token, requestSettings.nonce);
    }
    /**
    * Request token from which defined in security config
    * @returns {} 
    */
    getAntiForgeryToken(state: IRotaState): ng.IPromise<string> {
        const d = this.$q.defer();
        if (this.common.isAssigned(this.securityConfig.antiForgeryTokenUrl)) {
            this.isStateAuthenticated(state)
                .then(() => {
                    this.$http.get(this.securityConfig.antiForgeryTokenUrl)
                        .then((args: ng.IHttpPromiseCallbackArg<string>) => {
                            d.resolve(this.tokens.antiForgeryToken = args.data);
                        });
                }, () => {
                    d.reject();
                });
        } else {
            throw new Error(this.constants.errors.NO_ANTIFORGERY_TOKEN_URL_DEFINED);
        }
        return d.promise;
    }
    //#endregion

    //#region Authorize Methods
    /**
     * Set request Authorization
     * @param accessToken Token
     */
    setAuthHeader(accessToken: string): void {
        const header = 'Bearer ' + accessToken;
        delete this.$http.defaults.headers.common['Authorization'];
        this.$http.defaults.headers.common['Authorization'] = header;
    }
    /**
     * Set currentuser value service and broadcast a loginchanged event
     * @param model Profile model
     */
    setCredentials(model: IProfileModel<IUser>): IUser {
        //Authentication icin request header bilgisine token'i ekle
        this.setAuthHeader(model.access_token);
        //Log 
        this.logger.console.log({ message: 'user logged-in as ' + model.profile.name, data: model.profile });
        //currentUser servisini set edip claims bilgilerini donduruyorz
        //Combine user claims provided by OIC and server profile structure
        this.currentUser = angular.extend(
            this.currentUser,
            model.profile,
            this.securityConfig.userProfile
        );
        //Kullanici login oldugunda event firlat
        this.$rootScope.$broadcast(this.config.eventNames.userLoginChanged, this.currentUser);
        return this.currentUser;
    }
    /**
     * Check model validation and filter builtIn claims
     * @param model Token Model
     */
    handleUserModel(model: ITokenModel): ng.IPromise<IUser> {
        return this.checkToken(model).then(claims => {
            //Filter protocal claims
            var userClaims = this.jwthelper.filterProtocolClaims(claims);

            if (this.securityConfig.loadUserProfile) {
                return this.jwthelper.loadUserProfile(model.access_token).then(
                    profileClaims => angular.extend(userClaims || {}, profileClaims));
            } else {
                return userClaims;
            }
        });
    }
    /**
     * Set interval for checking expiration of id token
     * @param expIn Time span
     */
    configExpire(expIn: number): void {
        //Set expireAt
        const now = Math.round(Date.now() / 1000);
        this.expiresAt = now + Math.round(expIn);
        //Automatic expire
        if (expIn) {
            var handle = window.setTimeout(() => {
                window.clearTimeout(handle);
                handle = null;
                //Request auth endpoint
                this.handleUnAuthorized();
            }, Math.round(expIn) * 1000);
        }
    }
    /**
     * Starts authorization phase
     */
    initSecurity(): ng.IPromise<IProfileModel<IUser> | string> {
        return this.initToken().then((tokenModel: IProfileModel<IUser>) => {
            //Save Id token for logout
            this.tokens.idToken = tokenModel.id_token;
            this.tokens.accessToken = tokenModel.access_token;
            //Access_token bitiş suresi set et
            this.configExpire(tokenModel.expires_in);
            //Set auth header,currentUser
            this.setCredentials(tokenModel);
            //Sonuc model
            return tokenModel;
        }, (error: any) => {
            if (this.common.isString(error)) {
                this.logger.console.error({ message: error });
            }
            this.handleUnAuthorized();
            return this.reject();
        });
    }
    //#endregion
}

//#region Injection
JwtHelper.$inject = ['$http', '$q', 'SecurityConfig', 'Logger', 'Common', 'Constants'];

Security.$inject = ['$rootScope', '$http', '$q', 'SecurityConfig', 'Config', 'Common', 'Localization',
    'Caching', 'Logger', 'JWTHelper', 'CurrentUser', 'CurrentCompany', 'Tokens', 'Constants'
];
//#endregion
//#endregion

//#region Register
const serviceModule: ng.IModule = angular.module('rota.services.security', ['rota.services.security.config']);
serviceModule
    .service('JWTHelper', JwtHelper)
    .service('Security', Security)
    .value('CurrentUser', {})
    .value('CurrentCompany', {})
    .value('Tokens', {});
//#endregion

//#region Initialize Security
serviceModule.run(['Security', 'SecurityConfig', 'Logger', (security: ISecurity, securityconfig: ISecurityConfig, logger: ILogger) => {
    //Log
    logger.console.warn({
        message: `Security is initiated with AllowAnonymousAccess ${securityconfig.allowAnonymousAccess ? 'true' : 'false'},antiForgeryTokenEnabled ${securityconfig.antiForgeryTokenEnabled ? 'true' : 'false'}`
    });
    //Eger allowAnonymousAccess e izin verilmiyorsa 
    if (!securityconfig.allowAnonymousAccess) {
        //Bir onceki session'dan eger varsa kullanici bilgilerini yukle
        security.initPromise = security.initSecurity();
    }
}]);
//#endregion

export { Security }
