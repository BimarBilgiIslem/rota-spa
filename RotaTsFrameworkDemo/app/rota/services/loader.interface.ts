/**
 * Loader service
 */
interface ILoader extends IBaseService {
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
}
