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

//#region Imports
import InjectableObject from "./injectableobject";
//#endregion
/**
 * Base controller for all controllers.
 * @description Form directive support,Logger shortcuts,Rota service references
 */
class BaseController extends InjectableObject {
    //#region Props
    //#region Notification services
    /**
            * Notification Service
            * @returns {IBaseLogger}
            */
    get notification(): INotification { return this.logger.notification; }
    /**
     * Toastr Service
     * @returns {IBaseLogger}
     */
    get toastr(): IToastr { return this.logger.toastr; }
    /**
     * Console Service
     * @returns {IBaseLogger}
     */
    get console(): IConsole { return this.logger.console; }

    //#endregion
    /**
     * Registered events to store off-callbacks
     */
    protected events: Function[];
    /**
    * Custom Validators
    */
    protected validators: IValidators;
    /**
     * Flag that indcicates controller scope has been destroyed
     */
    private destroyed: boolean = false;
    //#endregion

    //#region Bundle Services
    static injects = InjectableObject.injects.concat(['$document', '$rootScope', '$scope', '$window', '$stateParams', '$q',
        'Logger', 'Common', 'Dialogs', 'Routing', 'Config', 'Localization', 'stateInfo', 'hotkeys', 'TitleBadges',
        'Constants']);
    //System services
    protected $rootScope: IRotaRootScope;
    protected $scope: ng.IScope;
    protected $window: ng.IWindowService;
    protected $stateParams: ng.ui.IStateParamsService;
    protected $document: duScroll.IDocumentService;
    protected hotkeys: ng.hotkeys.HotkeysProvider;
    protected $q: ng.IQService;
    //Rota services
    protected titlebadges: ITitleBadges;
    protected constants: IConstants;
    protected stateInfo: IStateInfo;
    protected logger: ILogger;
    protected common: ICommon;
    protected dialogs: IDialogs;
    protected config: IMainConfig;
    protected routing: IRouting;
    protected localization: ILocalization;
    //#endregion

