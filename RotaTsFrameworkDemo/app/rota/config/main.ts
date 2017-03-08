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
        angular: './rota/core/angular',
        'angular-ui-router': './rota/core/angular-ui-router',
        'ct-ui-router-extras': './rota/lib/ct-ui-router-extras',
        'angular-local': './rota/core/angular-locale_tr-tr',
        'angular-bootstrap': './rota/core/ui-bootstrap-tpls-2.3.0.min',
        'angular-sanitize': './rota/core/angular-sanitize',
        'angular-animate': './rota/core/angular-animate',
        'angular-cookies': './rota/core/angular-cookies.min',
        'signalr.core': './rota/core/jquery.signalR-2.2.1.min',
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
        ngcurrency: './rota/lib/ng-currency',
        mfb: './rota/lib/mfb-directive',
        imgcrop: './rota/lib/ng-img-crop',
        scroll: './rota/lib/angular-scroll.min',
        ngcontextmenu: './rota/lib/ng-contextmenu',
        treeview: './rota/lib/ivh-treeview',
        uimask: './rota/lib/mask.min',
        uilayout: './rota/lib/ui-layout',
        //grid libs
        pdfMake: './rota/lib/pdfMake.min',
        vfs_fonts: './rota/lib/vfs_fonts',
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
        pdfMake: {
            exports: 'pdfMake'
        },
        vfs_fonts: {
            exports: 'vfs_fonts',
            deps: ['pdfMake']
        },
        grid: {
            deps: ['angular', 'vfs_fonts']
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
        ngcurrency: {
            deps: ['angular']
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
        ckeditor: {
            deps: ['jquery']
        },
        'ng-ckeditor': {
            deps: ['ckeditor', 'angular']
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

//#region Global Consts
//this global constants aims to be aligned with main constants service
window.__constants = {
    //localizations
    ACTIVE_LANG_STORAGE_NAME: 'active.language',
    DEFAULT_LANGUAGE: 'tr-tr',
    //storage names
    STORAGE_NAME_AUTH_TOKEN: 'rota-access-token',
    STORAGE_NAME_CURRENT_COMPANY: 'current-company',
    //request header names
    HEADER_NAME_LANGUAGE: 'Rota-Language',
    HEADER_NAME_ROLE_ID: 'Current-RoleId',
    HEADER_NAME_COMPANY_ID: 'Current-CompanyId',
    //default modal controller name
    DEFAULT_MODAL_CONTROLLER_NAME: 'defaultModalController'
}
//#endregion

//#region Vars
//storage keys consts
const storageNameAuthToken = window.__constants.STORAGE_NAME_AUTH_TOKEN;
const storageNameCurrentCompany = window.__constants.STORAGE_NAME_CURRENT_COMPANY;
//header consts
const headerNameCurrentRoleId = window.__constants.HEADER_NAME_ROLE_ID;
const headerNameCurrentCompanyId = window.__constants.HEADER_NAME_COMPANY_ID;
const headerNameLanguage = window.__constants.HEADER_NAME_LANGUAGE;
//current language 
const currentLanguage = localStorage.getItem(window.__constants.ACTIVE_LANG_STORAGE_NAME) || window.__constants.DEFAULT_LANGUAGE;
//debugging indicator
const debugging = window.__globalEnvironment.debugging;
//#endregion

//#region Runtime config 
if (window) {
    require.config({
        //#region Config
        config: {
            //Set the config for the i18nmodule ID
            i18n: {
                locale: currentLanguage
            },
            text: {
                //this is for cross origin text requests
                useXhr: (url, protocol, hostname, port) => true,
                onXhr: (xhr, url) => {
                    //get selected company if any
                    let currentCompany: IStorageCurrentCompany = null;
                    const storedCompany = sessionStorage.getItem(storageNameCurrentCompany);
                    if (storedCompany) {
                        currentCompany = JSON.parse(storedCompany);
                    }
                    //set current company & role id
                    xhr.setRequestHeader(headerNameCurrentRoleId, currentCompany && currentCompany.roleId);
                    xhr.setRequestHeader(headerNameCurrentCompanyId, currentCompany && currentCompany.companyId);
                    //set language for server 
                    xhr.setRequestHeader(headerNameLanguage, currentLanguage);
                    //set authorization token for json & text requests
                    if (window.__access_token) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + window.__access_token);
                    }
                }
            }
        },
        //#endregion

        //this wait for remote service call to warm up
        waitSeconds: 9999,
        //cache busting
        urlArgs: window.__globalEnvironment.cacheBusting
    });
    //add xdomains to paths
    const xpaths = window.__globalEnvironment.xDomPaths;
    if (xpaths) {
        require.config({
            paths: xpaths
        });
    }

    //#region ckEditor Path Setting
    //http://stackoverflow.com/questions/8807029/how-do-you-define-the-path-which-ckeditor-uses-to-search-for-config-language-f
    if (!debugging) {
        window.CKEDITOR_BASEPATH = '/dist/rota/lib/ckeditor/';
    }
    //#endregion
}
//#endregion

//#region Init files
require(['config/oidc-manager'],
    (oidc: IOidcManager) => {
        //init authz
        const result = oidc.init({
            authority: window.__globalEnvironment.authority,
            clientId: window.__globalEnvironment.clientId,
            postLogoutRedirectUri: window.__globalEnvironment.postLogoutRedirectUri,
            redirectUri: window.__globalEnvironment.redirectUri,
            silentRedirectUri: window.__globalEnvironment.silentRedirectUri,
            clockSkew: window.__globalEnvironment.clockSkew,
            scope: window.__globalEnvironment.scope
        });

        result.then(user => {
            if (user !== null) {
                //#region Load files
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
                //#endregion
            }
        });
    });
//#endregion

