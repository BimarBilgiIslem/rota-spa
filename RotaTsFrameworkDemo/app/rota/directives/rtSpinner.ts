//#region Imports
import * as spinner from "spinner";
//#endregion

//#region Interfaces
interface ISpinAttributes extends ng.IAttributes {
    rtSpinner: string;
}

interface ISpinScope extends ng.IScope {
    rtSpinner: Spinner;
}
//#endregion

//#region Directive
function spinnerDirective() {
    function link(scope: ISpinScope, element: ng.IAugmentedJQuery, attrs: ISpinAttributes): void {
        scope.$watch(attrs.rtSpinner, options => {
            if (scope.rtSpinner) {
                scope.rtSpinner.stop();
            }
            scope.rtSpinner = new spinner(options);
            scope.rtSpinner.spin(element[0]);
        }, true);
    }

    const directive = <ng.IDirective>{
        restrict: 'A',
        link: link
    };
    return directive;
}
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.directives.rtspinner', []);
module.directive('rtSpinner', spinnerDirective);
//#endregion

export { spinnerDirective }