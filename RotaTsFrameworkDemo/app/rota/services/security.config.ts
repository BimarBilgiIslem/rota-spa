//#region Import
import { BaseConfig } from "../base/baseconfig";
//#endregion

//#region SecurityConfig
class SecurityConfigProvider extends BaseConfig<ISecurityConfig> {
    constructor(environments: IGlobalEnvironment, constants: IConstants) {
        super();
        const config: ISecurityConfig = {
            allowAnonymousAccess: environments.allowAnonymousAccess,
            logOffWhenIdleTimeout: environments.logOffWhenIdleTimeout,
            idleTimeout: constants.security.IDLE_TIMEOUT,
            idleLogoffCountDown: constants.security.COUNT_DOWN_FOR_IDLE_TIMEOUT,
            useFirstLetterAvatar: true
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