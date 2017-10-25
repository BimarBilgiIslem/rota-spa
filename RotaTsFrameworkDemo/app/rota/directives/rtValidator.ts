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
                        //ignore initial validation
                        if (!ngModelCnt.$dirty) return common.promise();

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
                        //first set pending status 
                        if (common.isNullOrEmpty(value)) {
                            ngModelCnt.$setValidity(attrs.rtValidator, true);
                            return;
                        }
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
                    //reset validation when model set to pristine
                    scope.$watch(() => ngModelCnt.$pristine,
                        (pristine) => {
                            if (pristine) {
                                ngModelCnt.$setValidity(attrs.rtValidator, true);
                            }
                        });
                }
            }
        }
    }

    const directive = <ng.IDirective>{
        restrict: 'A',
        require: '?ngModel',
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