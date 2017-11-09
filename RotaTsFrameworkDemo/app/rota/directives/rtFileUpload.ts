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
    uploadedFile: IUploadedFile;
    uploadFiles: (files: IFileInfo[]) => void;
    accept?: string;
    maxUploadSize: string;
    onUploaded: (file: { file: IFileInfo }) => ng.IPromise<IFileUploadResponseData>;
}
//#endregion

//#region Directive
function fileUploadDirective(localization: ILocalization, logger: ILogger, config: IMainConfig) {
    function link(scope: IFileUploadScope,
        element: ng.IAugmentedJQuery,
        attrs: IFileUploadAttributes,
        modelCtrl: ng.INgModelController): void {
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
            //upload de
            files.forEach((file: IFileInfo): void => {
                //check ext
                if (checkExt(file.name)) {
                    //create model for upload progress
                    scope.uploadedFile = {
                        name: file.name,
                        isLoaded: false,
                        loading: true
                    }
                    //call uploaded event
                    const updateResult = scope.onUploaded({ file: file });
                    //result
                    updateResult.then((result: IFileUploadResponseData): void => {
                        scope.uploadedFile.isLoaded = true;
                        modelCtrl.$setViewValue(result.newUid);
                    }, (): void => {
                        //fail
                    }, (args: angular.angularFileUpload.IFileProgressEvent): void => {
                        scope.uploadedFile.total = args.total;
                        scope.uploadedFile.loaded = args.loaded;
                    });
                    return;
                }
            });
        }
    }

    //Directive definition
    const directive = <ng.IDirective>{
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngDisabled: '=?',
            accept: '@',
            onUploaded: '&?'
        },
        link: link,
        template: '<div class="rt-file-upload"><div class="input-group">' +
        '<input ng-model="uploadedFile.name" readonly type="text" class="form-control" ph-i18n="rota.dosyaseciniz"/>' +
        '<div class="progress-wrapper" ng-show="uploadedFile.loading && !uploadedFile.isLoaded"><round-progress color="#337ab7" max="uploadedFile.total" ' +
        'current="uploadedFile.loaded" radius="9" stroke="3"></round-progress></div>' +
        '<span class="input-group-btn">' +
        '<button type="button" ngf-multiple="false" ngf-select-disabled=ngDisabled ngf-accept=accept ' +
        'ngf-select="uploadFiles($files)" ngf-max-size=maxUploadSize class="btn btn-primary" uib-tooltip="{{::\'rota.tt_dosyasecmekicintiklayiniz\' | i18n}}">' +
        '<i class="fa fa-upload"></i>' +
        '</button></span>' +
        '</div></div>'
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
