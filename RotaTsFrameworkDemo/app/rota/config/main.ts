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

//#region Paths + Shim config
require.config({
    baseUrl: 'app',
    //#region Paths
    paths: {
        //relative paths
        rota: './rota',
        base: './rota/base',
        config: './rota/config',
        core: './rota/core',
        lib: './rota/lib',
        'rota-resources': './rota/resources',
        'app-resources': './resources',
        //core
        jquery: './rota/core/jquery-2.1.4.min',
        angular: './rota/core/angular.min',
        'angular-ui-router': './rota/core/angular-ui-router.min',
        'ct-ui-router-extras': './rota/lib/ct-ui-router-extras',
        'angular-local': './rota/core/angular-locale_tr-tr',
        'angular-bootstrap': './rota/core/ui-bootstrap-tpls-2.5.0.min',
        'angular-sanitize': './rota/core/angular-sanitize.min',
        'angular-animate': './rota/core/angular-animate.min',
        'angular-cookies': './rota/core/angular-cookies.min',
        'signalr.core': './rota/core/jquery.signalR-2.2.1.min',
        'reflect-metadata': './rota/core/Reflect',
        //typscript helper
        tslib: './rota/core/tslib',
        //oidc paths
        oidc: './rota/core/oidc-client.min',
        silentrenew: 'rota/shell/views/silent_renew.html',
        //libs
        toastr: './rota/lib/toastr',
        underscore: './rota/lib/underscore.min',
        'underscore.string': './rota/lib/underscore.string.min',
        'underscore.mixed': './rota/lib/underscore.mixed',
        moment: './rota/lib/moment.min',
        //requirejs plugins
        i18n: './rota/lib/i18n',
        text: './rota/lib/text',
        json: './rota/lib/json',
        optional: './rota/lib/optional',
        xdom: './rota/lib/xdom',
        //UI
        fileupload: './rota/lib/ng-file-upload-all.min',
        fileapi: './rota/lib/FileAPI.min',
        spinner: './rota/lib/spin.min',
        circleprogress: './rota/lib/roundProgress.min',
        grid: './rota/lib/ui-grid.min',
        hotkeys: './rota/lib/hotkeys.min',
        select: './rota/lib/select.min',
        ckeditor: './rota/lib/ckeditor/ckeditor',
        'ng-ckeditor': './rota/lib/ng-ckeditor',
        'ng-currency': './rota/lib/ng-currency',
        mfb: './rota/lib/mfb-directive',
        imgcrop: './rota/lib/ng-img-crop',
        scroll: './rota/lib/angular-scroll.min',
        ngcontextmenu: './rota/lib/ng-contextmenu',
        treeview: './rota/lib/ivh-treeview',
        uimask: './rota/lib/mask.min',
        uilayout: './rota/lib/ui-layout',
        //grid libs
        pdfMake: './rota/lib/pdfMake.min',
        //SignalR
        'signalr.hubs': '/signalr/hubs?'
    },
    //#endregion

    //#region Shim
    shim: {
        angular: {
            exports: 'angular'
        },
        'angular-ui-router': {
            deps: ['angular']
        },
        'angular-bootstrap': {
            deps: ['angular']
        },
        'angular-sanitize': {
            deps: ['angular']
        },
        'angular-animate': {
            deps: ['angular']
        },
        'angular-local': {
            deps: ['angular']
        },
        'angular-cookies': {
            deps: ['angular']
        },
        grid: {
            deps: ['angular']
        },
        hotkeys: {
            deps: ['angular']
        },
        scroll: {
            deps: ['angular', 'jquery']
        },
        select: {
            deps: ['angular']
        },
        fileupload: {
            deps: ['fileapi', 'angular']
        },
        mfb: {
            deps: ['angular']
        },
        imgcrop: {
            deps: ['angular']
        },
        circleprogress: {
            deps: ['angular']
        },
        'ng-ckeditor': {
            deps: ['angular', 'ckeditor']
        },
        ngcontextmenu: {
            deps: ['angular']
        },
        'signalr.core': {
            deps: ['jquery'],
            exports: '$.connection'
        },
        'signalr.hubs': {
            deps: ['signalr.core']
        },
        treeview: {
            deps: ['angular']
        },
        uimask: {
            deps: ['angular']
        },
        uilayout: {
            deps: ['angular']
        },
        oidc: {
            exports: 'oidc'
        }
    }
    //#endregion
});
//#endregion

