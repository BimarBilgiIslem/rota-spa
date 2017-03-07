//#region Security config
/**
 * Security config
 */
interface ISecurityConfig extends IBaseConfig {
    /**
     * Flag that if app will be used with no authoirzation or not
     */
    allowAnonymousAccess?: boolean;
    /**
   * Auhorized Companies 
   */
    authorizedCompanies?: ICompany[];
    /**
    * Default company Id
    */
    defaultCompanyId?: number;
    /**
     * User profile fetched from server to merge with currentUser:IUser
     */
    userProfile?: any;
    /**
     * User picture upload uri
     */
    avatarUploadUri?: string;
    /**
     * Backend url for avatar images
     */
    avatarProviderUri?: string;
    /**
    * Flag that enables avatar that shows first letter of user name,default true
    */
    useFirstLetterAvatar?: boolean;
    /**
     * Logoff when idle timeout has reached by prompting user
     */
    logOffWhenIdleTimeout?: boolean;
    /**
     * Idle timeout as millisecond default 30 mins
     */
    idleTimeout?: number;
    /**
     * Count down for logoff when idle time is over,default 5 mins
     */
    idleLogoffCountDown?: number;
}
/**
 * Security config provider
 */
interface ISecurityConfigProvider extends IBaseConfigProvider<ISecurityConfig> {
}
//#endregion

//#region Security Service
/**
 * Security service
 */
interface ISecurity extends IBaseService {
    /**
     * Current principal
     */
    currentUser: IUser;
    /**
     * Current company
     */
    currentCompany: ICompany;
    /**
     * Security config
     */
    securityConfig: ISecurityConfig;
    /**
     * Initialize security
     */
    initSecurity(): void;
    /**
     * Logoff
     * @returns {ng.IPromise<any>}
     */
    logOff(): void;
    /**
    * Set company from UI
    * @param company Company to be selected
    */
    setCompany(company: ICompany): void;
}

//#endregion

//#region Claims & User
/**
 * Base User profile 
 */
interface IUser {
    id: number;
    fullname: string;
    name: string;
    email?: string;
    managerId?: number;
    culture?: ISupportedCultures;
    avatarDataUri?: string;
}
/**
 * Company structure
 */
interface ICompany {
    /**
     * Unique identifier,not company's real id
     * Will be used for storing current company
     */
    id: number;
    companyName: string;
    /**
     * This props is added to request header
     */
    companyId?: number;
    roleId?: number;
}
//#endregion

//#region Token Interfaces
/**
 * Structure to be stored including profile information and tokens
 */
interface IProfileModel<T extends IUser> extends Oidc.User {
    /**
     * User profile
     */
    profile: T
}
/**
 * Token service structure
 */
interface ITokens {
    idToken: string;
    accessToken: string;
}

interface IStorageCurrentCompany {
    id: number;
    companyId: number;
    roleId: number;
}
//#endregion

