﻿/*
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
//#endregion

//#region SecurityConfig
class SecurityConfigProvider extends BaseConfig<ISecurityConfig> {
    static injectionName = "SecurityConfig";

    constructor(environments: IGlobalEnvironment, constants: IConstants) {
        super();
        const config: ISecurityConfig = {
            logOffWhenIdleTimeout: environments.logOffWhenIdleTimeout === undefined ? true : environments.logOffWhenIdleTimeout,
            idleTimeout: constants.security.IDLE_TIMEOUT,
            idleLogoffCountDown: constants.security.COUNT_DOWN_FOR_IDLE_TIMEOUT,
            useFirstLetterAvatar: true,
            avatarFetchType: AvatarFetchType.GetRequest,
            accessTokenQueryStringName: constants.security.ACCESS_TOKEN_QUERY_STRING_NAME
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
module.provider(SecurityConfigProvider.injectionName, SecurityConfigProvider);
//#endregion

export { SecurityConfigProvider }