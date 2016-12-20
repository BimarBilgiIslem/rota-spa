//#region Paths + Shim config
require.config({
    baseUrl: 'app',
    //#region Paths
    paths: {
        //relative paths
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
        bootstrap: './rota/lib/bootstrap.min',
        grid: './rota/lib/ui-grid.min',
        hotkeys: './rota/lib/hotkeys.min',
        select: './rota/lib/select.min',
        'bootstrap-colorpicker-module': './rota/lib/bootstrap-colorpicker-module.min',
        ckeditor: './rota/lib/ckeditor/ckeditor',
        'ng-ckeditor': './rota/lib/ng-ckeditor',
        ngcurrency: './rota/lib/ng-currency',
        mfb: './rota/lib/mfb-directive',
        imgcrop: './rota/lib/ng-img-crop',
        scroll: './rota/lib/angular-scroll.min',
        ngcontextmenu: './rota/lib/ng-contextmenu',
        treeview: './rota/lib/ivh-treeview',
        //Security
        //JWT Client claims helpers
        jws: './rota/lib/jws-3.0.min',
        rsa: './rota/lib/rsa',
        jsonsanseval: './rota/lib/json-sans-eval',
        crypto: './rota/lib/crypto',
        //grid libs
        pdfMake: './rota/lib/pdfMake.min',
        vfs_fonts: './rota/lib/vfs_fonts',
        //SignalR
        'signalr.hubs': '/signalr/hubs?'
    },
    //#endregion

    //#region Shim
    shim: {
        bootstrap: {
            deps: ['jquery']
        },
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
        'bootstrap-colorpicker-module': {
            deps: ['angular', 'bootstrap']
        },
        fileupload: {
            deps: ['fileapi', 'angular']
        },
        ngcurrency: {
            deps: ['angular']
        },
        jws: { exports: 'jws' },
        rsa: { exports: 'rsa' },
        jsonsanseval: { exports: 'jsonsanseval' },
        crypto: { exports: 'crypto' },
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
    STORAGE_NAME_COMPANY_ID: 'current-companyid',
    STORAGE_NAME_ROLE_ID: 'current-roleid',
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
const storageNameRoleId = window.__constants.STORAGE_NAME_ROLE_ID;
const storageNameCompanyId = window.__constants.STORAGE_NAME_COMPANY_ID;
//header consts
const headerNameCurrentRoleId = window.__constants.HEADER_NAME_ROLE_ID;
const headerNameCurrentCompanyId = window.__constants.HEADER_NAME_COMPANY_ID;
const headerNameLanguage = window.__constants.HEADER_NAME_LANGUAGE;
//current language 
const currentLanguage = localStorage.getItem(window.__constants.ACTIVE_LANG_STORAGE_NAME) || window.__constants.DEFAULT_LANGUAGE;
//debugging indicator
const debugging = window.__globalEnvironment.debugging;
//#endregion

//#region Runtime config - Eliminated block for optimization
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
                    //set current role id
                    const currentRoleId = sessionStorage.getItem(storageNameRoleId);
                    xhr.setRequestHeader(headerNameCurrentRoleId, currentRoleId);
                    //set current company id
                    const currentCompanyId = sessionStorage.getItem(storageNameCompanyId);
                    xhr.setRequestHeader(headerNameCurrentCompanyId, currentCompanyId);
                    //set language for server 
                    xhr.setRequestHeader(headerNameLanguage, currentLanguage);
                    //set authorization token for json & text requests
                    const tokenModel = sessionStorage.getItem(storageNameAuthToken) ||
                        localStorage.getItem(storageNameAuthToken);
                    if (tokenModel) {
                        const token = JSON.parse(tokenModel);
                        xhr.setRequestHeader('Authorization', 'Bearer ' + token.access_token);
                    }
                },
                onXhrComplete(xhr, url) {
                    //if response status is unauthorized,remove tokens if available so that security service redirect to identity server
                    //BUG:there is 500 internal server error with message "authorization is not granted"
                    if (xhr.status === 401) {
                        sessionStorage.removeItem(storageNameAuthToken);
                        localStorage.removeItem(storageNameAuthToken);
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
}
//#endregion

//#region ckEditor Path Setting
//http://stackoverflow.com/questions/8807029/how-do-you-define-the-path-which-ckeditor-uses-to-search-for-config-language-f
if (!debugging)
    window.CKEDITOR_BASEPATH = '/dist/rota/lib/ckeditor/';
//#endregion

//#region Load initial files
require(['config/vendor.index'], (): void => {
    require(['startup'], (): void => {
        //remove progress bar
        const pbar = document.getElementById('progressBar');
        if (pbar && pbar.parentNode) {
            pbar.parentNode.removeChild(pbar);
        }
        //bootstrap app
        angular.element(document).ready(() => {
            angular.bootstrap(document, ['rota-app']);
        });
    });
});
//#endregion
