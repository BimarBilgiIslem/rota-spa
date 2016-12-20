/**
 * Loader config service
 */
interface ILoaderConfig extends IBaseConfig {
    /**
     * if ControllerUrl not defined,look for in templateUrl path
     */
    useTemplateUrlPath?: boolean;
    /**
     * Use baseUrl defined in routing config
     */
    useBaseUrl?: boolean;
}
/**
 * Loader settings
 */
interface ILoaderSettings {
    /**
     * Controller url
     */
    controllerUrl?: string;
    /**
     * Template url
     */
    templateUrl?: string;
    /**
    * if ControllerUrl not defined,look for in templateUrl path
    */
    useTemplateUrlPath?: boolean;
    /**
     * Use baseUrl defined in routing config
     */
    useBaseUrl?: boolean;
}
/**
 * Loader service
 */
interface ILoader extends IBaseService {
    /**
     * Load file defined by parameters
     * @param settings Loader settings
     * @returns {[index: string]: any[]} Annotation function
     */
    resolve(settings: ILoaderSettings): { [index: string]: any[] };
}
