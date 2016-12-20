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