//#region Runtime config 
if (typeof window !== 'undefined') {
    const env = window.__globalEnvironment;

    //#region Methods
    const mobileAndTabletcheck = (): boolean => {
        let check = false;
        (a => { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

    const getCulture = (constants: IConstants): string => {
        const initialCulture = localStorage.getItem(constants.localization.ACTIVE_LANG_STORAGE_NAME) ||
            (navigator.language.substr(0, 2) === constants.localization.DEFAULT_LANGUAGE.substr(0, 2)
                ? constants.localization.DEFAULT_LANGUAGE
                : constants.localization.ENGLISH_LANGUAGE);
        return initialCulture;
    }

    const initCulture = (culture: string) => {
        require.config({
            config: {
                i18n: {
                    locale: culture
                }
            }
        });
        window.__CULTURE = culture;
    }

    const setTextPlugin = (oidc: IOidcManager, constants: IConstants, culture: string) => {
        let redirecting;
        require.config({
            config: {
                text: {
                    //this is for cross origin text requests
                    useXhr: (url, protocol, hostname, port) => true,
                    onXhr: (xhr, url) => {
                        //get request header map 
                        const storedRequestHeaderMaps = sessionStorage.getItem(constants.security.STORAGE_NAME_REQUEST_HEADER_MAPS);
                        if (storedRequestHeaderMaps) {
                            const requestHeaderMaps = JSON.parse(storedRequestHeaderMaps) as RequestHeaders;
                            //get currentUser from session
                            const storedCompany = sessionStorage.getItem(constants.security.STORAGE_NAME_CURRENT_COMPANY);
                            if (storedCompany) {
                                const currentCompany: ICompany = JSON.parse(storedCompany);
                                //map and append request header map to config
                                for (let key in requestHeaderMaps) {
                                    if (requestHeaderMaps.hasOwnProperty(key) && currentCompany[key]) {
                                        xhr.setRequestHeader(requestHeaderMaps[key], currentCompany[key]);
                                    }
                                }
                            }
                        }
                        //set language for server 
                        xhr.setRequestHeader(constants.server.HEADER_NAME_LANGUAGE, culture);
                        //set authorization token for json & text requests
                        if (oidc.user) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + oidc.user.access_token);
                        }
                    },
                    onXhrComplete(xhr, url) {
                        //if text plugin request reponse status is 401,that must be claim or idsrv session related error
                        //so logging out is the best place to go.
                        //Warning for consistantly redirecting to idsrv
                        if (xhr.status === 401 && !redirecting) {
                            oidc.signOut();
                            redirecting = true;
                        }
                    }
                }
            }
        });
    }

    const setCrossOriginPaths = () => {
        const xpaths = env.doms;
        if (xpaths) {
            require.config({
                paths: xpaths
            });
        }
    }

    const setRequireConfig = () => {
        require.config({
            //this is for server warm up - must be think about it
            waitSeconds: 9999,
            urlArgs: env.cacheBusting
        });
    }

    const setConfig = () => {
        window.__IS_TOUCHABLE = mobileAndTabletcheck();
        //http://stackoverflow.com/questions/8807029/how-do-you-define-the-path-which-ckeditor-uses-to-search-for-config-language-f
        if (!env.debugging) {
            window.CKEDITOR_BASEPATH = '/dist/rota/lib/ckeditor/';
        }
    }

    const loadFr = () => {
        require(['config/vendor.index'], (): void => {
            //load startup along with rota fr
            require(['startup'], (app): void => {
                //validate app
                if (!app || !app.rotaModule) {
                    throw "startup module must return the App class - i.e export = App";
                }
                //bootstrap rota app
                angular.element(document).ready(() => {
                    const $injector = angular.bootstrap(document, [app.rotaModule.name]);
                    //injector is stored for further module dependecy.(angular is modified)
                    //check for this link https://github.com/angular/angular.js/pull/4694
                    app.setInjector($injector);
                    //remove progress bar
                    const pbar = document.getElementById('progressBar');
                    if (pbar && pbar.parentNode) {
                        pbar.parentNode.removeChild(pbar);
                    }
                });
            });
        });
    }
    //#endregion

    //#region Init
    require(['config/oidc-manager', 'config/constants'], (oidc: IOidcManager, constants: IConstants) => {
        const currentCulture = getCulture(constants);
        //init authz
        const result = oidc.init({
            authority: env.authority,
            clientId: env.clientId,
            postLogoutRedirectUri: env.postLogoutRedirectUri,
            redirectUri: env.redirectUri,
            silentRedirectUri: env.silentRedirectUri,
            clockSkew: env.clockSkew,
            scope: env.scope,
            lang: currentCulture
        });

        result.then(user => {
            if (user !== null) {
                //settings
                initCulture(currentCulture);
                setTextPlugin(oidc, constants, currentCulture);
                setCrossOriginPaths();
                setRequireConfig();
                setConfig();
                //init fr
                loadFr();
            }
        }, (error: { message?: string }) => {
            let genericMessage = currentCulture === constants.localization.DEFAULT_LANGUAGE
                ? constants.errors.IDSRV_GENERIC_ERROR_TR
                : constants.errors.IDSRV_GENERIC_ERROR_EN;

            let errorDescription: string = null;
            //customize error messages
            if (error.message) {
                //check for "iat is in future" error
                if (/\iat is in the future/.test(error.message)) {
                    errorDescription = currentCulture === constants.localization.DEFAULT_LANGUAGE
                        ? constants.errors.IDSRV_IAT_IS_IN_FUTURE_ERROR_TR
                        : constants.errors.IDSRV_IAT_IS_IN_FUTURE_ERROR_EN;
                }
            }

            alert(genericMessage + "\n" + (errorDescription || error.message));
        });
    });
    //#endregion
}
//#endregion



