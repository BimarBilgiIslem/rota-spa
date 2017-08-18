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

/**
 * Base storage
 */
interface ICacher {
    /**
     * Get data from storage
     * @param key Cache key 
     * @returns {TModel} 
     */
    get<TModel>(key: string, defaultValue?: TModel, decode?: boolean): TModel;
    /**
     * Store cache by key 
     * @param key Key value
     * @param value Value object
     */
    store<TModel>(key: string, value: TModel, encode?: boolean): void;
    /**
     * Remove cache by key
     * @param key Key
     */
    remove(key: string): void;
    /**
     * Log caching
     * @param message 
     */
    log(message: string, data?: any): void;
    /**
     * Returns implemented storage type is available
     */
    isAvailable: boolean;
}

interface IStorage {
    getItem(key: string): string | null;
    removeItem(key: string): void;
    setItem(key: string, data: string): void;
}
/**
 * Caching service
 */
interface ICaching extends IBaseService {
    /**
     * All Cachers indexed by cacher enum
     */
    cachers: { [index: number]: ICacher };
    /**
     * LocalStorage
     */
    localStorage: ICacher;
    /**
     * SessionStorage
     */
    sessionStorage: ICacher;
    /**
     * Cache Storage
     */
    cacheStorage: ICacher;
    /**
     * Cookie Storage
     */
    cookieStorage: ICacher;
}

/**
 * Cache types
 */
const enum CacherType {
    LocalStorage,
    SessionStorage,
    CacheStorage,
    CookieStorage
}