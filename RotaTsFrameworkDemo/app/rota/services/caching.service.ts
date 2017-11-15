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

//#region Storage Class
/**
 * Generic cachers class
 */
class Storage implements ICacher {

    constructor(private storage: IStorage, private base64?: IBase64) { }

    get<TModel>(key: string, defaultValue?: TModel, decode: boolean = true): TModel {
        try {
            const data = this.storage.getItem(key);
            if (data) {
                const decoded = (decode && this.base64) ? this.base64.decode(data) : data;
                const model = JSON.parse(decoded);
                this.log(`${key} retrived from storage`, model);
                return model as TModel;
            }
        } catch (e) {
            this.log(key + " can not be retrived from storage.", e);
            //remove if failed
            this.remove(key);
            return defaultValue;
        }
        return defaultValue;
    }

    store<TModel>(key: string, value: TModel, encode: boolean = true): void {
        if (value === undefined || value === null) {
            this.log(`${key} not stored due to undefined or null`);
            return;
        };
        try {
            //to remove the $$hashKey prop,angular.tojson is used instead of JSON.stringfy
            //https://stackoverflow.com/a/23656919/1016147
            const strData: string = angular.toJson(value);
            this.storage.setItem(key, (encode && this.base64) ? this.base64.encode(strData) : strData);
            this.log(`${key} stored`, value);
        } catch (e) {
            this.log(`${key} can not be stored`, e);
        }
    }

    remove(key: string): void {
        this.storage.removeItem(key);
        this.log(`${key} removed`);
    }

    log(message: string, data?: any): void { }

    get isAvailable(): boolean { return !!this.storage.setItem }
}

//#endregion

//#region Caching Service
/**
 * Caching service
 */
class Caching implements ICaching {
    //#region Props
    serviceName = "Caching Service";
    static injectionName = "Caching";
    private static cacheId = "rota-cache";
    cachers: { [index: number]: ICacher };
    //#endregion

    //#region Shortcut for Storages
    get localStorage(): ICacher { return this.cachers[CacherType.LocalStorage]; }
    get sessionStorage(): ICacher { return this.cachers[CacherType.SessionStorage]; }
    get cacheStorage(): ICacher { return this.cachers[CacherType.CacheStorage]; }
    get cookieStorage(): ICacher { return this.cachers[CacherType.CookieStorage]; }
    //#endregion

    //#region Init
    static $inject = ['$window', '$cacheFactory', '$cookies', 'Logger', 'Base64', 'Config'];
    constructor($window: ng.IWindowService, $cacheFactory: ng.ICacheFactoryService,
        $cookies: angular.cookies.ICookiesService, logger: ILogger, base64: IBase64, config: IMainConfig) {
        this.cachers = {};
        //define cachers
        const encoder = config.encodeStorageValues && base64;
        this.cachers[CacherType.LocalStorage] = new Storage($window.localStorage, encoder);
        this.cachers[CacherType.SessionStorage] = new Storage($window.sessionStorage, encoder);
        const cacheFactory = $cacheFactory(Caching.cacheId);
        this.cachers[CacherType.CacheStorage] = new Storage({
            getItem: cacheFactory.get,
            setItem: cacheFactory.put,
            removeItem: cacheFactory.remove
        }, encoder);
        this.cachers[CacherType.CookieStorage] = new Storage({
            getItem: $cookies.get,
            setItem: $cookies.put,
            removeItem: $cookies.remove
        }, encoder);
        //fallback to cookiestorage
        for (let i = CacherType.LocalStorage; i <= CacherType.CookieStorage; i++) {
            this.cachers[i].log = (message, data) => logger.console.log({ message: message, data: data });
            if (!this.cachers[i].isAvailable) {
                this.cachers[i] = this.cookieStorage;
            }
        }
    }
    //#endregion
}
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.caching', []);
module.service(Caching.injectionName, Caching);
//#endregion

export { Caching }