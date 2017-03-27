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
interface II18NAttrs extends ng.IAttributes {
    i18n: string;
    phI18n: string;
}

//#endregion

//#region Directive
i18NDirective.$inject = ['Localization'];
function i18NDirective(localization: ILocalization) {
    function link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: II18NAttrs): void {
        element.text(localization.getLocal(attrs.i18n) || 'Resource (' + attrs.i18n + ')');
    }

    const directive = <ng.IDirective>{
        restrict: 'A',
        link: link
    };
    return directive;
}

i18NPlaceHolderDirective.$inject = ['Localization'];
function i18NPlaceHolderDirective(localization: ILocalization) {
    function link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: II18NAttrs): void {
        element.attr('placeholder', localization.getLocal(attrs.phI18n) || 'Resource (' + attrs.phI18n + ')');
    }

    const directive = <ng.IDirective>{
        restrict: 'A',
        link: link
    };
    return directive;
}
//#endregion

//#region Register
angular.module('rota.directives.rtI18n', [])
    .directive('i18n', i18NDirective)
    .directive('phI18n', i18NPlaceHolderDirective);
//#endregion

export { }

