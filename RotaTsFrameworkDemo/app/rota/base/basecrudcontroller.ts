//#region Imports
import { BaseModelController } from './basemodelcontroller';
import { Validators } from "../services/validators.service";
import { ObserableModel } from "./obserablemodel";
//#endregion
/**
 * Base CRUD page implementing save,update,delete processes
 * @description This base class should be inherited for all controllers using restful services
 * @abstract This is abstract controller class that must be inherited 
 * @param {TModel} is your custom model view.
 */
abstract class BaseCrudController<TModel extends IBaseCrudModel> extends BaseModelController<TModel> {
    //#region Statics,Members,Props
    //#region Static
    private static readonly defaultOptions: ICrudPageOptions = {
        scrollToTop: true,
        checkDirtyOnExit: true,
        crudButtonsVisibility: {
            newButton: true,
            deleteButton: true,
            revertBackButton: true,
            copyButton: true,
            saveButton: true,
            saveContinueButton: true
        },
        changeIdParamOnSave: true,
        autoSave: false,
        readOnly: false
    }
    /**
     * Localized values for crud page
     */
    protected static localizedValues: ICrudPageLocalization;
    /**
     * Custom injections
     */
    static injects = BaseModelController.injects.concat(['$interval', '$timeout', 'Caching']);
    //#endregion

    //#region Member
    /**
     * BuiltIn timeout service
     */
    protected $interval: ng.IIntervalService;
    /**
     * BuiltIn timeout service
     */
    protected $timeout: ng.ITimeoutService;
    /**
     * Crud page flags
     */
    protected crudPageFlags: ICrudPageFlags;
    /**
     * Crud page state params
     */
    protected $stateParams: ICrudPageStateParams<TModel>;
    /**
    * Custom Validators
    */
    protected validators: IValidators;
    /**
     * Caching service
     */
    protected caching: ICaching;
    /**
     * Model dirty flag
     */
    isModelDirty: boolean;
    /**
     * AutoSave promise
     */
    autoSavePromise: IP<any>;
    //#endregion

    //#region Props
    /**
   * Model object
   * @returns {TModel}
   */
    get model(): TModel & IObserableModel<TModel> { return this._model as TModel & IObserableModel<TModel>; }
    set model(value: TModel & IObserableModel<TModel>) {
        if (this.isAssigned(value)) {
            this._model = value;
        }
    }
    /**
     * Crud Page options
     * @returns {ICrudFormOptions} 
     */
    get crudPageOptions(): ICrudPageOptions { return this.options as ICrudPageOptions }
    /**
     * Get id value
     * @description should be 'new' for new mode and number for edit mode
     * @returns {string | number} 
     */
    get id(): string | number {
        const idValue = this.$stateParams[this.crudPageOptions.newItemParamName];
        return this.isNew ? idValue : +idValue;
    }
    /**
   * Get if the page is in new state mode
   * @returns {boolean} 
   */
    get isNew(): boolean { return this.crudPageFlags.isNew; }
    set isNew(value: boolean) {
        this.crudPageFlags.isNew = value;
        if (!this.stateInfo.isNestedState) {
            this.editmodeBadge.show = !value && !this.crudPageOptions.readOnly;
            this.newmodeBadge.show = value;
            this.readOnlyBadge.show = this.crudPageOptions.readOnly && !value;
        }
    }

    //#region Badge Shortcuts
    /**
    * Edit Mode badge
    * @returns {ITitleBadge}
    */
    get editmodeBadge(): ITitleBadge { return this.titlebadges.badges[BadgeTypes.Editmode]; }
    /**
    * New Mode badge
    * @returns {ITitleBadge}
    */
    get newmodeBadge(): ITitleBadge { return this.titlebadges.badges[BadgeTypes.Newmode]; }
    /**
    * Dirty badge
    * @returns {ITitleBadge}
    */
    get dirtyBadge(): ITitleBadge { return this.titlebadges.badges[BadgeTypes.Dirty]; }
    /**
    * Invalid badge
    * @returns {ITitleBadge}
    */
    get invalidBadge(): ITitleBadge { return this.titlebadges.badges[BadgeTypes.Invalid]; }
    /**
      * Copying badge
      * @returns {ITitleBadge}
      */
    get cloningBadge(): ITitleBadge { return this.titlebadges.badges[BadgeTypes.Cloning]; }
    /**
     * AutoSaving badge
     * @returns {} 
     */
    get autoSavingBadge(): ITitleBadge { return this.titlebadges.badges[BadgeTypes.AutoSaving]; }
    /**
    * Readonly badge
    * @returns {} 
    */
    get readOnlyBadge(): ITitleBadge { return this.titlebadges.badges[BadgeTypes.Readonly]; }
    //#endregion
    //#endregion
    //#endregion

