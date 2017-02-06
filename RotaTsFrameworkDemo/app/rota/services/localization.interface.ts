/**
 * Json resource file
 */
interface IResource {
    [s: string]: any;
}
/**
 * Supported Cultures
 */
type ISupportedCultures = "en-us" | "tr-tr";
/**
 * Language model
 */
interface ILanguage {
    /**
     * Lang code tr-tr,en-us ...
     */
    code: ISupportedCultures;
    /**
     * Language fullname
     */
    fullname?: string;
}

/**
 * Localization service
 */
interface ILocalization extends IBaseService {
    /**
     * Current language
     */
    currentLanguage: ILanguage;
    /**
     * Get localized value of key 
     * @param key Key value to be localized
     * @returns {string} Localized value
     * @example getLocal('rota.cancel');
     */
    getLocal(key: string): string;
    /**
     * Get localized value of key formatted with params
     * @param key Key value to be localized
     * @param params Format arguments
     * @returns {string} Localized value
     * @example getLocal('rota.confirmdeleteitem','Acme Company');rota.confirmdeleteitem = 'Are you sure to delete {0} ?'
     */
    getLocal(key: string, ...params: string[]): string;
    /**
     * Get localized value of key formatted with scope obj
     * @param key Key value to be localized
     * @param scope Object to define interpolation scope
     * @example getLocal('rota.confirmdeleteitem',{message:'Acme Company'});rota.confirmdeleteitem = 'Are you sure to delete {{message}} ?'
     * @returns {string} Localized value
     */
    getLocal(key: string, scope: any): string;
}

