//#region Interfaces
interface IValidatorAttributes extends ng.IAttributes {
    rtValidator: string;
}
//#endregion

//#region Directive
function validatorDirective(common: ICommon, constants: IConstants, localization: ILocalization) {

    function link(scope: ng.IScope,
        element: ng.IAugmentedJQuery,
        attrs: IValidatorAttributes,
        ngModelCnt: ng.INgModelController): void {

        if (!common.isNullOrEmpty(attrs.rtValidator)) {
            const vm = scope[constants.routing.CONTROLLER_ALIAS_NAME];
            if (vm) {
                const validators = vm.validators as IValidators;
                if (!validators) throw new Error(constants.errors.NO_VALIDATORS_DEFINED);

                const validator = validators.getValidation(attrs.rtValidator);
                if (!validator) throw new Error(constants.errors.NO_VALIDATOR_DEFINED.replace('{0}', attrs.rtValidator));

                if (!validator.enabled) return;
                //register asyncvalidators when changes occured
                if (validator.triggerOn & TriggerOn.Changes) {
                    ngModelCnt.$asyncValidators[attrs.rtValidator] = (modelValue, viewValue) => {
                        var value = modelValue || viewValue;
                        return validators.runValidation(validator, TriggerOn.Changes, value)
                            .catch((result: IValidationResult) => {
                                scope[attrs.rtValidator] = result.message ||
                                    (result.messageI18N && localization.getLocal(result.messageI18N));
                                return common.rejectedPromise();
                            });
                    };
                }
                //register blur event 
                if (validator.triggerOn & TriggerOn.Blur) {
                    //element must be input type
                    const inputElem = element[0] instanceof HTMLInputElement ? element : element.find('input');
                    inputElem && $(inputElem).bind('blur', () => {
                        const value = ngModelCnt.$modelValue || ngModelCnt.$viewValue;

                        validators.runValidation(validator, TriggerOn.Blur, value)
                            .then(() => {
                                ngModelCnt.$setValidity(attrs.rtValidator, true);
                            },
                            (result: IValidationResult) => {
                                scope[attrs.rtValidator] = result.message ||
                                    (result.messageI18N && localization.getLocal(result.messageI18N));
                                ngModelCnt.$setValidity(attrs.rtValidator, false);
                            });
                    });
                }
            }
        }
    }

    const directive = <ng.IDirective>{
        restrict: 'A',
        require: 'ngModel',
        link: link
    };
    return directive;
}
validatorDirective.$inject = ['Common', 'Constants', 'Localization'];
//#endregion

//#region Register
angular.module('rota.directives.rtvalidator', [])
    .directive('rtValidator', validatorDirective);
//#endregion

export { validatorDirective }