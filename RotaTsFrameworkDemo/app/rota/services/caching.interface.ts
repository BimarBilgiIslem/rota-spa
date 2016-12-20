/**
 * Base storage
 */
interface ICacher {
    /**
     * Get data from storage
     * @param key Cache key 
     * @returns {TModel} 
     */
    get<TModel extends IBaseModel>(key: string): TModel;
    /**
     * Store cache by key 
     * @param key Key value
     * @param value Value object
     */
    store(key: string, value: any): void;
    /**
     * Remove cache by key
     * @param key Key
     */
    remove(key: string): void;
    /**
     * Returns implemented storage type is available
     */
    isAvailable: boolean;
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