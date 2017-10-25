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
import * as _ from "underscore";
//#endregion

//#region RouteConfig
class RouteConfigProvider extends BaseConfig<IRouteConfig> {
    constructor(constants: IConstants) {
        super();
        const config: IRouteConfig = {};
        config.templates = _.mapObject<string>(constants.routing.TEMPLATES, filename => {
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