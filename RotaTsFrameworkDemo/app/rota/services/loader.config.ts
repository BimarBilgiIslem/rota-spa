import { BaseConfig } from "../base/baseconfig";
//#region RouteConfig
class LoaderConfig extends BaseConfig<ILoaderConfig> {
    constructor() {
        super();
        //set default values
        var config: ILoaderConfig = {};
        config.useBaseUrl =
            config.useTemplateUrlPath = true;
        this.config = config;
    }
}
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.loader.config', []);
module.provider('LoaderConfig', LoaderConfig);
//#endregion

export {LoaderConfig}