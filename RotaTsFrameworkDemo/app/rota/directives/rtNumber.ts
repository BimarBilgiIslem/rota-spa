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
interface INumberDirectiveAttrs extends ng.IAttributes {
    rtNumber: number;
    minValue?: number;
    maxValue?: number;
    required?: boolean;
}
//#endregion

//#region ngCurrency wrapper
function numberDirective($compile: ng.ICompileService, constants: IConstants) {

    function link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: INumberDirectiveAttrs): void {
        element.attr('ng-currency', '');
        element.attr('fraction', attrs.rtNumber || 0);
        element.attr('min', attrs.minValue || constants.MIN_NUMBER_VALUE);
        element.attr('max', attrs.maxValue || constants.MAX_NUMBER_VALUE);
        element.attr('currency-symbol', '');
        //required attr does not work in ngCurrency,ng-required works !
        if (angular.isDefined(attrs.required))
            element.attr('ng-required', 'true');
        //remove rtnumber to stop infinite loop
        element.removeAttr("rt-number");
        $compile(element)(scope);
    }

    //#region Directive Definition
    const directive = <ng.IDirective>{
        restrict: 'A',
        terminal: true,
        priority: 1000,
        link: link
    };
    return directive;
    //#endregion
}
//#endregion

//#region Injections
numberDirective.$inject = ['$compile', 'Constants'];
//#endregion

//#region Register
angular.module('rota.directives.rtnumber', [])
    .directive('rtNumber', numberDirective);
//#endregion
export { numberDirective }