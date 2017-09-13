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
interface IFocusAttributes extends ng.IAttributes {
    rtFocus: any;
}
//#endregion

//#region Directive
function rtFocusDirective($timeout: ng.ITimeoutService) {
    function link($scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: IFocusAttributes): void {
        var focus = () => {
            $timeout(() => {
                const isInput = element[0] instanceof HTMLInputElement ||
                    element[0] instanceof HTMLButtonElement;
                if (isInput) {
                    element[0].focus();
                } else {
                    const input = element.find('input');
                    input && typeof input.focus == "function" && input.focus();
                }
            }, 500);
        };
        //lazy focus
        if (attrs.rtFocus) {
            $scope.$watch(attrs.rtFocus, newValue => {
                focus();
            });
        } else {
            //initial focus
            focus();
        }
    }

    const directive = <ng.IDirective>{
        restrict: 'A',
        priority: -1,
        link: link
    };
    return directive;
}

rtFocusDirective.$inject = ['$timeout'];
//#endregion

//#region Register
angular.module('rota.directives.rtfocus', [])
    .directive('rtFocus', rtFocusDirective);
//#endregion

export { rtFocusDirective }