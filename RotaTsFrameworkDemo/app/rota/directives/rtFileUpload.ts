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

//#region Interfaces
interface IFileUploadAttributes extends ng.IAttributes {
}

interface IFileUploadScope extends ng.IScope {
    fileName: string;
    uploadFiles: (files: IFileInfo[]) => void;
    accept?: string;
    maxUploadSize: string;
}
//#endregion

//#region Directive
function fileUploadDirective(localization: ILocalization, logger: ILogger, config: IMainConfig) {
    function link(scope: IFileUploadScope, element: ng.IAugmentedJQuery, attrs: IFileUploadAttributes, modelCtrl: ng.INgModelController): void {
        scope.maxUploadSize = config.maxFileUploadSize;
        /**
         * Check extension
         * @param name File Name
         */
        const checkExt = name => {
            if (!scope.accept) {
                return true;
            }
            var extensions = scope.accept.replace(/\./g, '').split(',');
            var ext = name.split('.').pop().toLowerCase();

            if (extensions.indexOf(ext) === -1) {
                logger.toastr.warn({ message: localization.getLocal('rota.invalidfiletypemessage', scope.accept, name) });
                return false;
            }
            return true;
        };

        scope.uploadFiles = (files: IFileInfo[]): void => {
            if (!files || !files.length) return;
            //upload 
            files.forEach((file: IFileInfo): void => {
                //check ext
                if (checkExt(file.name)) {
                    modelCtrl.$setViewValue(file);
                    scope.fileName = file.name;
                    return;
                }
                scope.fileName = null;
                modelCtrl.$setViewValue(null);
            });
        }
    }

    //Directive definition
    const directive = <ng.IDirective>{
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngDisabled: '=?',
            accept: '@'
        },
        link: link,
        template: '<div class="input-group">' +
        '<input ng-model="fileName" readonly type="text" class="form-control" ph-i18n="rota.dosyaseciniz"/>' +
        '<span class="input-group-btn">' +
        '<button type="button" ngf-multiple="false" ngf-select-disabled=ngDisabled ngf-accept=accept ' +
        'ngf-select="uploadFiles($files)" ngf-max-size=maxUploadSize class="btn btn-primary" uib-tooltip="{{::\'rota.tt_dosyasecmekicintiklayiniz\' | i18n}}">' +
        '<i class="fa fa-upload"></i>' +
        '</button></span>' +
        '</div>'
    };
    return directive;
}
fileUploadDirective.$inject = ['Localization', 'Logger', 'Config'];
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.directives.rtfileupload', ['ngFileUpload']);
module.directive('rtFileUpload', fileUploadDirective);
//#endregion

export { fileUploadDirective }
