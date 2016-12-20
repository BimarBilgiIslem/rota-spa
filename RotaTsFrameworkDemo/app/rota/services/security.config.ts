//#region Import
import { BaseConfig } from "../base/baseconfig";
//#endregion

//#region SecurityConfig
class SecurityConfigProvider extends BaseConfig<ISecurityConfig> {
    constructor(environments: IGlobalEnvironment, constants: IConstants) {
        super();
        const config: ISecurityConfig = {
            tokenStorageName: constants.security.STORAGE_NAME_AUTH_TOKEN,
            stateTempStorageName: constants.security.STORAGE_NAME_TEMP_STATE,
            redirectUri: window.location.protocol + "//" + window.location.host + constants.security.REDIRECT_URI_PATH,
            postLogoutRedirectUri: window.location.protocol + "//" + window.location.host,
            responseType: constants.security.DEFAULT_ROTA_RESPONSE_TYPE,
            scope: '',
            loadUserProfile: false,
            filterProtocolClaims: true,
            clientId: environments.clientId,
            authority: environments.authority,
            allowAnonymousAccess: environments.allowAnonymousAccess,
            antiForgeryTokenEnabled: environments.antiForgeryTokenEnabled,
            antiForgeryTokenUrl: constants.server.ACTION_NAME_ANTI_FORGERY_TOKEN,
            antiForgeryTokenHeaderName: constants.server.HEADER_NAME_ANTI_FORGERY_TOKEN
        }
        this.config = config;
    }
}
//#endregion

//#region Injection
SecurityConfigProvider.$inject = ['Environment', 'Constants'];
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.security.config', []);
module.provider('SecurityConfig', SecurityConfigProvider);
//#endregion

export { SecurityConfigProvider }