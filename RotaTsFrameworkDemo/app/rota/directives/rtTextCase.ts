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