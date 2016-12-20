interface IEditorScope extends ng.IScope {
    config: any;
}

//#region rtEditor
function editorDirective(localization: ILocalization) {
    const directive = <ng.IDirective>{
        restrict: 'EA',
        require: 'ngModel',
        template: '<ng-ckeditor ng-config="config" ng-model="ngModel" ng-disabled="ngDisabled" skin="moono" remove-buttons="Image" remove-plugins="iframe,flash,smiley"></ng-ckeditor>',
        link: function (scope: IEditorScope, elem, attrs) {
            scope.config = {
                language: localization.currentLanguage && localization.currentLanguage.code.substr(0, 2)
            }
        },
        scope: {
            ngModel: '=',
            ngDisabled: '='
        }
    };
    return directive;
}

editorDirective.$inject = ['Localization'];
//#endregion

//#region Register
angular.module('rota.directives.rteditor', [])
    .directive('rtEditor', editorDirective);
//#endregion

export { editorDirective }