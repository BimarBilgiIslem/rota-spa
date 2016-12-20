//#region Import
import { BaseConfig } from "../base/baseconfig";
import * as toastr from "toastr";
//#endregion

//#region RouteConfig
class LoggerConfig extends BaseConfig<ILoggerConfig> {
    constructor(constants: IConstants) {
        super();
        const config: ILoggerConfig = {}; //$Log service enabled
        //toastr common settings
        toastr.options.timeOut = constants.logger.TOASTR_TIMEOUT;
        toastr.options.positionClass = constants.logger.TOASTR_POSITION;
        //timeout durations
        config.timeOuts = {};
        config.timeOuts[LogType.Warn] = constants.logger.TOASTR_WARN_TIMEOUT;
        config.timeOuts[LogType.Error] = constants.logger.TOASTR_ERROR_TIMEOUT;
        config.timeOuts[LogType.Info] = constants.logger.TOASTR_INFO_TIMEOUT;
        config.timeOuts[LogType.Success] = constants.logger.TOASTR_SUCCESS_TIMEOUT;
        config.timeOuts[LogType.Debug] = constants.logger.TOASTR_DEBUG_TIMEOUT;
        config.defaultTitles = {};
        this.config = config;
    }
}
//#endregion

//#region Injection
LoggerConfig.$inject = ['Constants'];
//#endregion


//#region Register
var module: ng.IModule = angular.module('rota.services.log.config', []);
module.provider('LoggerConfig', LoggerConfig);
//#endregion

export { LoggerConfig }