/*
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