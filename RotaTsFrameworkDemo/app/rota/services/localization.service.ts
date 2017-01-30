//#region Imports
//deps - resource files
import * as rotaresource from 'i18n!rota-resources/nls/resources';
import * as appresource from 'i18n!app-resources/nls/resources';
//moment localization
import 'i18n!rota-resources/nls/moment-lang';
//#endregion

//#region Localization Service
class Localization implements ILocalization {
    //#region Props
    serviceName = "Localization Service";

    private _currentLanguage: ILanguage;
    /**
    * Gets current language code,Default 'tr-tr'
    * @returns {string} 
    */
    get currentLanguage(): ILanguage { return this._currentLanguage }
    /**
     * Change current language and reload page
     * @param value Language to change
     */
    set currentLanguage(value: ILanguage) {
        if (value === this.currentLanguage) return;

        if (!this.config.supportedLanguages.any(lang => lang.code === value.code)) {
            throw new Error("not supported culture.(allowed 'en-us' or 'tr-tr')");
        }

        this.$window.localStorage.setItem(this.constants.localization.ACTIVE_LANG_STORAGE_NAME, value.code);
        this.$window.location.reload();
    }
    //#endregion

    //#region Init
    static $inject = ['$window', '$interpolate', 'Resource', 'Config', 'Constants'];
    constructor(private $window: ng.IWindowService,
        private $interpolate: ng.IInterpolateService,
        private resources: IResource,
        private config: IMainConfig,
        private constants: IConstants) {
        //TODO:localStorege must be obtained thru injector
        let currentCulture = $window.localStorage.getItem(constants.localization.ACTIVE_LANG_STORAGE_NAME);
        //set user predefined culture 
        if (!currentCulture && config.culture && config.culture !== constants.localization.DEFAULT_LANGUAGE) {
            this.currentLanguage = { code: config.culture };
            return;
        }
        //default to tr-tr
        currentCulture = currentCulture || constants.localization.DEFAULT_LANGUAGE;
        this._currentLanguage = this.config.supportedLanguages.firstOrDefault(lang => lang.code === currentCulture);
    }

    //#endregion

    //#region Localization Methods
    getLocal(key: string): string;
    getLocal(key: string, ...params: string[]): string;
    getLocal(key: string, scope: any): string;
    getLocal(...args: any[]): string {
        //if no param provided return with null
        if (args.length === 0) return null;
        //get first param as ket value
        const key = <string>args[0];
        //get localized value
        let tag = this.getLocalizedValue(key);
        //format
        if (args.length > 1) {
            //interpolation
            if (angular.isObject(args[1])) {
                tag = this.$interpolate(tag)(args[1]);
            } else {
                //format
                for (let index = 1; index < args.length; index++) {
                    const target = '{' + (index - 1) + '}';
                    tag = tag.replace(target, args[index]);
                }
            }
        }
        return tag;
    }
    /**
     * Get localized string fro the key path
     * @param path Key
     * @returns {string}
     */
    private getLocalizedValue(path: string): string {
        const keys = path.split(".");
        var level = 0;
        const extractValue = (context: IResource): string => {
            if (context[keys[level]]) {
                const val = context[keys[level]];
                if (typeof val === 'string') {
                    return val;
                } else {
                    level++;
                    return extractValue(val);
                }
            } else {
                return null;
            }
        };
        return extractValue(this.resources);
    }

    //#endregion
}
//#endregion

//#region Register
const module: ng.IModule = angular.module('rota.services.localization', []);
module.service('Localization', Localization);
module.factory('Resource', () => {
    return angular.extend({}, appresource, rotaresource);
});
//#endregion

export { Localization }
