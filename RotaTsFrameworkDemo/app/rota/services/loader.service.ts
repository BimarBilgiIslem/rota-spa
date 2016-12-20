//#region Imports
import './loader.config';
//#endregion

//#region Loader Service

/**
 * Controller File Loader Service
 */
class Loader implements ILoader {
    serviceName: string = "Loader Service";
    //states
    static $inject = ['LoaderConfig', 'RouteConfig'];
    constructor(private loaderconfig: ILoaderConfig, private routeconfig: IRouteConfig) {
    }
    /**
     * Generate file path depending on provided settings and general settings
     * @param settings Settings
     */
    getPath(settings: ILoaderSettings): string {
        let relativePath = settings.controllerUrl;
        if (!relativePath && (settings.useTemplateUrlPath || this.loaderconfig.useTemplateUrlPath)) {
            relativePath = settings.templateUrl.replace('.html', '.controller');
        }
        const controllerFullName = relativePath;
        return controllerFullName;
    }
    /**
     * Returns inline annotated function array for the loaded file
     * @param settings Settings
     */
    resolve(settings: ILoaderSettings): { [index: string]: any[] } {
        var fileFullPath = this.getPath(settings);
        //file resolve
        return {
            //lazy loading promise
            load: ['$q', '$rootScope', ($q: ng.IQService, $rootScope: ng.IRootScopeService) => {
                var defer = $q.defer();
                window.require([fileFullPath], () => {
                    defer.resolve();
                    $rootScope.$apply();
                });
                return defer.promise;
            }]
        };
    }
}
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.loader', ['rota.services.loader.config']);
module.service('Loader', Loader);
//#endregion

export { Loader };