    //#region Init
    /**
     * Extend crud page options with user options
     * @param bundle Service Bundle
     * @param options User options
     */
    private static extendOptions(bundle: IBundle, options?: ICrudPageOptions): ICrudPageOptions {
        const configService = bundle.systemBundles["config"] as IMainConfig;
        const crudOptions: ICrudPageOptions = angular.merge({}, BaseCrudController.defaultOptions,
            {
                newItemParamName: configService.defaultNewItemParamName,
                newItemParamValue: configService.defaultNewItemParamValue,
                postOnlyModelChanges: configService.postOnlyModelChanges
            }, options);
        return crudOptions;
    }
    /**
     * Constructor 
     * @param bundle Service Bundle
     * @param options User options
     */
    constructor(bundle: IBundle, options?: ICrudPageOptions) {
        //call base constructor
        super(bundle, BaseCrudController.extendOptions(bundle, options));
        //get new instance of validator service
        this.validators = this.$injector.instantiate(Validators) as IValidators;
        this.validators.controller = this;
        //set default options
        const parsers: ICrudParsers = {
            saveParsers: [this.checkAuthority, this.applyValidatitons, this.beforeSaveModel],
            deleteParsers: [this.checkAuthority, this.applyValidatitons, this.beforeDeleteModel]
        };
        this.options = this.common.extend<ICrudPageOptions>(this.options, { parsers: parsers });
        this.crudPageFlags = { isCloning: false, isDeleting: false, isSaving: false, isNew: true };
        //set readonly
        this.crudPageOptions.readOnly = this.crudPageOptions.readOnly &&
            (!this.common.isDefined(this.$stateParams.readonly) || this.$stateParams.readonly);
        //set form is new/edit mode
        this.isNew = this.id === this.crudPageOptions.newItemParamValue;
        //register catch changes
        if (this.crudPageOptions.checkDirtyOnExit) {
            this.registerDirtyCheckEvent();
        }
        //initialize getting model
        this.initModel();
    }
    /**
     * Update bundle
     * @param bundle IBundle
     */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        this.$interval = bundle.systemBundles["$interval"];
        this.$timeout = bundle.systemBundles["$timeout"];
        this.caching = bundle.systemBundles["caching"];
    }
    /**
     * Register event that catch model dirty while quiting
     */
    private registerDirtyCheckEvent(): void {
        this.on(this.constants.events.EVENT_STATE_CHANGE_START,
            (event: ng.IAngularEvent, toState: IRotaState, toParams: ng.ui.IStateParamsService, fromState: IRotaState) => {
                const menu = this.routing.getActiveMenu(toState);
                if (menu !== this.routing.activeMenu && this.isModelDirty &&
                    this.model.modelState !== ModelStates.Deleted && this.isFormValid) {
                    event.preventDefault();
                    this.dialogs.showConfirm({
                        message:
                        BaseCrudController.localizedValues.crudonay,
                        cancelText: BaseCrudController.localizedValues.onayHayir,
                        okText: BaseCrudController.localizedValues.onayEvet
                    }).then(() => {
                        //save and go to state
                        this.initSaveModel().then(() => {
                            this.routing.go(toState.name, toParams);
                        });
                    }).catch(() => {
                        this.resetForm();
                        this.routing.go(toState.name, toParams);
                    });
                }
            });
    }
    /**
     * Store localized value for performance issues (called in basecontroller)
     */
    protected storeLocalization(): void {
        if (BaseCrudController.localizedValues) return;
        BaseCrudController.localizedValues = {
            crudonay: this.localization.getLocal('rota.crudonay'),
            kayitkopyalandi: this.localization.getLocal('rota.kayitkopyalandı'),
            modelbulunamadi: this.localization.getLocal('rota.modelbulunamadi'),
            succesfullyprocessed: this.localization.getLocal('rota.succesfullyprocessed'),
            validationhatasi: this.localization.getLocal('rota.validationhatasi'),
            bilinmeyenhata: this.localization.getLocal('rota.bilinmeyenhataolustu'),
            silmeonay: this.localization.getLocal('rota.deleteconfirm'),
            silmeonaybaslik: this.localization.getLocal('rota.deleteconfirmtitle'),
            kayitbasarisiz: this.localization.getLocal('rota.kayitbasarisiz'),
            okumamoduuyari: this.localization.getLocal('rota.okumamoduuyari'),
            onayEvet: this.localization.getLocal('rota.evet'),
            onayHayir: this.localization.getLocal('rota.hayir')
        };
    }
    //#endregion

    //#region Model Methods
    /**
    * Revert back all changes 
    */
    protected revertBack(): void {
        this.model.revertOriginal();
        this.logger.console.log({ message: 'model reverted to original' });

        this.resetForm(this.model);
        (this.notification as INotification).removeAll();
        this.logger.toastr.info({ message: this.localization.getLocal('rota.degisikliklergerialindi') });
    }
    /**
     * Reset form
     * @description Set modelState param and form to pristine state
     * @param model Model
     */
    protected resetForm(model?: TModel): void {
        this.isModelDirty =
            this.dirtyBadge.show = model && (model.modelState === ModelStates.Added);
        //check form controller initialized
        if (this.isAssigned(this.rtForm)) {
            this.rtForm.$setPristine();
        }
    }
    /**
    * Initialize new model
    * @param cloning Cloning flag
    */
    initNewModel(cloning?: boolean): ng.IPromise<TModel> {
        //chnage url
        const changeUrlPromise = this.changeUrl(this.crudPageOptions.newItemParamValue);
        return changeUrlPromise.then(() => {
            this.isNew = true;
            (this.notification as INotification).removeAll();
            //init model
            return this.initModel(cloning);
        });
    }
    /**
   * New model event
   * @param clonedModel Model to be cloned
   */
    newModel(clonedModel?: TModel): ng.IPromise<TModel> | TModel {
        if (clonedModel) {
            clonedModel.id = 0;
            clonedModel.modelState = ModelStates.Added;
            return clonedModel;
        }
        return <TModel>{ modelState: ModelStates.Added };
    }
    //#endregion

    //#region Save Methods
    /**
     * Save model and continue to saving new model
     */
    initSaveAndContinue(): ng.IPromise<TModel> {
        const saveModelResult = this.initSaveModel({ goon: true });
        return saveModelResult.then(() => {
            return this.initNewModel();
        });
    }
    /**
    * Save Model 
    * @param options Save Options     
    */
    initSaveModel(options?: ISaveOptions): ng.IPromise<TModel> {
        //init saving
        options = this.common.extend<ISaveOptions>({
            isNew: this.isNew,
            goon: false,
            showMessage: true,
            redirectHandled: false
        }, options);
        this.crudPageFlags.isSaving = true;
        (this.notification as INotification).removeAll(true);
        //validate and save model 
        const saveResult = this.parseAndSaveModel(options);
        saveResult.then((model: TModel): void => {
            //if it gets here,saving is completed
            //Finally run after save event
            this.afterSaveModel(options);
            //if its in new mode or returned model's id different than param id and not goon,then change url for edit mode
            if (!options.redirectHandled && (options.isNew || this.id !== model.id) && !options.goon) {
                this.changeUrl(this.model.id);
            }
        });
        //if there is error in save response,dispacth errorModel method
        saveResult.catch((error: IParserException): void => {
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
                default:
                //Server errors will be handled in logger.exception interceptor
            }
        });
        //final step,reset flags
        saveResult.finally(() => {
            if (this.crudPageFlags.isCloning && !this.stateInfo.isNestedState)
                this.cloningBadge.show = false;
            this.crudPageFlags.isCloning =
                this.crudPageFlags.isSaving = false;
            this.logger.console.log({ message: 'save process completed' });
        });
        //return promise to let rt-button know that saving process is finished
        return saveResult;
    }
    /**
     * Validate parsers methods and call save method
     * @param options Save options
     */
    private parseAndSaveModel(options: ISaveOptions): ng.IPromise<TModel> {
        const defer = this.$q.defer<TModel>();
        //iterate save pipeline
        const parseResult = this.initParsers<any>(this.crudPageOptions.parsers.saveParsers, options);
        //save if validation parsers resolved
        if (this.isAssigned(parseResult)) {
            parseResult.then(() => {
                //convert obserable to json literal model
                options.jsonModel = this.model.toJson(this.crudPageOptions.postOnlyModelChanges);
                //call user savemodel method
                const saveResult = this.saveModel(options);
                if (this.isAssigned(saveResult)) {
                    //success
                    saveResult.then((data: ICrudServerResponseData) => {
                        //check if saveModel return response
                        if (!this.isAssigned(data)) {
                            defer.reject({ message: 'no response data returned', logType: LogType.Warn });
                            return;
                        }
                        //model is not 'new' anymore
                        this.isNew = false;
                        //set model from result of saving
                        if (this.isAssigned(data.entity)) {
                            //call loadedModel
                            this.loadedModel(this.model = this.setModel(<TModel>data.entity));
                            defer.resolve(<TModel>data.entity);
                        } else {
                            defer.reject({ message: 'no model returned', logType: LogType.Warn });
                        }
                        //show messages
                        if (options.showMessage) {
                            this.toastr.success({ message: options.message || BaseCrudController.localizedValues.succesfullyprocessed });
                            if (data.infoMessages && data.infoMessages.length)
                                this.toastr.info({ message: data.infoMessages.join('</br>') });
                            if (data.warningMessages && data.warningMessages.length)
                                this.toastr.warn({ message: data.warningMessages.join('</br>') });
                        }
                    });
                    //fail save
                    saveResult.catch((response: IBaseServerResponse<IServerFailedResponseData>) => {
                        defer.reject(response.data || response);
                    });
                } else {
                    defer.reject({ message: 'no response returned', logType: LogType.Warn });
                }
            });
            //fail parsers
            parseResult.catch((result: IParserException) => {
                defer.reject(result);
            });
        } else {
            defer.reject({ message: 'no response returned from parsers', logType: LogType.Warn });
        }
        return defer.promise;
    }
    /**
     * Before save event
     * @param options Save options
     */
    beforeSaveModel(options: ISaveOptions): ng.IPromise<IParserException> | void { return undefined; }
    /**
     * After save event
     * @param options Save options
     */
    afterSaveModel(options: ISaveOptions): void { }
    /**
     * Save model
     * @param options Save options
     */
    abstract saveModel(options: ISaveOptions): ng.IPromise<ICrudServerResponseData>;
    //#endregion

    //#region Auto Save Methods
    /**
     * Start autoSaving process
     */
    startAutoSave(): void {
        //already in progress,stop it
        if (this.autoSavePromise)
            this.stopAutoSave();

        if (this.isNew) {
            this.autoSavePromise = this.$interval(this.autoSaveModel.bind(this), this.config.autoSaveInterval);
        } else {
            //watch model changes
            this.model.subscribeDataChanged(() => {
                if (!this.autoSavePromise)
                    this.autoSavePromise = this.$interval(this.autoSaveModel.bind(this), this.config.autoSaveInterval);
            });
        }
    }
    /**
     * Stop autosaving
     */
    stopAutoSave(): void {
        this.caching.localStorage.remove(this.stateInfo.url);
        this.$interval.cancel(this.autoSavePromise);
        this.autoSavePromise = null;
        this.autoSavingBadge.show = false;
    }
    /**
     * Auto save model to storage
     */
    autoSaveModel(): void {
        this.autoSavingBadge.show = true;
        this.caching.localStorage.store(this.stateInfo.url, this.model.toJson());
        this.logger.console.info({ message: "model autosaved", data: this.model });
        this.$timeout(() => {
            this.autoSavingBadge.show = false;
        }, 1000);
    }
    //#endregion

    //#region Validation
    private applyValidatitons(options: ISaveOptions): ng.IPromise<IParserException> {
        const resultDefer = this.$q.defer<IParserException>();
        //filter by crud flag
        const validatorsFilteredByCrudFlag = _.filter(this.validators.validators, (item: IValidationItem) => {
            let crudFlagOk = false;
            if ((this.crudPageFlags.isSaving && options.isNew && item.crudFlag & CrudType.Create) ||
                (this.crudPageFlags.isSaving && !options.isNew && item.crudFlag & CrudType.Update) ||
                (this.crudPageFlags.isDeleting && item.crudFlag & CrudType.Delete)) {
                crudFlagOk = true;
            }
            return crudFlagOk && !!(item.triggerOn & TriggerOn.Action);
        });
        //apply validations
        const validationResult = this.validators.applyValidations(validatorsFilteredByCrudFlag);
        //convert pipiline exception
        validationResult.then(() => { resultDefer.resolve(); }, (reason: IValidationResult) => {
            let msg = BaseCrudController.localizedValues.bilinmeyenhata;
            if (reason) {
                msg = reason.message || (reason.messageI18N && this.localization.getLocal(reason.messageI18N));
            }
            resultDefer.reject({
                title: BaseCrudController.localizedValues.validationhatasi,
                logType: LogType.Warn,
                message: msg
            });
        });
        return resultDefer.promise;
    }
    //#endregion

    //#region Authorization
    checkAuthority(options?: ISaveOptions): void {
        //TODO:Will be considered afterwards
    }
    //#endregion

    //#region Delete Model
    /**
      * Init deletion of model
      * @param options Delete options
      */
    initDeleteModel(options: IDeleteOptions): ng.IPromise<any> {
        //init deleting
        options = angular.extend({
            key: this.model.id, confirm: true,
            showMessage: true, model: this.model,
            jsonModel: this.model.toJson(this.crudPageOptions.postOnlyModelChanges)
        }, options);
        //confirm
        const confirmResult: IP<any> = options.confirm ? this.dialogs.showConfirm({
            message: BaseCrudController.localizedValues.silmeonay,
            title: BaseCrudController.localizedValues.silmeonaybaslik
        }) : this.common.promise();
        //confirm result
        confirmResult.then(() => {
            this.crudPageFlags.isDeleting = true;
            const deleteResult = this.parseAndDeleteModel(options);
            //call aftersave method
            deleteResult.then((): void => {
                this.afterDeleteModel(options);
            });
            //if there is error in save response,dispacth errorModel method
            deleteResult.catch((error: IParserException): void => {
                switch (error.logType) {
                    case LogType.Error:
                        this.notification.error({ title: error.title, message: error.message });
                        break;
                    case LogType.Warn:
                        this.notification.warn({ title: error.title, message: error.message });
                        break;
                    default:
                    //Server errors will be handled in logger.exception interceptor
                }
            });
            //set deleted flag
            deleteResult.finally(() => {
                this.resetForm();
                this.crudPageFlags.isDeleting = false;
            });
            return deleteResult;
        });
        return confirmResult;
    }
    /**
     *  Validate parsers methods and call delete method
     * @param options Delete options
     */
    parseAndDeleteModel(options: IDeleteOptions): ng.IPromise<any> {
        const deferDelete = this.$q.defer<TModel>();
        //validate and delete model if valid
        const parseResult = this.initParsers<any>(this.crudPageOptions.parsers.deleteParsers, options);
        parseResult.then(() => {
            //set modelstate as deleted
            this.model.modelState = ModelStates.Deleted;
            //call delete method
            const deleteResult = this.deleteModel(options);
            deleteResult.then(() => {
                deferDelete.resolve();
                //message
                if (options.showMessage) {
                    this.toastr.success({ message: BaseCrudController.localizedValues.succesfullyprocessed });
                }
            });
            //fail delete
            deleteResult.catch((response: IBaseServerResponse<IServerFailedResponseData>) => {
                deferDelete.reject(response.data);
            });
        });
        //fail parsers
        parseResult.catch((result: IValidationResult) => {
            deferDelete.reject(result);
        });
        //return delete promise
        return deferDelete.promise;
    }
    /**
     * Before delete event
     */
    beforeDeleteModel(options: IDeleteOptions): ng.IPromise<IParserException> | void { return undefined }
    /**
     * After delete event
     * @param options
     */
    afterDeleteModel(options: IDeleteOptions): void { }
    /**
     * User delete method
     * @param options Delete options
     */
    deleteModel(options: IDeleteOptions): ng.IPromise<any> {
        return this.common.promise();
    }
    //#endregion

    //#region BaseController
    /**
    * Form invalid flag changes
    * @param invalidFlag Invalid flag of main form
    * @description virtual method should be overriden
    */
    protected onFormInvalidFlagChanged(invalidFlag: boolean): void {
        this.invalidBadge.show = invalidFlag;
    }
    /**
    * Controller getting destroyed
    */
    destroy(): void {
        super.destroy();
        //clear autosave handle
        if (this.crudPageOptions.autoSave)
            this.stopAutoSave();
    }
    //#endregion

    //#region BaseModelController Methods
    /**
     * Init crud model
     * @param cloning Cloning flag
     */
    protected initModel(cloning?: boolean): ng.IPromise<TModel> {
        //reset flags
        this.crudPageFlags.isSaving =
            this.crudPageFlags.isDeleting = false;
        this.crudPageFlags.isCloning = cloning;

        return super.initModel({ id: this.id });
    }
    /**
     * Set model getter method
     * @param modelFilter Model Filter
     * @description Overriden baseFormController's to pass cloned copy
     */
    defineModel(modelFilter?: IBaseFormModelFilter): ng.IPromise<TModel> | TModel {
        if (this.crudPageOptions.autoSave) {
            const autoSavedModel = this.caching.localStorage.get<TModel>(this.stateInfo.url);
            if (this.common.isNotEmptyObject(autoSavedModel)) {
                return this.dialogs.showConfirm({
                    title: this.localization.getLocal('rota.otomatikkayit'),
                    message: this.localization.getLocal('rota.otomatikkayityuklensinmi'),
                    okText: this.localization.getLocal('rota.otomatikkayityukle')
                })
                    .then((): TModel => {
                        return autoSavedModel;
                    },
                    () => {
                        return this.isNew
                            ? this.newModel(this.crudPageFlags.isCloning && <TModel>this.model._orginalValues)
                            : this.getModel(modelFilter);
                    })
                    .finally(() => {
                        this.caching.localStorage.remove(this.stateInfo.url);
                    });
            }
        }
        return this.isNew
            ? this.newModel(this.crudPageFlags.isCloning && <TModel>this.model._orginalValues)
            : this.getModel(modelFilter);
    }
    /**
     * Convert literal to obserable model
     * @param model
     */
    setModel(model: TModel): TModel & IObserableModel<TModel> {
        //delete prev reference 
        if (this.model) delete this._model;
        //create new obserable model 
        const oModel = new ObserableModel(model);
        //set model chnages event for edit mode
        if (!this.isNew) {
            //set readonly
            oModel._readonly = this.crudPageOptions.readOnly;
            //track prop changes
            oModel.subscribeDataChanged((): void => {
                this.isModelDirty =
                    this.dirtyBadge.show = true;
            });
        }
        return (oModel) as any;
    }
    /**
     * Do some stuff after model loaded
     * @param model Model
     */
    loadedModel(model: TModel): void {
        super.loadedModel(model);
        //model not found in edit mode
        if (!this.isNew && !this.stateInfo.isNestedState && !this.isAssigned(model)) {
            this.notification.error({ message: BaseCrudController.localizedValues.modelbulunamadi });
            this.initNewModel();
            return;
        }
        //set cloning warning & notify
        if (this.crudPageFlags.isCloning) {
            this.toastr.info({ message: BaseCrudController.localizedValues.kayitkopyalandi });
            if (!this.stateInfo.isNestedState) {
                this.cloningBadge.show = true;
            }
        }
        this.resetForm(model);
        //autoSave process
        if (this.crudPageOptions.autoSave && !this.crudPageOptions.readOnly)
            this.startAutoSave();
        //readonly warning message
        if (this.crudPageOptions.readOnly && !this.isNew) {
            this.logger.notification.info({ message: BaseCrudController.localizedValues.okumamoduuyari });
        }
    }
    /**
    * @abstract Get model
    * @param args Model
    */
    abstract getModel(modelFilter: IBaseFormModelFilter): ng.IPromise<TModel> | TModel;
    //#endregion   

    //#region Utils
    /**
     * Clears dirsty flag
     */
    clearDirty(): void {
        this.isModelDirty =
            this.dirtyBadge.show = false;
    }
    /**
    * Chnage url depending on new/edit modes
    * @param id "New" or id 
    */
    protected changeUrl(id: number | string): ng.IPromise<any> {
        if (!this.crudPageOptions.changeIdParamOnSave) return this.common.promise();
        //get id param obj
        const idParam = {};
        idParam[this.crudPageOptions.newItemParamName] = id;
        //replace the url with new id
        const params = this.common.extend(this.$stateParams, idParam);
        return this.routing.go(this.routing.current.name, params,
            { notify: false, reload: false });
    }
    //#endregion

}
//Export
export { BaseCrudController }