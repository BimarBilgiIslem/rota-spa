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