    //#region Init
    constructor(bundle: IBundle, public options?: IBasePageOptions) {
        super(bundle);

        this.options = angular.extend({ formName: this.constants.controller.DEFAULT_FORM_NAME }, options);
        //set form watchers
        this.$scope.$watch(`${this.options.formName}.$dirty`, (newValue?: boolean) => {
            this.onFormDirtyFlagChanged(!!newValue);
        });
        this.$scope.$watch(`${this.options.formName}.$invalid`, (newValue?: boolean) => {
            this.onFormInvalidFlagChanged(!!newValue);
        });
        //init 
        this.events = [];
        this.on("$destroy", this.destroy.bind(this));
        //hook on state exiting
        if (this.isAssigned((this as IBaseController).onExit)) {
            this.on(this.constants.events.EVENT_STATE_CHANGE_START,
                (event: ng.IAngularEvent,
                    toState: IRotaState,
                    toParams: ng.ui.IStateParamsService,
                    fromState: IRotaState) => {
                    const menu = this.routing.getActiveMenu(toState);
                    if (menu !== this.routing.activeMenu) {
                        (this as IBaseController).onExit(event, toState, toParams, fromState);
                    }
                });
        }
        //Scroll
        if (this.options.scrollToTop) {
            this.$document.duScrollTop(0, 500);
        }
        //Current url 
        this.stateInfo.url = this.routing.currentUrl;
    }
    /**
     * Controller getting destroyed
     */
    protected destroy(): void {
        this.destroyed = true;
        this.events.forEach(fn => {
            fn();
        });
        this.events = null;
    }
    /**
     * Init bundle
     * @param bundle
     */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        //system
        this.$rootScope = bundle.services['$rootscope'];
        this.$scope = bundle.services['$scope'];
        this.$window = bundle.services["$window"];
        this.$stateParams = bundle.services["$stateparams"];
        this.$document = bundle.services["$document"];
        this.hotkeys = bundle.services["hotkeys"];
        this.$q = bundle.services['$q'];
        //rota
        this.logger = bundle.services["logger"];
        this.common = bundle.services["common"];
        this.dialogs = bundle.services["dialogs"];
        this.config = bundle.services["config"];
        this.routing = bundle.services["routing"];
        this.localization = bundle.services["localization"];
        this.stateInfo = bundle.services["stateinfo"];
        this.titlebadges = bundle.services["titlebadges"];
        this.constants = bundle.services["constants"];
    }
    //#endregion

    //#region Methods
    /**
     * Returns true if controller state is active
     */
    isActiveState(): boolean {
        return this.routing.isActive(this.stateInfo.stateName);
    }
    /**
     * Check is value assigned
     * @param value Any value
     */
    isAssigned(value: any): boolean {
        return this.common.isAssigned(value);
    }
    /**
     * Register the event
     * @param eventName EventName
     * @param fn Function
     */
    on(eventName: string, fn: (...args: any[]) => void): void {
        const offFn = this.$scope.$on(eventName, fn);
        this.events.push(offFn);
    }
    /**
     * Broadcast a event
     * @param eventName Event name
     * @param params Params
     */
    broadcast(eventName: string, ...params: any[]): void {
        this.$scope.$broadcast(eventName, ...params);
    }
    /**
     * Check enum flag operation
     * @param value Enum flags
     * @param flag Value
     */
    checkEnumFlag(value: number, flag: number): boolean {
        return !!(value & flag);
    }
    /**
    * Validation service validate implementation    
    */
    protected applyValidatitons(): ng.IPromise<IParserException> {
        const resultDefer = this.$q.defer<IParserException>();
        //filter by crud flag
        const validatorsFiltered = _.filter(this.validators.validators, (item: IValidationItem) => {
            return !!(item.triggerOn & TriggerOn.Action);
        });
        //apply validations
        const validationResult = this.validators.applyValidations(validatorsFiltered);
        //convert pipiline exception
        validationResult.then(() => { resultDefer.resolve(); }, (reason: IValidationResult) => {
            let msg = this.localization.getLocal('rota.bilinmeyenhataolustu');
            if (reason) {
                msg = reason.message || (reason.messageI18N && this.localization.getLocal(reason.messageI18N));
            }
            resultDefer.reject({
                title: this.localization.getLocal('rota.validationhatasi'),
                logType: LogType.Warn,
                message: msg
            });
            this.logger.console.warn({ message: 'validation failed' });
        });
        return resultDefer.promise;
    }
    /**
     * Show parse exception
     * @param error IParserException
     */
    showParserException(error: IParserException): void {
        if (!error) return;

        const parserErrorMsg = error.message ||
            (error.messageI18N && this.localization.getLocal(error.messageI18N));
        if (this.common.isNullOrEmpty(parserErrorMsg)) return;
        switch (error.logType) {
            case LogType.Error:
                this.notification.error({ title: error.title, message: parserErrorMsg });
                break;
            case LogType.Warn:
                this.notification.warn({ title: error.title, message: parserErrorMsg });
                break;
        }
    }
    //#endregion

    //#region Form methods
    /**
  * Form invalid flag changes
  * @param invalidFlag Invalid flag of main form
  * @description virtual method should be overriden
  */
    protected onFormInvalidFlagChanged(invalidFlag: boolean): void {
        //should be overriden
    }
    /**
    * Form dirty flag changes
    * @param dirtyFlag Dirty flag of main form
    * @description virtual method should be overriden
    */
    protected onFormDirtyFlagChanged(dirtyFlag: boolean): void {
        //should be overriden
    }
    /**
   * Initiliaze form controller using form scope object
   * @param forms
   * @description this is a hack method to prevent form controller being undefined
   * formScope is set from rtForm directive
   */
    initFormScope(formScope: ng.IScope): void {
        this.formScope = formScope;
    }
    /**
     * Form Scope
     * @description Initialized by initFormScope from rtForm directive
     */
    private formScope: any;
    /**
     * Main form controller used with rtForm form directive
     */
    get rtForm(): ng.IFormController {
        if (!this.common.isAssigned(this.formScope)) return undefined;
        return this.formScope[this.options.formName];
    }
    /**
     * Flag that if form is dirty
     * @returns {boolean} 
     */
    get isFormDirty(): boolean {
        if (!this.common.isAssigned(this.rtForm)) return false;
        return this.rtForm.$dirty;
    }
    /**
     * Flag that if form is valid
     * @returns {boolean} 
     */
    get isFormValid(): boolean {
        if (!this.common.isAssigned(this.rtForm)) return true;
        return this.rtForm.$valid;
    }
    /**
     * Flag that if form is invalid
     * @returns {boolean} 
     */
    get isFormInvalid(): boolean {
        if (!this.common.isAssigned(this.rtForm)) return false;
        return this.rtForm.$invalid;
    }
    /**
     * Flag that if form is pristine
     * @returns {boolean} 
     */
    get isFormPristine(): boolean {
        if (!this.common.isAssigned(this.rtForm)) return false;
        return this.rtForm.$pristine;
    }
    /**
     * Flag that if form is pending
     * @returns {boolean} 
     */
    get isFormPending(): boolean {
        if (!this.common.isAssigned(this.rtForm)) return false;
        return this.rtForm['$pending'];
    }
    //#endregion
}

export default BaseController

