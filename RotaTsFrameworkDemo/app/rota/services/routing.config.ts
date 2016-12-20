//#region Import
import { BaseConfig } from "../base/baseconfig";
//#endregion

//#region RouteConfig
class RouteConfigProvider extends BaseConfig<IRouteConfig> {
    constructor(constants: IConstants) {
        super();
        const config: IRouteConfig = {};
        config.shellPath = constants.routing.SHELL_PATH;
        config.error404StateUrl = window.require.toUrl(config.shellPath + constants.routing.NOT_FOUND_HTML_NAME);
        config.error500StateUrl = window.require.toUrl(config.shellPath + constants.routing.INTERNAL_ERROR_HTML_NAME);
        config.inactiveStateUrl = '/';
        config.contentControllerAlias = constants.routing.CONTROLLER_ALIAS_NAME;
        config.shellControllerAlias = constants.routing.SHELL_CONTROLLER_ALIAS_NAME;
        this.config = config;
    }
}
//#endregion

//#region Injection
RouteConfigProvider.$inject = ['Constants'];
//#endregion


//#region Register
var module: ng.IModule = angular.module('rota.services.routing.config', []);
module.provider('RouteConfig', RouteConfigProvider);
//#endregion

export { RouteConfigProvider }