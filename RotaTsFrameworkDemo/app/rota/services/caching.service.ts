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

//#region Cachers
/**
 * LocalStorage 
 */
class LocalStorage implements ICacher {
    constructor(private logger: ILogger, private storage: Storage) { }

    get isAvailable(): boolean { return !!this.storage; }

    get<TModel extends IBaseModel>(key: string): TModel {
        let data = this.storage.getItem(key);
        if (data) {
            const model = JSON.parse(data);
            this.logger.console.log({ message: 'localstorage cache restored with key ' + key, data: model });
            return model as TModel;
        }
        return null;
    }

    store(key: string, value: any): void {
        const strData: string = JSON.stringify(value);
        this.storage.setItem(key, strData);
        this.logger.console.log({ message: 'localstorage cache created with key ' + key, data: value });
    }

    remove(key: string): void {
        this.storage.removeItem(key);
        this.logger.console.log({ message: 'localstorage cache removed with key ' + key });
    }
}
/**
 * Session Storage
 */
class SessionStorage implements ICacher {
    constructor(private logger: ILogger, private storage: Storage) { }

    get isAvailable(): boolean { return !!this.storage; }

    get<TModel extends IBaseModel>(key: string): TModel {
        let data = this.storage.getItem(key);
        if (data) {
            const model = JSON.parse(data);
            this.logger.console.log({ message: 'sessionstorage cache restored with key ' + key, data: model });
            return model as TModel;
        }
        return null;
    }

    store(key: string, value: any): void {
        const strData: string = JSON.stringify(value);
        this.storage.setItem(key, strData);
        this.logger.console.log({ message: 'sessionstorage cache created with key ' + key, data: value });
    }

    remove(key: string): void {
        this.storage.removeItem(key);
        this.logger.console.log({ message: 'sessionstorage cache removed with key ' + key });
    }
}
/**
 * Cache Storage
 */
class CacheStorage implements ICacher {

    constructor(private logger: ILogger, private cacheObject: ng.ICacheObject) { }

    get isAvailable(): boolean { return !!this.cacheObject; }

    get<TModel extends IBaseModel>(key: string): TModel {
        const data = this.cacheObject.get<TModel>(key);
        if (data) {
            this.logger.console.log({ message: 'cachestorage cache restored with key ' + key, data: data });
            return data;
        }
        return null;
    }

    store(key: string, value: any): void {
        this.cacheObject.put(key, value);
        this.logger.console.log({ message: 'cachestorage cache created with key ' + key, data: value });
    }

    remove(key: string): void {
        this.cacheObject.remove(key);
        this.logger.console.log({ message: 'cachestorage cache removed with key ' + key });
    }
}
/**
 * Cookie Storage
 */
class CookieStorage implements ICacher {

    constructor(private logger: ILogger, private cookies: angular.cookies.ICookiesService) { }

    get isAvailable(): boolean { return !!this.cookies; }

    get<TModel extends IBaseModel>(key: string): TModel {
        let data: any = this.cookies.get(key);
        if (data) {
            data = JSON.parse(data);
            return data;
        }
        return null;
    }

    store(key: string, value: any): void {
        const strData: string = JSON.stringify(value);
        this.cookies.put(key, strData);
    }

    remove(key: string): void {
        this.cookies.remove(key);
    }
}
//#endregion

//#region Caching Service
/**
 * Caching service
 */
class Caching implements ICaching {
    //#region Props
    serviceName = "Caching Service";
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
    static $inject = ['$window', '$cacheFactory', '$cookies', 'Logger'];
    constructor($window: ng.IWindowService, $cacheFactory: ng.ICacheFactoryService,
        $cookies: angular.cookies.ICookiesService, logger: ILogger) {
        this.cachers = {};
        this.cachers[CacherType.CacheStorage] = new CacheStorage(logger, $cacheFactory(Caching.cacheId));
        this.cachers[CacherType.LocalStorage] = new LocalStorage(logger, $window.localStorage);
        this.cachers[CacherType.SessionStorage] = new SessionStorage(logger, $window.sessionStorage);
        this.cachers[CacherType.CookieStorage] = new CookieStorage(logger, $cookies);
        //fallback to cookiestorage
        for (let i = CacherType.LocalStorage; i <= CacherType.CookieStorage; i++) {
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
module.service('Caching', Caching);
//#endregion

export {Caching}