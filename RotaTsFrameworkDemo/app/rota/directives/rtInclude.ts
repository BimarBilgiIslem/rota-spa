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
interface IIncludeAttributes extends ng.IAttributes {
    rtInclude: string;
    name: string;
}
//#endregion

//#region ng-include wrapper
function includeDirective(routing: IRouting, common: ICommon) {
    function compile(cElement: ng.IAugmentedJQuery, cAttrs: IIncludeAttributes) {

        function getRelativePath(path: string): string {
            const folders = path.split("/");
            folders.pop();
            return folders.join("/");
        }

        let htmlMarkup = `<ng-include src="\'{0}\'"></ng-include>`;

        const relativePath = getRelativePath((routing.current.templateUrl || routing.current.hierarchicalMenu.templateUrl) as string);
        const absoluteFilePath = common.getBasePath() + common.addTrailingSlash(relativePath) + (cAttrs.name || cAttrs.rtInclude);
        htmlMarkup = htmlMarkup.replace('{0}', absoluteFilePath);

        cElement.append(htmlMarkup);
        return (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: IIncludeAttributes): void => {
        }
    }
    //#region Directive Definition
    const directive = <ng.IDirective>{
        restrict: 'AE',
        replace: true,
        compile: compile
    };
    return directive;
    //#endregion
}

//#region Injections
includeDirective.$inject = ['Routing', 'Common'];
//#endregion
//#endregion

//#region Register
angular.module('rota.directives.rtinclude', [])
    .directive('rtInclude', includeDirective);
//#endregion

export { }