//#region Imports
import { InjectableObject } from "./injectableobject";
//#endregion
/**
 * Base controller for all controllers.
 * @description Form directive support,Logger shortcuts,Rota service references
 */
class BaseController extends InjectableObject implements IBaseController {
    //#region Props
    //#region Notification services
    /**
            * Notification Service
            * @returns {IBaseLogger}
            */
    get notification(): IBaseLogger { return this.logger.notification; }
    /**
     * Toastr Service
     * @returns {IBaseLogger}
     */
    get toastr(): IBaseLogger { return this.logger.toastr; }
    /**
     * Console Service
     * @returns {IBaseLogger}
     */
    get console(): IBaseLogger { return this.logger.console; }

    //#endregion
    /**
     * Registered events to store off-callbacks
     */
    protected events: Function[];
    /**
     * Flag that indcicates controller scope has been destroyed
     */
    destroyed: boolean = false;
    //#endregion

    //#region Bundle Services
    static injects = InjectableObject.injects.concat(['$document', '$rootScope', '$scope', '$window', '$stateParams',
        'Logger', 'Common', 'Dialogs', 'Routing', 'Config', 'Localization', 'stateInfo', 'hotkeys', 'TitleBadges', 'Constants']);
    //system services
    protected $rootScope: IRotaRootScope;
    protected $scope: ng.IScope;
    protected $window: ng.IWindowService;
    protected $stateParams: ng.ui.IStateParamsService;
    protected $document: duScroll.IDocumentService;
    protected hotkeys: ng.hotkeys.HotkeysProvider;
    //Rota services
    /**
     * Badge service
     */
    protected titlebadges: ITitleBadges;
    /**
     * Global consts
     */
    protected constants: IConstants;
    /**
     * Brief info for state
     */
    protected stateInfo: IStateInfo;
    /**
     * Logger service
     */
    protected logger: ILogger;
    /**
     * Common service
     */
    protected common: ICommon;
    /**
     * Dialogs services
     */
    protected dialogs: IDialogs;
    /**
     * Main config 
     */
    protected config: IMainConfig;
    /**
     * Routing service
     */
    protected routing: IRouting;
    /**
     * Localization service
     */
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
        //save localization
        this.storeLocalization();
        //Scroll
        if (this.options.scrollToTop) {
            this.$document.duScrollTop(0, 500);
        }
        //Current url 
        this.stateInfo.url = this.routing.currentUrl;
        //clear all notificaitons
        if (!this.stateInfo.isNestedState) {
            (this.logger.notification as INotification).removeAll();
            this.titlebadges.clearBadges();
        }
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
     * Store localized value for performance issues
     * @description Must be overriden overrided classes
     */
    protected storeLocalization(): void {
    }
    /**
     * Init bundle
     * @param bundle
     */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        //system
        this.$rootScope = bundle.systemBundles['$rootscope'];
        this.$scope = bundle.systemBundles['$scope'];
        this.$window = bundle.systemBundles["$window"];
        this.$stateParams = bundle.systemBundles["$stateparams"];
        this.$document = bundle.systemBundles["$document"];
        this.hotkeys = bundle.systemBundles["hotkeys"];
        //rota
        this.logger = bundle.systemBundles["logger"];
        this.common = bundle.systemBundles["common"];
        this.dialogs = bundle.systemBundles["dialogs"];
        this.config = bundle.systemBundles["config"];
        this.routing = bundle.systemBundles["routing"];
        this.localization = bundle.systemBundles["localization"];
        this.stateInfo = bundle.systemBundles["stateinfo"];
        this.titlebadges = bundle.systemBundles["titlebadges"];
        this.constants = bundle.systemBundles["constants"];
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

export { BaseController }

