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

//#region Models
/**
 * Validation result
 */
interface IValidationResult {
    /**
     * Validation message
     */
    message?: string;
    /**
     * Validation i18n key
     */
    messageI18N?: string;
}
/**
 * Validation args is passed as parameter to validation function
 */
interface IValidationArgs {
    validator: IValidationItem;
    modelValue?: any;
    triggeredOn: TriggerOn;
}
/**
 * Validation item
 */
interface IValidationItem {
    /**
     * Validation method which returns promise of any
     */
    func: (args: IValidationArgs) => IP<IValidationResult> | IP<any>;
    /**
     * Optional validation name which is handy for enable/disable/remove operations
     */
    name?: string;
    /**
     * Enable validation flag
     */
    enabled?: boolean;
    /**
     * Order value , in which validaions sorted 
     */
    order?: number;
    /**
     * Flags that indicates when validation get run ,default Changes | Action
     */
    triggerOn?: TriggerOn;
}

//#endregion

//#region Validation Service
interface IValidators extends IBaseService {
    controller: any;
    /**
  * Custom Validators
  */
    validators: IValidationItem[];
    /**
    * Add new validation
    * @param item Validation Item
    * @description Adding order will be used if not order prop defined,
    * name prop is handy for dynamic validation enable/disable etc
    */
    addValidation(item: IValidationItem): IValidators;
    /**
    * Get validation object by name
    * @param name Validation name
    */
    getValidation(name: string): IValidationItem;
    /**
    * Remove validation by name
    * @param name Validation name
    */
    removeValidation(name: string): void;
    /**
    * This method is called internally as validation pipline in process
    * @returns it will return failed validation result if any
    * @description Validators is sorted and filtered by enabled prop
    */
    applyValidations(validators?: IValidationItem[]): IP<IValidationResult>;
    /**
    * This method is called internally to get run all validators
    * @param validators Registered validators
    */
    runChainableValidations(validators: IValidationItem[]): IP<any>;
    /**
    * Run validator
    * @param validator Validator
    * @param params Optional params
    */
    runValidation(validator: IValidationItem, triggerOn: TriggerOn, value?: any): IP<IValidationResult>;
}
//#endregion

//#region Enums
const enum TriggerOn {
    Blur = 1,
    Changes = 2,
    Action = 4
}
//#endregion


