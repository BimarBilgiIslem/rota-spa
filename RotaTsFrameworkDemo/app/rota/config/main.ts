//#region Import main configuration
import "./main.configuration"
import { IRotaApp } from './app.interface';
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
window.require.config({
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
    window.require.config({
        paths: xpaths
    });
}
//#endregion

//#region ckEditor Path Setting
//http://stackoverflow.com/questions/8807029/how-do-you-define-the-path-which-ckeditor-uses-to-search-for-config-language-f
if (!debugging) {
    window.CKEDITOR_BASEPATH = '/dist/rota/lib/ckeditor/';
}
//#endregion

//#region Load initial files
//load vendor specific files
window.require(['config/vendor.index'], (): void => {
    //load startup along with rota fr
    window.require(['startup'], (app: IRotaApp): void => {
        //remove progress bar
        const pbar = document.getElementById('progressBar');
        if (pbar && pbar.parentNode) {
            pbar.parentNode.removeChild(pbar);
        }
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
        });
    });
});
//#endregion
