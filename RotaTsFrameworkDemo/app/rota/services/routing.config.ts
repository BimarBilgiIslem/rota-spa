//#region Import
import { BaseConfig } from "../base/baseconfig";
import * as _ from "underscore";
//#endregion

//#region RouteConfig
class RouteConfigProvider extends BaseConfig<IRouteConfig> {
    constructor(constants: IConstants) {
        super();
        const config: IRouteConfig = {};
        config.templates = _.mapObject<ITemplates>(constants.routing.TEMPLATES, filename => {
            return window.require.toUrl(constants.routing.SHELL_PATH + filename);
        });
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