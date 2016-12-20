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
        const relativePath = getRelativePath(routing.current.templateUrl as string);

        const absoluteFilePath = common.addTrailingSlash(relativePath) + (cAttrs.name || cAttrs.rtInclude);
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