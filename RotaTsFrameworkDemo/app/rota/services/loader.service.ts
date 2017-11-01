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

//#region Loader Service
/**
 * Controller File Loader Service
 */
class Loader implements ILoader {
    serviceName: string = "Loader Service";
    static injectionName = "Loader";
    //states
    static $inject = ['$q', '$rootScope', 'Common'];
    constructor(private $q: ng.IQService, private $rootScope: IRotaRootScope, private common: ICommon) {
    }
    /**
     * Load file
     * @param url normalized or relative path
     */
    private load(url: string[]): ng.IPromise<string | string[] | RequireError> {
        var defer = this.$q.defer<string | string[] | RequireError>();
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
    resolve(value: any): ng.IPromise<string | string[] | RequireError> {
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
module.service(Loader.injectionName, Loader);
//#endregion

export { Loader };