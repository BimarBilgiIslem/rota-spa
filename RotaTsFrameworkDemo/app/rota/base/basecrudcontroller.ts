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
import BaseModelController from './basemodelcontroller';
import ObserableModel from "./obserablemodel";
//#endregion
/**
 * Base CRUD page implementing save,update,delete processes
 * @description This base class should be inherited for all controllers using restful services
 * @abstract This is abstract controller class that must be inherited 
 * @param {TModel} is your custom model view.
 */
abstract class BaseCrudController<TModel extends IBaseCrudModel> extends BaseModelController<TModel>{
    //#region Statics,Members,Props
    //#region Static
    private static readonly defaultOptions: ICrudPageOptions = {
        scrollToTop: true,
        checkDirtyOnExit: true,
        enableStickyCrudButtons: true,
        registerName: null,
        initializeModel: true,
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
     * Caching service
     */
    protected caching: ICaching;
    /**
     * Model dirty flag
     */
    private isModelDirty: boolean;
    /**
     * AutoSave promise
     */
    private autoSavePromise: IP<any>;
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
     * Constructor 
     * @param bundle Service Bundle
     * @param options User options
     */
    constructor(bundle: IBundle) {
        //call base constructor
        super(bundle);
        //update options
        const parsers: ICrudParsers = {
            saveParsers: [this.checkAuthority, this.applyValidatitons, this.beforeSaveModel],
            deleteParsers: [this.checkAuthority, this.beforeDeleteModel]
        };
        this.crudPageOptions.parsers = this.crudPageOptions.parsers || parsers;
        this.crudPageOptions.postOnlyModelChanges = this.common.iif(this.crudPageOptions.postOnlyModelChanges,
            this.config.postOnlyModelChanges);

        this.crudPageFlags = { isCloning: false, isDeleting: false, isSaving: false, isNew: true };
        //set readonly
        this.crudPageOptions.readOnly = (this.crudPageOptions.readOnly &&
            (!this.common.isDefined(this.$stateParams.readonly) || this.$stateParams.readonly))
            || this.$stateParams.preview;
        //set form is new/edit mode
        this.isNew = this.id === this.crudPageOptions.newItemParamValue;
    }
    /**
     * Update bundle
     * @param bundle IBundle
     */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        this.$interval = bundle.services["$interval"];
        this.$timeout = bundle.services["$timeout"];
        this.caching = bundle.services["caching"];
    }
    //#endregion

