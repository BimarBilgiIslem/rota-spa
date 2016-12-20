interface IFormAttributes extends ng.IAttributes {
    name: string;
}

function formDirective() {
    const directive = <ng.IDirective>{
        replace: true,
        restrict: 'EA',
        transclude: true,
        template: (element: ng.IAugmentedJQuery, attrs: IFormAttributes): string => {
            return attrs.name ? `<div ng-form="${attrs.name}" isolate-form ng-init="vm.initFormScope(this)"><ng-transclude></ng-transclude></div>` :
                '<form class="form-horizontal" name="vm.formScope.rtForm" disable-enter novalidate ng-init="vm.initFormScope(this)">' +
                '<ng-transclude></ng-transclude></form>';
        }
    };
    return directive;
}
/**
 * Workaround for nested forms to fix validation seperately 
 * @description http://stackoverflow.com/questions/19333544/skip-nested-forms-validation-with-angularjs
 */
const isolateForm = function () {
    return {
        restrict: 'A',
        require: '?form',
        link: function (scope, elm, attrs, ctrl) {
            if (!ctrl) {
                return;
            }

            // Do a copy of the controller
            var ctrlCopy: any = {};
            angular.copy(ctrl, ctrlCopy);

            // Get the parent of the form
            var parent = elm.parent().controller('form');
            // Remove parent link to the controller
            parent.$removeControl(ctrl);

            // Replace form controller with a "isolated form"
            var isolatedFormCtrl = {
                $setValidity: function (validationToken, isValid, control) {
                    ctrlCopy.$setValidity(validationToken, isValid, control);
                    parent.$setValidity(validationToken, true, ctrl);
                },
                $setDirty: function () {
                    elm.removeClass('ng-pristine').addClass('ng-dirty');
                    ctrl.$dirty = true;
                    ctrl.$pristine = false;
                }
            };
            angular.extend(ctrl, isolatedFormCtrl);
        }
    };
};
/**
 * Disable enter key for submitting form or closing modal
 */
var disableEnter = function (constants: IConstants) {
    return {
        link: function (scope, elem) {
            elem.bind('keydown', function (e) {
                if (e.keyCode === constants.key_codes.ENTER && !e.ctrlKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            });
        }
    };
};
disableEnter.$inject = ['Constants'];
//#region Register
angular.module('rota.directives.rtform', [])
    .directive('rtForm', formDirective)
    .directive('isolateForm', isolateForm)
    .directive('disableEnter', disableEnter);

//#endregion

export { formDirective }