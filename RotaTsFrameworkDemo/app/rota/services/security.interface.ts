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

//#region Security config
/**
 * Security config
 */
interface ISecurityConfig extends IBaseConfig {
    /**
     * Access token query string namewhen making get request
     */
    accessTokenQueryStringName?: string;
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
     * Avatar image fecth type
     */
    avatarFetchType?: AvatarFetchType;
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
//#endregion

//#region Avatar
/**
 * Avatar fetch type
 */
const enum AvatarFetchType {
    /**
     * ProviderURL injected as <img src="[URL]">
     */
    ImgSrc,
    /**
     * ProviderURL requested using GET method then added to img>
     */
    GetRequest
}
//#endregion


