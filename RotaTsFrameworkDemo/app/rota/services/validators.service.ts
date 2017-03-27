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

/**
 * Creates custom validators used by controllers.
 */
class Validators implements IValidators {
    //#region Props
    serviceName: 'Validator Service';
    /**
    * Custom Validators
    */
    validators: IValidationItem[];
    /**
     * Container controller
     */
    controller: IBaseController;
    //#endregion

    //#region Init
    constructor(private common: ICommon, private constants: IConstants) {
        this.validators = [];
    }
    //#endregion

    //#region Methods
    /**
    * Add new validation
    * @param item Validation Item
    * @description Adding order will be used if not order prop defined,
    * name prop is handy for dynamic validation enable/disable etc
    */
    addValidation(item: IValidationItem): IValidators {
        if (!item.func)
            throw new Error(this.constants.errors.NO_VALIDATION_FUNC_DEFINED);

        //#region Defaults
        if (!item.order) {
            item.order = this.validators.length + 1;
        }

        if (!item.enabled) {
            item.enabled = true;
        }

        if (!item.triggerOn) {
            item.triggerOn = TriggerOn.Action | TriggerOn.Changes;
        }

        if (!item.crudFlag) {
            item.crudFlag = CrudType.Create | CrudType.Update;
        }
        //#endregion

        this.validators.push(item);
        return this;
    }
    /**
    * Get validation object by name
    * @param name Validation name
    */
    getValidation(name: string): IValidationItem {
        return _.findWhere(this.validators, { name: name });
    }
    /**
    * Remove validation by name
    * @param name Validation name
    */
    removeValidation(name: string): void {
        const validator = _.findWhere(this.validators, { name: name });
        const validatorIndex = this.validators.indexOf(validator);

        if (validatorIndex > -1) {
            this.validators.slice(validatorIndex, 1);
        }
    }
    /**
    * This method is called internally as validation pipline in process
    * @returns it will return failed validation result if any
    * @description Validators is sorted and filtered by enabled prop
    */
    applyValidations(validators?: IValidationItem[]): ng.IPromise<any> {
        //filter
        const validatorsToApply = validators || this.validators;
        const filteredValidators = _.where(validatorsToApply, { enabled: true });
        const sortedValidators = _.sortBy(filteredValidators, 'order');
        //run 
        return this.runChainableValidations(sortedValidators);
    }
    /**
    * This method is called internally to get run all validators
    * @param validators Registered validators
    */
    runChainableValidations(validators: IValidationItem[]): ng.IPromise<IValidationResult> {
        let result = this.common.promise<IValidationResult>();
        //iterate chainable methods
        for (let i = 0; i < validators.length; i++) {
            result = ((promise: ng.IPromise<IValidationResult>, validator: IValidationItem) => {
                return promise.then(() => {
                    return this.runValidation(validator, TriggerOn.Action);
                });
            })(result, validators[i]);
        }
        return result;
    }
    /**
     * Run validator
     * @param validator Validator
     */
    runValidation(validator: IValidationItem, triggerOn: TriggerOn, value?: any): IP<IValidationResult> {
        const args: IValidationArgs = { modelValue: value, triggeredOn: triggerOn, validator: validator };
        return validator.func.call(this.controller, args);
    }
    //#endregion
}

//#region Injection
Validators.$inject = ['Common', 'Constants'];
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.validators', []);
module.service('Validators', Validators);
//#endregion

export { Validators }