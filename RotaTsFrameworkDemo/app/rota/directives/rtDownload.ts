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
import * as $ from "jquery";

//#region Interfaces & Scopes
interface IDownloadAttributes extends ng.IAttributes {
    rtDownload: string;
}

interface IDownloadScope extends ng.IScope {
    options: IDownloadOptions;
}
//#endregion

//#region Download file within IFrame or window
function downloadDirective($rootScope: IRotaRootScope, constants: IConstants, common: ICommon) {
    const targetContainerName = "targetContainer";
    const formId = "rtDownload.Form";
    //const hiddenStyle = "position:fixed;display:none;top:-1px;left:-1px;";
    const hiddenStyle = "position:fixed;display:none;top:-1px;left:-1px;";
    function link(scope: IDownloadScope, element: ng.IAugmentedJQuery, attrs: IDownloadAttributes) {
        //#region Get Elems
        /**
         * Get IFrame in which download process will processed
         * @param name
         */
        const getIFrame = (): HTMLElement => {
            let iFrame = $('iframe#fileDownloadFrame') as ng.IAugmentedJQuery;
            if (!(iFrame && iFrame.length > 0)) {
                iFrame = $(`<iframe id='fileDownloadFrame'
                                    name='${targetContainerName}' 
                                    src='about:blank'
                                    style='${hiddenStyle}'/>`) as ng.IAugmentedJQuery;

                //append document node as global
                document.body.appendChild(iFrame[0]);
            }
            return iFrame[0];
        }
        /**
         * Get form elem targeted to iframe
         * @param options
         * @param target
         */
        const getForm = (url: string, context: HTMLElement): ng.IAugmentedJQuery => {
            //remove previous form
            $(`form#${formId}`, context).remove();
            //add token to url
            const secureLink = common.appendAccessTokenToUrl(url);
            return $(`<form method='POST' 
                            id=${formId}  
                            action='${secureLink}' 
                            style='${hiddenStyle}'
                            target='${targetContainerName}'/>`) as ng.IAugmentedJQuery;
        }
        //#endregion

        //#region Download methods
        const startDownload = (options: IDownloadOptions) => {
            if (common.isNullOrEmpty(options.url)) throw "download url is missing";
            //get container in which download process will occur
            const container = (options.inline === true) ? document.body : getIFrame();
            if (container) {
                const formElem = getForm(options.url, container);
                //set form body params
                if (common.isNotEmptyObject(options.filter)) {
                    const filterArray = common.serializeAsNameValuePairs(options.filter);
                    filterArray.forEach(
                        item => formElem.append(`<input type='hidden' name='${item.name}' value='${item.value}'/>`));
                }
                //append elements
                container.appendChild(formElem[0]);

                if (options.inline) {
                    window.open('about:blank',
                        targetContainerName,
                        'height=950, width=950, status=yes, resizable=yes, scrollbars=yes,' +
                        ' toolbar=no, location=no, menubar=no left=0, top=10');
                } else {
                    $rootScope.$broadcast(constants.events.EVENT_AJAX_STARTED);
                    //wait for download process then send out signal.
                    $(container).bind('load', () => {
                        $rootScope.$broadcast(constants.events.EVENT_AJAX_FINISHED);
                        $rootScope.$broadcast(constants.events.EVENT_FINISH_FILEDOWNLOAD);
                    });
                }
                //actual start
                formElem.submit();
            }
        };
        //#endregion

        //#region Starters
        if (common.isNullOrEmpty(attrs.rtDownload)) {
            /**
            * Listen for download options event
            * Element usage 
            */
            scope.$on(constants.events.EVENT_START_FILEDOWNLOAD,
                (e, options: IDownloadOptions) => {
                    e.preventDefault();
                    if (!options) return;
                    startDownload(options);
                });
        } else {
            /**
             * Attribute usage
             */
            element.bind('click',
                (e) => {
                    e.preventDefault();
                    if (common.isNullOrEmpty(attrs.rtDownload)) return;
                    startDownload({ url: attrs.rtDownload });
                });
        }
        //#endregion
    }
    //#region Directive Definition
    const directive = <ng.IDirective>{
        restrict: 'AE',
        link: link,
        scope: {
            options: '=?'
        }
    };
    return directive;
    //#endregion
}
//#region Injections
downloadDirective.$inject = ["$rootScope", "Constants", "Common"];
//#endregion
//#endregion

//#region Register
angular.module('rota.directives.rtdownload', [])
    .directive('rtDownload', downloadDirective);
//#endregion

export { downloadDirective }