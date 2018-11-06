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
import "fileDownload";

//#region Interfaces & Scopes
interface IDownloadAttributes extends ng.IAttributes {
    rtDownload: string;
}

interface IDownloadScope extends ng.IScope {
    options: IDownloadOptions;
}
//#endregion


//#region Download file within IFrame or window
function downloadDirective(fileDownload: IFileDownload, common: ICommon, constants: IConstants) {
    function link(scope: IDownloadScope, element: ng.IAugmentedJQuery, attrs: IDownloadAttributes) {

        const startDownload = (options: IDownloadOptions) => {
            fileDownload.download(options);
        }

        /**
         * Attribute usage
         */
        element.bind('click',
            (e) => {
                e.preventDefault();
                if (common.isNullOrEmpty(attrs.rtDownload)) return;
                startDownload({ url: attrs.rtDownload, ...attrs.downloadOptions });
            });

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
downloadDirective.$inject = ["FileDownload", "Common", "Constants"];
//#endregion
//#endregion

//#region Register
angular.module('rota.directives.rtdownload', [])
    .directive('rtDownload', downloadDirective);
//#endregion

export { downloadDirective }
