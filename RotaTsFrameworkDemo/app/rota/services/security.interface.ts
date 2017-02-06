//#region Security config
/**
 * Security config
 */
interface ISecurityConfig extends IBaseConfig {
    /**
     * Storage name of token
     */
    tokenStorageName?: string;
    /**
     * Session storage name of temprorary data
     */
    stateTempStorageName?: string;
    /**
     * Redirecting uri for unauthorized requests
     */
    redirectUri?: string;
    /**
     * Default uri to redirect after successful authorization
     */
    postLogoutRedirectUri?: string;
    /**
     * Response type for OIC
     */
    responseType?: string;
    /**
     * Default scopes
     */
    scope?: string;
    /**
     * Flag that indicates if user-profile-endpoint will be used for profile information
     */
    loadUserProfile?: boolean;
    /**
     * Flag that if omitting built-it claims is active
     */
    filterProtocolClaims?: boolean;
    /**
     * Client Id
     */
    clientId?: string;
    /**
     * OIC main uri
     */
    authority?: string;
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
     * User profile fetched from server to combine with currentUser:IUser
     */
    userProfile?: any;
    /**
     * User picture upload uri
     */
    avatarUploadUri?: string;
    /**
     * Avatar get uri,User id will be added as parameter
     */
    avatarUri?: string;
    /**
     * Flag that indicates if AntiForgerytoken is enabled 
     */
    antiForgeryTokenEnabled?: boolean;
    /**
     * Backend url for antiforgery token
     */
    antiForgeryTokenUrl?: string;
    /**
     * Antiforgerytoken request header name
     */
    antiForgeryTokenHeaderName?: string;
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
     * Promise initiated at run phase
     */
    initPromise: ng.IPromise<IProfileModel<IUser> | string>;
    /**
     * Authorization flag
     */
    isAuthenticated: boolean;
    /**
     * Initialize security
     * @returns {IProfileModel<IUser>}
     */
    initSecurity(): ng.IPromise<IProfileModel<IUser> | string>;
    /**
     * Used by routing service to show view
     * @param state  State obj
     * @description if promise resolved,state is authenticated
     * @returns {ng.IPromise<any>}
     */
    isStateAuthenticated(state: IRotaState): ng.IPromise<any>;
    /**
     * Logoff
     * @returns {ng.IPromise<any>}
     */
    logOff(): ng.IPromise<any>;
    /**
     * Request token from which defined in security config
     * @returns {} 
     */
    getAntiForgeryToken(state: IRotaState): ng.IPromise<string>;
}

//#endregion

//#region Claims & User
/**
 * Base User profile 
 */
interface IUser {
    fullname: string;
    name: string;
    email?: string;
    managerId?: number;
    culture?: ISupportedCultures;
    id: number;
}
/**
 * All claims
 */
interface IClaims {
    [index: string]: string;
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

//#region OpenId Configuration
/**
 * OIC metadata 
 */
interface IOpenIdMetaData extends IBaseServerResponseData {
    issuer: string;
    jwks_uri: string;
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    end_session_endpoint: string;
    check_session_iframe: string;
    revocation_endpoint: string;
    introspection_endpoint: string;
    http_logout_supported: boolean;
    scopes_supported: Array<string>;
    claims_supported: Array<string>;
    response_types_supported: Array<string>;
    response_modes_supported: Array<string>;
    grant_types_supported: Array<string>;
    subject_types_supported: Array<string>;
    id_token_signing_alg_values_supported: Array<string>;
    token_endpoint_auth_methods_supported: Array<string>;
}
/**
 * Keys
 */
interface IJwk {
    kty: string;
    use: string;
    kid: string;
    x5t: string;
    e: string;
    n: string;
    x5c: Array<string>;
}

/**
 * JSON web keys
 */
interface IJwks extends IBaseServerResponseData {
    keys: Array<IJwk>;
}
//#endregion

//#region JWT Service
/**
 * JWT helper service
 */
interface IJWTHelper {
    /**
     * Shortcut way of rejection promise
     * @param cause Reason
     * @returns {ng.IPromise<string>} 
     */
    reject(cause?: string): ng.IPromise<string>;
    /**
     * Load metadata information using authority 
     * @returns {ng.IPromise<IOpenIdMetaData>}
     */
    loadMetadata(): ng.IPromise<IOpenIdMetaData | string>;
    /**
     * Gets authorization endpoint uri using metadata
     * @returns {ng.IPromise<string>} 
     */
    loadAuthorizationEndpoint(): ng.IPromise<string>;
    /**
     * Load user profile using profile end point in case loadUserProfile flag is true
     * @param accessToken Access Token
     * @returns {ng.IPromise<IUser>}
     */
    loadUserProfile(accessToken: string): ng.IPromise<IUser | string>;
    /**
     * Create Logout request using metadata
     * @param idTokenHint Id Token
     * @returns {ng.IPromise<string>}
     */
    createLogoutRequest(idTokenHint: string): ng.IPromise<string>;
    /**
     * Get signing key using metadata
     * @returns {ng.IPromise<string>}
     */
    loadX509SigningKey(): ng.IPromise<string>;
    /**
     * Validate Id Token comparing state,nonce etc..
     * @param idToken Id Token
     * @param nonce Nonce - Number once
     * @returns {ng.IPromise<IClaims>}
     */
    validateIdToken(idToken: string, nonce: string): ng.IPromise<IClaims | string>;
    /**
     * Filters claims using openIdBuiltInClaims
     * @param claims All Claims
     * @returns {IUser} 
     */
    filterProtocolClaims(claims: any): IUser;
}
//#endregion

//#region Token Interfaces
/**
 * Temprorary session data
 */
interface ITempSessionData {
    nonce: string;
    state: string;
}
/**
 * Token model returned from OIC
 */
interface ITokenModel {
    id_token?: string;
    access_token?: string;
    token_type: string;
    expires_in: number;
    scope?: string;
    state?: string;
    session_state?: string;
}
/**
 * Used for generation request uri for OIC
 */
interface ITokenRequest {
    settings: ITempSessionData;
    url: string;
}
/**
 * Structure to be stored including profile information and tokens
 */
interface IProfileModel<T extends IUser> {
    /**
     * User profile
     */
    profile: T,
    /**
     * Id Token
     */
    id_token?: string;
    /**
     * Access Token
     */
    access_token?: string;
    /**
     * Time span for expiration
     */
    expires_in: number;
}
/**
 * Token service structure
 */
interface ITokens {
    idToken: string;
    accessToken: string;
    antiForgeryToken?: string;
}

interface IStorageCurrentCompany {
    id: number;
    companyId: number;
    roleId: number;
}
//#endregion

