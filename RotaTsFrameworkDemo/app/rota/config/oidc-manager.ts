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

//#region Imports
import 'oidc';
//#endregion

/**
 * OIDC client manager wrapper
 */
class OidcManager {
    //#region Props
    private static readonly REGEX_ID_TOKEN = /\#id_token/;
    private static readonly REDIRECT_URI_STORAGE_NAME = "_redirect-uri";
    private static readonly SIGNOUT_PATH = "signout";
    private static readonly RESPONSE_TYPE = "id_token token";
    private static readonly SCOPE = "openid rotauser rotaapi";
    public static readonly CLOCK_SKEW = 60;
    private static readonly HOST = window.location.protocol + "//" + window.location.host;
    private static readonly SILENT_RENEW_HTML_PATH = window.require.toUrl("silentrenew").split("?")[0];
    private static readonly PATH = window.location.href.split('/').pop();

    private static instance: Oidc.UserManager;
    static user: Oidc.User;
    //#endregion

    //#region Methods
    static init(settings: IOidcSettings): Promise<Oidc.User> {
        //get oidc usermanager
        OidcManager.instance = OidcManager.createInstance(settings);
        //clear stale sessions
        OidcManager.instance.clearStaleState();
        //check signout request
        if (OidcManager.PATH.toLowerCase() === OidcManager.SIGNOUT_PATH) {
            OidcManager.instance.removeUser();
        }
        //enable logging
        if (window.__globalEnvironment.debugging) {
            Oidc.Log.logger = console;
        }
        //update user when token updated
        OidcManager.instance.events.addUserLoaded(user => {
            OidcManager.user = user;
        });

        OidcManager.instance.events.addAccessTokenExpired(ev => {
            OidcManager.signinRedirect();
        });

        OidcManager.instance.events.addUserSignedOut(() => {
            OidcManager.signinRedirect();
        });

        return OidcManager.authorize();
    }
    /**
     * Sign off
     */
    static signOut(): void {
        OidcManager.instance.signoutRedirect();
    }
    /**
     * Refresh token
     */
    static signinRedirect(): void {
        if (OidcManager.PATH.toLowerCase() !== OidcManager.SIGNOUT_PATH) {
            sessionStorage.setItem(OidcManager.REDIRECT_URI_STORAGE_NAME, location.href);
        }
        OidcManager.instance.signinRedirect();
    }
    /**
     * Update user when silent renew occured
     * @param callback
     */
    static userRenewed(callback: (...ev: any[]) => void): void {
        OidcManager.instance.events.addUserLoaded(callback);
    }
    /**
     * Init authorization
     */
    private static authorize(): Promise<Oidc.User> {
        let result: Promise<Oidc.User>;
        //signin callback
        if (window.location.hash && OidcManager.REGEX_ID_TOKEN.test(window.location.hash)) {
            result = OidcManager.instance.signinRedirectCallback().then(user => {
                OidcManager.removeHash();
                //redirect requested uri
                const redirectUri = sessionStorage.getItem(OidcManager.REDIRECT_URI_STORAGE_NAME);
                sessionStorage.removeItem(OidcManager.REDIRECT_URI_STORAGE_NAME);

                if (redirectUri && location.href !== redirectUri) {
                    window.history.pushState(null, null, redirectUri);
                }
                return user;
            });
        } else {
            //already loggedin ?
            result = OidcManager.instance.getUser();
        }

        return result.then(user => {
            if (user !== null) {
                OidcManager.user = user;
            } else {
                OidcManager.signinRedirect();
            }
            return user;
        });
    }
    /**
     * Remove fragment part from url
     */
    private static removeHash() {
        window.location.replace("#");
        if (typeof window.history.replaceState == 'function') {
            history.replaceState({}, '', window.location.href.slice(0, -1));
        }
    }
    /**
     * get Oidc usermanager instance
     */
    private static createInstance(settings: IOidcSettings): Oidc.UserManager {
        const _settings: Oidc.UserManagerSettings = {
            redirect_uri: settings.redirectUri || OidcManager.HOST,
            post_logout_redirect_uri: settings.postLogoutRedirectUri || OidcManager.HOST,
            authority: settings.authority,
            client_id: settings.clientId,
            response_type: OidcManager.RESPONSE_TYPE,
            scope: settings.scope || OidcManager.SCOPE,
            clockSkew: settings.clockSkew || OidcManager.CLOCK_SKEW,
            filterProtocolClaims: true,
            loadUserInfo: false,
            monitorSession: true,
            ui_locales: settings.lang,
            automaticSilentRenew: true,
            silent_redirect_uri: settings.silentRedirectUri || (OidcManager.HOST + "/" + OidcManager.SILENT_RENEW_HTML_PATH),
            userStore: new Oidc.WebStorageStateStore({ store: window.sessionStorage })
        };
        return new Oidc.UserManager(_settings);
    }
    //#endregion
}

export = OidcManager;