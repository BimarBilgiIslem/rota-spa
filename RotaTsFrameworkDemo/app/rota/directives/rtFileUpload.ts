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
    ngModel: any;
    accept?: string;
    minSize?: number;
    maxSize?: number;
    required?: boolean;
}

interface IFileUploadScope extends ng.IScope {
    selfile?: IFileInfo;
}
//#endregion

//#region Directive
function fileUploadDirective(localization: ILocalization, logger: ILogger) {
    function compile(tElement: ng.IAugmentedJQuery, tAttrs: IFileUploadAttributes) {
        const $file = $('input[type=file]', tElement);
        //Model
        $file.attr('ng-model', tAttrs.ngModel);
        //Accept
        if (angular.isDefined(tAttrs.accept)) {
            $file.attr('accept', tAttrs.accept);
        }
        //Min Size
        if (angular.isDefined(tAttrs.minSize)) {
            $file.attr('ngf-min-size', tAttrs.minSize);
        }
        //Max Size
        if (angular.isDefined(tAttrs.maxSize)) {
            $file.attr('ngf-max-size', tAttrs.maxSize);
        }
        //Required
        if (angular.isDefined(tAttrs.required)) {
            $file.attr('required', '');
        }
        return (scope: IFileUploadScope, element: ng.IAugmentedJQuery, attrs: IFileUploadAttributes, modelCtrl: ng.INgModelController): void => {
            const checkExt = name => {
                if (!attrs.accept) {
                    return true;
                }
                var extensions = attrs.accept.replace(/\./g, '').split(',');
                var ext = name.split('.').pop().toLowerCase();

                if (extensions.indexOf(ext) === -1) {
                    logger.toastr.warn({ message: localization.getLocal('rota.invalidfiletypemessage', attrs.accept, name) });
                    return false;
                }
                return true;
            };

            scope.$watch(attrs.ngModel, (file: IFileInfo) => {
                if (file) {
                    if (checkExt(file.name)) {
                        scope.selfile = file;
                        return;
                    }
                }
                scope.selfile = null;
            });
        }
    }

    //Directive definition
    const directive = <ng.IDirective>{
        restrict: 'E',
        require: 'ngModel',
        compile: compile,
        template: '<div class="input-group rt-file-upload">' +
        '<input ng-model="selfile.name" readonly type="text" class="form-control"' +
        'ph-i18n="rota.dosyaseciniz"/><span class="input-group-btn">' +
        '<div class="fileUpload btn btn-primary" ' +
        'uib-tooltip="{{::\'rota.tt_dosyasecmekicintiklayiniz\' | i18n}}"> ' +
        '<i class="fa fa-upload"></i><input type="file" name="file" ngf-select class="upload"></div></span></div>'
    };
    return directive;
}
fileUploadDirective.$inject = ['Localization', 'Logger'];
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.directives.rtfileupload', ['ngFileUpload']);
module.directive('rtFileUpload', fileUploadDirective);
//#endregion

export { fileUploadDirective }