    //#region Model Methods
    /**
    * Revert back all changes 
    */
    protected revertBack(): void {
        if (this.isNew) {
            if (this.$window.history.length) {
                this.routing.goBack();
            } else {
                this.initNewModel(this.crudPageFlags.isCloning);
            }
        } else {
            this.model.revertOriginal();
            this.logger.console.log({ message: 'model reverted to original' });

            this.resetForm(this.model);
            if (this.crudPageOptions.autoSave)
                this.startAutoSave();
            (this.notification as INotification).removeAll();
            this.logger.toastr.info({ message: this.localization.getLocal('rota.degisikliklergerialindi') });
        }
    }
    /**
     * Reset form
     * @description Set modelState param and form to pristine state
     * @param model Model
     */
    protected resetForm(model?: TModel): void {
        this.isModelDirty = model && (model.modelState === ModelStates.Added);
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
        return clonedModel || <TModel>{ modelState: ModelStates.Added };
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
        this.isFormDisabled =
            this.crudPageFlags.isSaving = true;
        (this.notification as INotification).removeAll(true);
        //validate and save model 
        const saveResult = this.parseAndSaveModel(options);
        saveResult.then((model: TModel & IObserableModel<TModel>): void => {
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
            this.showParserException(error);
        });
        //final step,reset flags
        saveResult.finally(() => {
            this.cloningBadge.show =
                this.crudPageFlags.isCloning =
                this.crudPageFlags.isSaving =
                this.isFormDisabled = false;
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
                        this.crudPageFlags.isCloning =
                            this.isNew = false;
                        //set model from result of saving
                        if (this.isAssigned(data.entity)) {
                            //call loadedModel
                            this.loadedModel(this.model = this.setModel(<TModel>data.entity));
                            defer.resolve(this.model);
                        } else {
                            defer.reject({ message: 'no model returned', logType: LogType.Warn });
                        }
                        //show messages
                        if (options.showMessage) {
                            this.toastr.success({ message: options.message || this.localization.getLocal("rota.succesfullyprocessed") });
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
            message: this.localization.getLocal("rota.deleteconfirm"),
            title: this.localization.getLocal("rota.deleteconfirmtitle")
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
                if (!error) return;
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
                    this.toastr.success({ message: this.localization.getLocal("rota.succesfullyprocessed") });
                }
            });
            //fail delete
            deleteResult.catch((response: IBaseServerResponse<IServerFailedResponseData> | IParserException) => {
                deferDelete.reject((response as IBaseServerResponse<IServerFailedResponseData>).data || response);
            });
        });
        //fail parsers
        parseResult.catch((result: IValidationResult) => {
            deferDelete.reject(result);
            return result;
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
    * Register event that catch model dirty while quiting
    */
    onExit(event: angular.IAngularEvent,
        toState: IRotaState,
        toParams: angular.ui.IStateParamsService,
        fromState: IRotaState): void {
        if (!this.crudPageOptions.checkDirtyOnExit) return;
        //check form is valid
        if (this.isFormValid && this.isModelDirty && this.model.modelState !== ModelStates.Deleted) {
            //stop state exiting
            event.preventDefault();
            //confirm save changes 
            this.dialogs.showConfirm({
                title: this.localization.getLocal("rota.crudonaybaslik"),
                message: this.localization.getLocal("rota.crudonay"),
                okText: this.localization.getLocal("rota.kaydetvecik"),
                cancelText: this.localization.getLocal("rota.iptal"),
                cancel2Text: this.localization.getLocal("rota.cikis"),
                dialogType: DialogType.Warn
            }).then(() => {
                //save and go to state
                this.initSaveModel().then(() => {
                    this.routing.go(toState.name, toParams);
                });
            }).catch((reason: string) => {
                if (reason === "cancel2") {
                    this.resetForm();
                    this.routing.go(toState.name, toParams);
                }
            });
        }
    }
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
    initModel(cloning?: boolean): ng.IPromise<TModel> {
        //reset flags
        this.crudPageFlags.isSaving =
            this.crudPageFlags.isDeleting = false;
        this.crudPageFlags.isCloning = cloning;

        return super.initModel({ id: this.id }) as ng.IPromise<TModel>;
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
        if (!this.isAssigned(model)) return;
        //create new obserable model 
        return new ObserableModel<TModel>(model) as any;
    }
    /**
     * Do some stuff after model loaded
     * @param model Model
     */
    loadedModel(model: TModel & IObserableModel<TModel>): void {
        //model not found in edit mode
        if (!this.isNew && !this.isAssigned(model)) {
            this.logger.console.log({ message: `no such an item found with id ${this.id}` });
            this.notification.warn({
                message: this.localization.getLocal("rota.modelbulunamadi"),
                isSticky: true, autoHideDelay: 6000
            });
            this.initNewModel();
            return;
        }
        super.loadedModel(model);
        //set cloning warning & notify
        if (this.crudPageFlags.isCloning) {
            //set modelstate to Added if cloning
            model.modelState = ModelStates.Added;
            //set UI cloning
            this.toastr.info({ message: this.localization.getLocal("rota.kayitkopyalandi") });
            this.cloningBadge.show = true;
        }
        //set model chnages event for edit mode
        if (!this.isNew) {
            //set readonly
            model._readonly = this.crudPageOptions.readOnly;
            //track prop changes
            model.subscribeDataChanged((): void => {
                this.isModelDirty =
                    this.dirtyBadge.show = true;
            });
        }
        //autoSave process
        if (this.crudPageOptions.autoSave && !this.crudPageOptions.readOnly)
            this.startAutoSave();
        //readonly warning message
        if (this.crudPageOptions.readOnly && !this.isNew && !this.$stateParams.preview) {
            this.logger.notification.info({ message: this.localization.getLocal("rota.okumamoduuyari") });
        }
        //set badges
        //dont touch any badge if preview mode is active
        if (!this.$stateParams.preview) {
            this.$timeout(() => {
                this.editmodeBadge.show = !this.isNew && !this.crudPageOptions.readOnly;
                this.newmodeBadge.show = this.isNew;
                this.readOnlyBadge.show = this.crudPageOptions.readOnly && !this.isNew;
                this.dirtyBadge.show = model.modelState === ModelStates.Added;
            },
                0);
        }
        //reset form
        this.resetForm(model);
    }
    /**
    * @abstract Get model
    * @param args Model
    */
    abstract getModel(modelFilter: IBaseFormModelFilter): ng.IPromise<TModel>;
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
        //replace the url with new id
        const params = this.common.extend(this.$stateParams, { [this.crudPageOptions.newItemParamName]: id });
        return this.routing.changeUrl(params);
    }
    //#endregion
}
//Export
export default BaseCrudController 