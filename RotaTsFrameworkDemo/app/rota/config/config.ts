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

//#region Imports
import { BaseConfig } from "../base/baseconfig";
import constants = require('config/constants');
import * as angular from "angular";
//#endregion

//#region Server configuration environment service
const module: ng.IModule = angular.module('rota.config', []);
//Get environment and make it constant to be available thru app
const env = window.__globalEnvironment;
if (env) {
    const _env = angular.copy<IGlobalEnvironment>(env);
    module.constant('Environment', _env);
} else {
    throw 'no server config found';
}
//#endregion

//#region Constants service
const constantsModule: ng.IModule = angular.module('rota.constants', []);
constantsModule.constant('Constants', constants);
//#endregion

//#region Config
class Config extends BaseConfig<IMainConfig> {
    constructor(environments: IGlobalEnvironment, constants: IConstants) {
        super();
        const config: IMainConfig = {
            //Main app settings
            appVersion: constants.APP_VERSION,
            appTitle: constants.APP_TITLE,
            debugMode: environments.debugging,
            host: this.getHostPath(location.protocol + "//" + location.host, environments.doms),
            logoImageName: constants.style.IMG_BASE_PATH + '/' + constants.DEFAULT_LOGO_IMAGE_NAME,
            favIconName: constants.style.IMG_BASE_PATH + '/' + constants.style.DEFAULT_FAVICON_NAME,
            warnFavIconName: constants.style.IMG_BASE_PATH + '/' + constants.style.WARNING_FAVICON_NAME,
            defaultApiPrefix: constants.server.DEFAULT_API_PREFIX,
            encodeStorageValues: !environments.debugging,
            enableMultiLanguage: true,
            supportedLanguages: [{
                code: constants.localization.DEFAULT_LANGUAGE,
                fullname: constants.localization.DEFAULT_LANGUAGE_DISPLAY_NAME
            }, {
                code: constants.localization.ENGLISH_LANGUAGE,
                fullname: constants.localization.ENGLISH_LANGUAGE_DISPLAY_NAME
            }],
            serverExceptionLoggingEnabled: false,
            pushServicePath: environments.pushServicePath,
            enableQuickMenu: true,
            datetimeFormat: {
                timeFormat: constants.localization.TIME_FORMAT,
                dateFormat: constants.localization.DATE_FORMAT,
                monthFormat: constants.localization.MONTH_FORMAT,
                yearFormat: constants.localization.YEAR_FORMAT,
                datePickerTimeMinStep: constants.localization.MIN_STEP,
                useTimeZoneOffSet: false
            },
            spinnerOptions: constants.controller.DEFAULT_SPINNER_OPTIONS,
            //Event names
            eventNames: {
                userLoginChanged: constants.events.EVENT_LOGIN_CHANGED,
                ajaxFinished: constants.events.EVENT_AJAX_FINISHED,
                ajaxStarted: constants.events.EVENT_AJAX_STARTED,
                loginRequired: constants.events.EVENT_LOGIN_REQIRED,
                modelLoaded: constants.events.EVENT_MODEL_LOADED
            },
            //Crud api action names
            crudActionNames: {
                delete: constants.server.ACTION_NAME_DELETE,
                getById: constants.server.ACTION_NAME_GET_BY_ID,
                getList: constants.server.ACTION_NAME_LIST,
                getPagedList: constants.server.ACTION_NAME_PAGED_LIST,
                save: constants.server.ACTION_NAME_SAVE,
                exportList: constants.server.ACTION_NAME_EXPORT_LIST
            },
            //Grid settings
            gridDefaultPageSize: constants.grid.GRID_DEFAULT_PAGE_SIZE,
            gridDefaultOptionsName: constants.grid.GRID_DEFAULT_OPTIONS_NAME,
            gridStandartFeatureList: constants.grid.GRID_STANDART_FEATURE_LIST,
            //Crud page stuffs
            autoSaveInterval: constants.controller.DEFAULT_AUTOSAVE_INTERVAL,
            postOnlyModelChanges: false,
            defaultFormName: constants.controller.DEFAULT_FORM_NAME,
            defaultNewItemParamValue: constants.controller.DEFAULT_NEW_ITEM_PARAM_VALUE,
            defaultNewItemParamName: constants.controller.DEFAULT_NEW_ITEM_PARAM_NAME,
            //Reportings
            reportViewerUrl: environments.reportViewerUrl,
            reportControllerUrl: environments.reportControllerUrl,
            //Dashborad
            dashboardOptions: {
                widgetLoadingTemplate: constants.dashboard.WIDGET_LOADING_TEMPLATE
            },
            //Max file upload size 
            maxFileUploadSize: "20MB",
            //default request headers
            requestHeaderMaps: {
                companyId: constants.server.HEADER_NAME_COMPANY_ID,
                roleId: constants.server.HEADER_NAME_ROLE_ID
            }
        };
        this.config = config;
    }
    /**
     * Extract dom key depending on provided doms in environments
     * @param host Current host
     * @param doms Defined host
     */
    private getHostPath(host: string, doms: IDictionary<string>): string {
        for (let dom in doms) {
            if (doms.hasOwnProperty(dom)) {
                if (doms[dom].toLowerCase() === host.toLowerCase()) {
                    return dom;
                }
            }
        }
        return null;
    }
}
//#endregion

//#region Injection
Config.$inject = ['Environment', 'Constants'];
//#endregion

//#region Register
module.provider('Config', Config);
//#endregion

export { Config }
