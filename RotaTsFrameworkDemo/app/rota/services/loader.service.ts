//#region Loader Service

/**
 * Controller File Loader Service
 */
class Loader implements ILoader {
    serviceName: string = "Loader Service";
    //states
    static $inject = ['$q', '$rootScope', 'Common'];
    constructor(private $q: ng.IQService, private $rootScope: IRotaRootScope, private common: ICommon) {
    }
    /**
     * Load file
     * @param url normalized or relative path
     */
    private load(url: string[]): ng.IPromise<string | string[] | RequireError> {
        var defer = this.$q.defer();
        window.require(url, (...responses: any[]) => {
            defer.resolve(responses);
            this.$rootScope.$apply();
        }, reason => {
            defer.reject(reason);
        });
        return defer.promise;
    }
    /**
      * Load file from server with the provided url
      * @param url Url
      * @returns {ng.IPromise<string>}
      */
    resolve(url: string): ng.IPromise<string>;
    /**
    * Load provided files from server
    * @param urls Url array
    * @returns {ng.IPromise<string[]>}
    */
    resolve(urls: string[]): ng.IPromise<string[]>;
    resolve(value: any): ng.IPromise<string | string[]> {
        let arrayValue = !this.common.isArray(value) ? [value] : value;
        //set text plugin prefix for html files
        arrayValue = arrayValue.map(url => {
            if (this.common.isHtml(url)) return ('text!' + url);
            return url;
        });
        //file resolve
        return this.load(arrayValue);
    }
}
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.loader', []);
module.service('Loader', Loader);
//#endregion

export { Loader };