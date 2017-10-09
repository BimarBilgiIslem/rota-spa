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
import BaseModelController from "./basemodelcontroller"
import * as s from "underscore.string";
//#endregion
/**
 * Base List Controller
 * @description This base class should be inherited for all controllers using restful services
 * @param {TModel} is your custom model view.
 */
abstract class BaseListController<TModel extends IBaseModel, TModelFilter extends IBaseListModelFilter = IBaseListModelFilter>
    extends BaseModelController<TModel>  {
    //#region Props
    //#region Statics
    /**
     * List Page options
     */
    private static defaultOptions: IListPageOptions = {
        initializeModel: true,
        scrollToTop: true,
        pagingEnabled: true,
        editState: undefined,
        showMesssage: true,
        modelExports: ModelExports.Pdf,
        storeFilterValues: false,
        storefilterLocation: CacherType.SessionStorage,
        enableStickyListButtons: true,
        listButtonVisibility: {
            newButton: true,
            searchButton: true,
            clearButton: true,
            exportButton: true,
            deleteSelected: true,
            storeFilter: true,
            storeGridLayout: true
        }
    }
    //#endregion

    //#region Members
    /**
    * Recourd count badge
    * @returns {ITitleBadge}
    */
    get recordcountBadge(): ITitleBadge { return this.titlebadges.badges[BadgeTypes.Recordcount]; }
    /**
     * Selected Recourd count badge
     * @returns {ITitleBadge}
     */
    get selectedcountBadge(): ITitleBadge { return this.titlebadges.badges[BadgeTypes.Selectedcount]; }
    /**
     * List controller options
     */
    get listPageOptions(): IListPageOptions { return this.options as IListPageOptions; }
    /**
     * Model object
     * @returns {TModel}
     */
    get model(): TModel[] | IPagingListModel<TModel> { return <TModel[] | IPagingListModel<TModel>>this._model; }
    set model(value: TModel[] | IPagingListModel<TModel>) {
        if (this.isAssigned(value)) {
            this._model = value;
        }
    }

    private _gridApi: uiGrid.IGridApi;
    /**
     * Grid Api
     * @returns {uiGrid.IGridApi} Grid Api
     */
    get gridApi(): uiGrid.IGridApi { return this._gridApi; }
    set gridApi(value: uiGrid.IGridApi) { this._gridApi = value; }

    private _gridOptions: IGridOptions<TModel>;
    /**
     * Grid options
     * @returns {uiGrid.IGridOptions} Grid options
     */
    get gridOptions(): IGridOptions<TModel> { return this._gridOptions; }
    set gridOptions(value: IGridOptions<TModel>) { this._gridOptions = value; }
    /**
     * Grid data
     * @returns {IBaseListModel<TModel>}
     */
    get gridData(): TModel[] { return this.gridOptions.data as TModel[]; }
    /**
     * Selected rows
     * @returns {} 
     */
    get gridSeletedRows(): TModel[] {
        if (this.isAssigned(this.gridApi) && this.isAssigned(this.gridApi.selection)) {
            return this.gridApi.selection.getSelectedRows();
        }
        return [];
    }
    /**
     * Filter object
     */
    public filter: TModelFilter;
    /**
     * Storage name for stored filter
     */
    private readonly filterStorageName: string;
    /**
     * Storage name for store grid layout
     */
    private readonly gridLayoutStorageName: string;
    /**
     * BuiltIn timeout service
     */
    protected $interval: ng.IIntervalService;
    /**
     * Refresh interval promise
     */
    private autoRefreshPromise: IP<any>;
    //#endregion
    //#endregion

    //#region Bundle Services
    static injects = BaseModelController.injects.concat(['$timeout', '$interval', 'uiGridConstants',
        'uiGridExporterConstants', 'Caching']);
    protected uigridconstants: uiGrid.IUiGridConstants;
    protected uigridexporterconstants: uiGrid.exporter.IUiGridExporterConstants;
    protected caching: ICaching;
    protected $timeout: ng.ITimeoutService;
    //#endregion

    //#region Init
    /**
     * Extend crud page options with user options
     * @param bundle Service Bundle
     * @param options User options
     */
    private static extendOptions(bundle: IBundle, options?: IListPageOptions): IListPageOptions {
        const configService = bundle.services["config"] as IMainConfig;
        const listOptions: IListPageOptions = angular.merge({}, BaseListController.defaultOptions,
            {
                newItemParamName: configService.defaultNewItemParamName,
                pageSize: configService.gridDefaultPageSize,
                //set grid elem name when running on mobile so enable scrolling 
                elementToScroll: window.__IS_TOUCHABLE && `grid_${configService.gridDefaultOptionsName}`
            }, options);
        return listOptions;
    }
    /**
     * Constructor
     * @param bundle Service bundle
     * @param options List page user options
     */
    protected constructor(bundle: IBundle) {
        //merge options with defaults
        super(bundle, BaseListController.extendOptions(bundle, bundle.options));
        //init filter object 
        this.filterStorageName = `storedfilter_${this.stateInfo.stateName}`;
        this.gridLayoutStorageName = `storedgridlayout_${this.stateInfo.stateName}`;
        //init filter
        this.initFilter();
        //set refresh grid process
        this.initRefresh();
    }
    /**
     * Update bundle
     * @param bundle IBundle
     */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        this.uigridconstants = bundle.services["uigridconstants"];
        this.uigridexporterconstants = bundle.services["uigridexporterconstants"];
        this.caching = bundle.services["caching"];
        this.$timeout = bundle.services["$timeout"];
        this.$interval = bundle.services["$interval"];
    }
    //#endregion

    //#region BaseModelController methods
    /**
     * this method is called from decorator with all injections are available
     */
    initController(): void {
        this.initGrid();
        super.initController();
    }
    /**
     * Initialize model
     * @param modelFilter Model filter
     * @description modelFilter is only available in case its called from initSearchModel.
     * in case its called from Controller decorator,initModel is called with this.filter without pager params
     */
    initModel(modelFilter?: TModelFilter): ng.IPromise<TModel[] | IPagingListModel<TModel>> {
        const resultDefer = this.$q.defer<TModel[] | IPagingListModel<TModel>>();
        this.logger.notification.removeAll();
        //validation process
        const validationResult = this.applyValidatitons();
        //success
        validationResult.then(() => {
            super.initModel(modelFilter || this.filter).then(result =>
                resultDefer.resolve(<TModel[] | IPagingListModel<TModel>>result));
        });
        //has error
        validationResult.catch((error: IParserException) => {
            this.showParserException(error);
            resultDefer.reject();
        });

        return resultDefer.promise;
    }
    /**
    * @abstract Get model
    * @param args Model
    */
    abstract getModel(modelFilter?: TModelFilter): ng.IPromise<TModel[]> |
        TModel[] | ng.IPromise<IPagingListModel<TModel>> | IPagingListModel<TModel>;
    /**
     * Check if model is null ,set it empty array for grid
     * @param model Model
     */
    protected setModel(model: TModel[] | IPagingListModel<TModel>): TModel[] | IPagingListModel<TModel> {
        const modelData = this.listPageOptions.pagingEnabled ? (<IPagingListModel<TModel>>model).data : model;

        if (this.common.isArray(modelData)) {
            return model;
        }
        throw new Error(this.constants.errors.MODEL_EXPECTED_AS_ARRAY);
    }
    /**
     * Override loadedMethod to show notfound message
     * @param model Model
     */
    public loadedModel(model: TModel[] | IPagingListModel<TModel>): void {
        //set grid datasource
        if (this.listPageOptions.pagingEnabled) {
            this.gridOptions.totalItems = (<IPagingListModel<TModel>>model).total || 0;
            this.gridOptions.data = (<IPagingListModel<TModel>>model).data;
            super.loadedModel((<IPagingListModel<TModel>>model).data);
        } else {
            this.gridOptions.data = <TModel[]>model;
            super.loadedModel(<TModel[]>model);
        }
        //set warnings and recordcount 
        let recCount = 0;
        if (model) {
            if (this.listPageOptions.pagingEnabled) {
                recCount = (<IPagingListModel<TModel>>model).total;
                if (!this.common.isDefined(recCount)) {
                    throw new Error(this.constants.errors.NO_TOTAL_PROP_PROVIDED);
                }
            } else {
                recCount = (<TModel[]>model).length;
            }
        }
        if (recCount === 0 && this.isActiveState() && this.listPageOptions.showMesssage) {
            this.toastr.warn({ message: this.localization.getLocal('rota.kayitbulunamadi') });
        }
        //store filter 
        if (this.listPageOptions.storeFilterValues) {
            this.saveFilter(this.filter);
        }
    }
    //#endregion

    //#region Grid methods
    //#region Default Methods
    /**
    * Get default buttons
    */
    protected getDefaultGridButtons(hiddenOnMobile?: boolean): uiGrid.IColumnDef[] {
        const buttons: uiGrid.IColumnDef[] = [];
        const getButtonColumn = (name: string, template: string): uiGrid.IColumnDef => {
            const btn: uiGrid.IColumnDef = {
                name: name,
                cellClass: 'col-align-center',
                width: '35',
                displayName: '',
                enableColumnMenu: false,
                cellTemplate: template
            };
            if (hiddenOnMobile) {
                btn.visible = !this.common.isMobileOrTablet();
            }
            return btn;
        }
        //edit button
        if (this.gridOptions.showEditButton) {
            const editbutton = getButtonColumn('edit-button', this.constants.grid.GRID_EDIT_BUTTON_HTML);
            buttons.push(editbutton);
        }
        //delete button
        if (this.gridOptions.showDeleteButton) {
            const editbutton = getButtonColumn('delete-button', this.constants.grid.GRID_DELETE_BUTTON_HTML);
            buttons.push(editbutton);
        }
        return buttons;
    }
    /**
    * Default grid options
    */
    protected getDefaultGridOptions(): IGridOptions<TModel> {
        return {
            showEditButton: true,
            showDeleteButton: true,
            enableColumnMoving: true,
            enableColumnResizing: true,
            rowTemplateAttrs: [],
            //Row selection
            enableRowHeaderSelection: false,
            enableRowSelection: false,
            enableSelectAll: true,
            multiSelect: false,
            enableRowClickToEdit: this.common.isMobileOrTablet(),
            enableRowDoubleClickToEdit: !this.common.isMobileOrTablet(),
            //Row Edit
            enableCellEdit: false,
            enableCellEditOnFocus: false,
            //Data
            data: [] as Array<TModel>,
            //Pager
            paginationPageSizes: [25, 50, 75, 150],
            paginationPageSize: this.listPageOptions.pageSize,
            useExternalPagination: true,
            //Export
            exporterSuppressColumns: [],
            exporterAllDataFn: (): ng.IPromise<Array<TModel>> => {
                const result = this.initSearchModel(this.getPager(1, this.gridOptions.totalItems));
                return result.then(result => {
                    this.gridOptions.useExternalPagination = false;
                    if (this.listPageOptions.pagingEnabled) {
                        return (result as IPagingListModel<TModel>).data;
                    }
                    return result as TModel[];
                });
            },
            exporterCsvFilename: 'myFile.csv',
            exporterPdfDefaultStyle: { fontSize: 9 },
            exporterPdfTableStyle: { margin: [3, 3, 3, 3] },
            exporterPdfTableHeaderStyle: { fontSize: 8, bold: true, italics: true, color: '#096ce5' },
            exporterPdfHeader: { text: this.routing.activeMenu.localizedTitle, style: 'headerStyle' },
            exporterPdfFooter: (currentPage: number, pageCount: number) => {
                return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
            },
            exporterPdfCustomFormatter: docDefinition => {
                docDefinition.styles.headerStyle = { fontSize: 15, bold: true, color: '#457ABB' };
                docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
                return docDefinition;
            },
            exporterPdfOrientation: 'portrait',
            exporterPdfPageSize: 'A4',
            exporterPdfMaxGridWidth: 450,
            onRegisterApi: gridApi => {
                this.gridApi = gridApi;
                this.onRegisterGridApi(gridApi);
            }
        };
    }
    /**
     * Get paging filter obj depending on params
     */
    private getPager(pageIndex?: number, pageSize?: number): IPager {
        const pager: IPager = {};
        //if paging disabled,set max values
        if (!this.listPageOptions.pagingEnabled) {
            pageIndex = 1, pageSize = this.constants.grid.GRID_MAX_PAGE_SIZE;
        }

        pager.pageIndex = pageIndex || this.gridOptions.paginationCurrentPage || 1;
        pager.pageSize = pageSize || this.gridOptions.paginationPageSize ||
            this.listPageOptions.pageSize;
        return pager;
    }
    //#endregion

    /**
    * Initialize grid
    */
    private initGrid(): void {
        //get default options
        const options = this.getDefaultGridOptions();
        //merge user-defined cols
        this.gridOptions = angular.extend(options, {
            columnDefs: this.getGridColumns(options).map(col => {
                if (col.hiddenOnMobile) col.visible = !this.common.isMobileOrTablet();
                return col;
            })
        });
        //Set rowFormatter attrs if assigned
        if (this.isAssigned(this.gridOptions.rowFormatter)) {
            this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_ROW_FORMATTER_ATTR);
        }
        if (this.gridOptions.showContextMenu) {
            this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_CONTEXT_MENU_ATTR);
            if (!this.gridOptions.multiSelect) {
                this.gridOptions.enableRowSelection = true;
            }
        }
        if (this.gridOptions.enableRowClickToEdit) {
            this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_ROW_CLICK_EDIT_ATTR);
        }
        if (this.gridOptions.enableRowDoubleClickToEdit && !this.common.isMobileOrTablet()) {
            this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_ROW_DOUBLE_CLICK_EDIT_ATTR);
        }
        //Set row template
        if (this.gridOptions.rowTemplateAttrs.length) {
            this.gridOptions.rowTemplate = this.constants.grid.GRID_CUSTOM_ROW_TEMPLATE
                .replace('{0}', this.gridOptions.rowTemplateAttrs.join(' '));
        }
        //add default button cols
        const defaultButtons = this.getDefaultGridButtons(this.gridOptions.hiddenActionButtonsOnMobile);
        this.gridOptions.columnDefs = this.gridOptions.columnDefs.concat(defaultButtons);
        //Remove edit-delete buttons from exporting
        if (this.gridOptions.showEditButton)
            this.gridOptions.exporterSuppressColumns.push('edit-button');
        if (this.gridOptions.showDeleteButton)
            this.gridOptions.exporterSuppressColumns.push('delete-button');
        //set pagination
        this.gridOptions.enablePagination =
            this.gridOptions.enablePaginationControls = this.listPageOptions.pagingEnabled;
    }
    /**
     * @abstract Grid Columns
     * @param options Grid Columns
     * @returns {uiGrid.IColumnDef} ui-grid columns definition
     */
    abstract getGridColumns(options: IGridOptions<TModel>): uiGrid.IColumnDefOf<TModel>[];
    /**
     * Register grid api
     * @param gridApi
     */
    protected onRegisterGridApi(gridApi: uiGrid.IGridApiOf<any>): void {
        //register paging event if enabled
        if (this.listPageOptions.pagingEnabled) {
            gridApi.pagination.on.paginationChanged(this.$scope, (currentPage: number, pageSize: number) => {
                if (this.gridOptions.useExternalPagination)
                    this.initSearchModel(this.getPager(currentPage, pageSize));
            });
        }
        //register datachanges
        gridApi.grid.registerDataChangeCallback((grid: uiGrid.IGridInstanceOf<any>) => {
            //set rc badge
            this.recordcountBadge.show = true;
            this.recordcountBadge.description = this.localization.getLocal("rota.kayitsayisi") + " " +
                (this.listPageOptions.pagingEnabled ? this.gridOptions.totalItems.toString() : this.gridData.length.toString());
        }, [this.uigridconstants.dataChange.ROW]);
        //register selection changes
        if (this.isAssigned(gridApi.selection) && this.gridOptions.multiSelect) {
            const selChangedFn = () => {
                this.selectedcountBadge.show = !!this.gridSeletedRows.length;
                this.selectedcountBadge.description = this.gridSeletedRows.length.toString();
            }
            gridApi.selection.on.rowSelectionChanged(this.$scope, row => {
                selChangedFn();
            });
            gridApi.selection.on.rowSelectionChangedBatch(this.$scope, rows => {
                selChangedFn();
            });
        }
        //restore - only columns defined in column options 
        //for mobile view are permitted so skipped for mobile/ tablet
        if (!this.common.isMobileOrTablet()) {
            this.$timeout(() => {
                try {
                    const storedState = this.caching.localStorage
                        .get<uiGrid.saveState.IGridSavedState>(this.gridLayoutStorageName);
                    if (storedState) {
                        gridApi.saveState.restore(this.$rootScope, storedState);
                    }
                } catch (e) {
                    this.removeGridLayout();
                    this.logger.console.error({ message: 'grid layout restoring failed' });
                }
            });
        }
    }

    /**
     * Clear all data and filters
     */
    clearAll(): void {
        this.clearGrid();
        this.initFilter();
    }
    /**
     * Clear grid
     */
    clearGrid(): void {
        this.gridOptions.data = [];
    }
    /**
     * Clear selected rows
     */
    clearSelectedRows(): void {
        this.gridApi.selection.clearSelectedRows();
    }
    //#endregion

    //#region List Model methods

    /**
    * Starts getting model and binding
    * @param pager Paging pager
    */
    initSearchModel(pager?: IPager): ng.IPromise<TModel[] | IPagingListModel<TModel>> {
        let filter = this.filter;
        if (this.listPageOptions.pagingEnabled) {
            filter = this.common.extend<TModelFilter>(filter, pager || this.getPager(1));
        }
        //get data
        return this.initModel(filter);
    }
    //#endregion

    //#region rtListButtons Button Clicks
    /**
    * Go detail state with id param provided
    * @param id
    */
    goToDetailState(id: string, entity?: TModel, row?: uiGrid.IGridRowOf<TModel>, $event?: ng.IAngularEvent): ng.IPromise<any> {
        this.common.preventClick($event);

        if (!this.isAssigned(this.listPageOptions.editState)) {
            this.logger.console.warn({ message: 'listPageOptions.editState is not defined' });
            return;
        }

        const params = {};
        if (this.common.isAssigned(id)) {
            params[this.listPageOptions.newItemParamName] = id;
        }
        return this.routing.go(this.listPageOptions.editState, params);
    }
    /**
     * Init deletion model by unique key
     * @param id Unique id
     */
    protected initDeleteModel(id: number, entity: TModel, $event?: ng.IAngularEvent): ng.IPromise<any> {
        this.common.preventClick($event);
        if (!this.isAssigned(id)) return;

        const confirmText = this.localization.getLocal("rota.deleteconfirm");
        const confirmTitleText = this.localization.getLocal("rota.deleteconfirmtitle");
        return this.dialogs.showConfirm({ message: confirmText, title: confirmTitleText }).then(() => {
            //call delete model
            const deleteResult = this.deleteModel(id, entity);
            //removal of model depends on whether result is promise or void
            if (this.common.isPromise(deleteResult)) {
                return deleteResult.then(() => {
                    this.gridData.deleteById(id);
                    this.gridOptions.totalItems--;
                },
                    (error: IParserException) => {
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
            }
            this.gridData.deleteById(id);
            return;
        });
    }
    /**
     * Delete Model
     * @param id Unique key
     * @description Remove item from grid datasource.Must be overrided to implament your deletion logic and call super.deleteModel();
     */
    deleteModel(id: number | number[], entity: TModel | TModel[]): ng.IPromise<any> | void {
        return undefined;
    }
    /**
     * Init deletetion of selected rows
     */
    initDeleteSelectedModels(): ng.IPromise<any> {
        if (!this.gridSeletedRows.length) return undefined;

        const confirmText = this.localization.getLocal("rota.onaysecilikayitlarisil");
        const confirmTitleText = this.localization.getLocal("deleteconfirmtitle");
        return this.dialogs.showConfirm({ message: confirmText, title: confirmTitleText }).then(() => {
            const keyArray: number[] = this.gridSeletedRows.pluck("id");
            //call delete model
            const deleteResult = this.deleteModel(keyArray, this.gridSeletedRows);
            //removal of model depends on whether result is promise or void
            if (this.common.isPromise(deleteResult)) {
                return deleteResult.then(() => {
                    keyArray.forEach((key) => {
                        this.gridData.deleteById(key);
                    });
                    this.selectedcountBadge.show = false;
                });
            }
            keyArray.forEach((key) => {
                this.gridData.deleteById(key);
            });
            return undefined;
        });
    }
    //#endregion

    //#region Filter Methods
    /**
     * Remove filter
     */
    removeFilter(): void {
        this.caching.cachers[this.listPageOptions.storefilterLocation].remove(this.filterStorageName);
        this.filter = this.getFilter();
        if (this.listPageOptions.showMesssage) {
            this.logger.toastr.info({ message: this.localization.getLocal("rota.filtresilindi") });
        }
    }
    /**
     * Save filter values
     */
    saveFilter(filter?: TModelFilter): void {
        const purgedFilters = _.omit(filter || this.filter, ["pageIndex", "pageSize"]);
        if (!_.isEmpty(purgedFilters)) {
            this.caching.cachers[this.listPageOptions.storefilterLocation].store(this.filterStorageName, purgedFilters);
        }
    }
    /**
     * Filter restore
     */
    getFilter(): TModelFilter {
        let filter: TModelFilter;
        if (this.listPageOptions.storeFilterValues) {
            filter = this.caching.cachers[this.listPageOptions.storefilterLocation]
                .get<TModelFilter>(this.filterStorageName);
        }
        return filter || <TModelFilter>{};
    }
    /**
     * Init filter obj
     */
    initFilter(): void {
        this.filter = <TModelFilter>{};
        //store filter
        const urls = this.caching.localStorage.get<string[]>(this.constants.controller.STORAGE_NAME_STORED_FILTER_URL) || [];
        if (!this.listPageOptions.storeFilterValues)
            this.listPageOptions.storeFilterValues = urls.indexOf(this.routing.current.name) > -1;
        //get filter obj
        this.filter = this.getFilter();
        //watch store filter
        this.$scope.$watch<boolean>('vm.listPageOptions.storeFilterValues',
            (value, oldValue) => {
                if (oldValue !== value) {
                    const index = urls.indexOf(this.routing.current.name);
                    if (value) {
                        index === -1 && urls.push(this.routing.current.name);
                    } else {
                        index > -1 && urls.splice(index, 1);
                    }

                    if (urls.length === 0) {
                        this.caching.localStorage.remove(this.constants.controller.STORAGE_NAME_STORED_FILTER_URL);
                    } else {
                        this.caching.localStorage.store(this.constants.controller.STORAGE_NAME_STORED_FILTER_URL, urls);
                    }
                }
            });
    }
    //#endregion

    //#region Layout Methods
    /**
     * Save grid layout
     */
    saveGridLayout(): void {
        try {
            const savedState = this.gridApi.saveState.save();
            this.caching.localStorage.store(this.gridLayoutStorageName, savedState);
            this.logger.toastr.info({ message: this.localization.getLocal("rota.gridlayoutkaydedildi") });
        } catch (e) {
            this.logger.toastr.error({ message: this.localization.getLocal("rota.gridlayoutkayithata") });
        }
    }
    /**
     * Remove stored grid layout
     */
    removeGridLayout(): void {
        this.caching.localStorage.remove(this.gridLayoutStorageName);
        this.routing.reload();
    }
    //#endregion

    //#region Export Grid
    /**
    * Export grid
    * @param {string} rowTypes which rows to export, valid values are uiGridExporterConstants.ALL,
    * @param {string} colTypes which columns to export, valid values are uiGridExporterConstants.ALL,
    */
    private exportGrid(rowType: string, exportType?: ModelExports): void {
        //default export button action
        if (!exportType) {
            exportType = ModelExports.Pdf;
            if (this.checkEnumFlag(this.listPageOptions.modelExports, ModelExports.Excel)) exportType = ModelExports.Excel; else
                if (this.checkEnumFlag(this.listPageOptions.modelExports, ModelExports.Pdf)) exportType = ModelExports.Pdf; else
                    if (this.checkEnumFlag(this.listPageOptions.modelExports, ModelExports.Csv)) exportType = ModelExports.Csv;
        }
        //warn user for possible delay
        let warnDelay = this.common.promise();
        if (rowType === this.uigridexporterconstants.ALL) {
            warnDelay = this.dialogs.showConfirm({ message: this.localization.getLocal("rota.tumdataexportonay") });
        }
        //export
        warnDelay.then(() => {
            switch (exportType) {
                case ModelExports.Csv:
                    this.gridApi.exporter.csvExport(rowType, this.uigridexporterconstants.ALL);
                    break;
                case ModelExports.Pdf:
                    this.gridApi.exporter.pdfExport(rowType, this.uigridexporterconstants.ALL);
                    break;
                case ModelExports.Excel:
                    let filter: TModelFilter = this.filter;
                    //get filter with paging values
                    filter = angular.extend(filter,
                        this.getPager(null, rowType === this.uigridexporterconstants.ALL && this.constants.grid.GRID_MAX_PAGE_SIZE));
                    //obtain grid fields and header text for server generation
                    const gridExportMeta = this.gridOptions.columnDefs.reduce<IExportOptions>((memo: IExportOptions,
                        curr: uiGrid.IColumnDefOf<TModel>): IExportOptions => {
                        if (curr.displayName) {
                            memo._headers.push(encodeURIComponent(curr.displayName));
                            memo._fields.push((curr.field || curr.name).toLowerCase());
                        }
                        return memo;
                    }, {
                            _fields: [],
                            _headers: [],
                            _exportType: exportType,
                            _fileName: `${s.slugify(this.routing.activeMenu.localizedTitle)}.xlsx`
                        });

                    const exportModel = angular.extend(filter, gridExportMeta);
                    //call export model
                    this.onExportModel(exportModel);
                    break;
                default:
                    this.gridApi.exporter.pdfExport(rowType, this.uigridexporterconstants.ALL);
                    break;
            }
        });
    }
    /**
     * Export model 
     * @param filter Filter
     */
    onExportModel(filter: TModelFilter & IExportOptions): void {
        this.toastr.warn({ message: this.localization.getLocal("rota.exporttanimsiz") });
    }
    //#endregion

    //#region Refresh Grid
    initRefresh(): void {
        if (!this.listPageOptions.enableRefresh) return;

        let autoRefreshPromise: IP<any>;
        this.$scope.$watch<number>('vm.listPageOptions.refreshInterval',
            (value, oldValue) => {
                if (oldValue !== value) {
                    autoRefreshPromise && this.$interval.cancel(autoRefreshPromise);
                    if (angular.isNumber(value)) {
                        autoRefreshPromise = this.$interval(() => {
                            if (this.listPageOptions.showMesssage) {
                                this.logger.toastr.info({ message: this.localization.getLocal("rota.refreshinprogress") });
                            }
                            this.initSearchModel();
                        }, value * 60 * 1000);
                    }
                }
            });
    }
    //#endregion
}

export default BaseListController 