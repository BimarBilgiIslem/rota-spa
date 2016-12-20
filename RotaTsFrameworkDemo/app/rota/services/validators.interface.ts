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
     * Crud flags indicates that which crud types validation will be applied
     */
    crudFlag?: CrudType;
    /**
     * Flags that indicates when validation get run ,default Changes | Action
     */
    triggerOn?: TriggerOn;
}

//#endregion

//#region Validation Service
interface IValidators extends IBaseService {
    controller: IBaseController;
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


