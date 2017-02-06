//#region Imports
import { BaseConfig } from "../base/baseconfig";
import * as angular from "angular";
//#endregion

//#region Server Configuration Environtment
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

//#region Config
class Config extends BaseConfig<IMainConfig> {
    constructor(environments: IGlobalEnvironment, constants: IConstants) {
        super();
        const config: IMainConfig = {
            //Main app settings
            appVersion: constants.APP_VERSION,
            appTitle: constants.APP_TITLE,
            debugMode: environments.debugging,
            logoImageName: constants.DEFAULT_LOGO_IMAGE_NAME,
            defaultApiPrefix: constants.server.DEFAULT_API_PREFIX,
            supportedLanguages: [{ code: 'tr-tr', fullname: 'Türkçe' }, { code: 'en-us', fullname: 'English' }],
            serverExceptionLoggingEnabled: false,
            showCompanyName: true,
            pushServicePath: environments.pushServicePath,
            datetimeFormat: {
                timeFormat: constants.localization.TIME_FORMAT,
                dateFormat: constants.localization.DATE_FORMAT,
                monthFormat: constants.localization.MONTH_FORMAT,
                yearFormat: constants.localization.YEAR_FORMAT,
                datePickerTimeMinStep: constants.localization.MIN_STEP
            },
            //Event names
            eventNames: {
                userLoginChanged: constants.events.EVENT_LOGIN_CHANGED,
                ajaxFinished: constants.events.EVENT_AJAX_FINISHED,
                ajaxStarted: constants.events.EVENT_AJAX_STARTED,
                loginRequired: constants.events.EVENT_LOGIN_REQIRED,
                menuChanged: constants.events.EVENT_MENU_CHANGED,
                modelLoaded: constants.events.EVENT_MODEL_LOADED
            },
            //Crud api action names
            crudActionNames: {
                delete: constants.server.ACTION_NAME_DELETE,
                getById: constants.server.ACTION_NAME_GET_BY_ID,
                getList: constants.server.ACTION_NAME_LIST,
                getPagedList: constants.server.ACTION_NAME_PAGED_LIST,
                save: constants.server.ACTION_NAME_SAVE
            },
            //Grid settings
            gridDefaultPageSize: constants.grid.GRID_DEFAULT_PAGE_SIZE,
            gridDefaultOptionsName: constants.grid.GRID_DEFAULT_OPTIONS_NAME,
            gridFullFeatureList: constants.grid.GRID_FULL_FEATUTE_LIST,
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
            dashboardSettings: {
                widgetLoadingTemplate: constants.dashboard.WIDGET_LOADING_TEMPLATE
            }
        };
        this.config = config;
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
