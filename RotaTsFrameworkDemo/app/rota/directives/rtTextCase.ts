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

import * as _s from "underscore.string";

//#region Interfaces
interface ITextCaseAttributes extends ng.IAttributes {
    rtTextCase: "uppercase" | "title" | "lowercase";
}
//#endregion

//#region Directive
function textCaseDirective($timeout: ng.ITimeoutService) {
    function link($scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ITextCaseAttributes, modelCtrl: ng.INgModelController): void {

        const changeCase = (value: string): string => {
            if (!value) return value;

            let result = value;
            switch (attrs.rtTextCase) {
                case "uppercase":
                    result = value.toLocaleUpperCase();
                    break;
                case "title":
                    result = _s.titleize(value);
                    break;
                case "lowercase":
                    result = value.toLocaleLowerCase();
                    break;
            }

            if (result !== value) {
                modelCtrl.$setViewValue(result);
                modelCtrl.$render();
            }
            return result;
        }

        modelCtrl.$parsers.unshift(changeCase);
    }

    const directive = <ng.IDirective>{
        restrict: 'A',
        require: 'ngModel',
        link: link
    };
    return directive;
}

textCaseDirective.$inject = ['$timeout'];
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.directives.rttextcase', []);
module.directive('rtTextCase', textCaseDirective);
//#endregion

export { textCaseDirective }