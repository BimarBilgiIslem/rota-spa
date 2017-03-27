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

interface IEditorScope extends ng.IScope {
    config: any;
}

//#region rtEditor
function editorDirective(localization: ILocalization) {
    const directive = <ng.IDirective>{
        restrict: 'EA',
        require: 'ngModel',
        template: '<ng-ckeditor ng-config="config" ng-model="ngModel" ng-disabled="ngDisabled" skin="moono" remove-buttons="Image" remove-plugins="iframe,flash,smiley"></ng-ckeditor>',
        link: function (scope: IEditorScope, elem, attrs) {
            scope.config = {
                language: localization.currentLanguage && localization.currentLanguage.code.substr(0, 2)
            }
        },
        scope: {
            ngModel: '=',
            ngDisabled: '='
        }
    };
    return directive;
}

editorDirective.$inject = ['Localization'];
//#endregion

//#region Register
angular.module('rota.directives.rteditor', [])
    .directive('rtEditor', editorDirective);
//#endregion

export { editorDirective }