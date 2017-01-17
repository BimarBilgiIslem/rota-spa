//#region Imports
import { BaseModelController } from "./basemodelcontroller"
//#endregion
/**
 * Base List Controller
 * @description This base class should be inherited for all controllers using restful services
 * @param {TModel} is your custom model view.
 */
abstract class BaseListController<TModel extends IBaseCrudModel, TModelFilter extends IBaseListModelFilter>
    extends BaseModelController<TModel> {
    //#region Props
    //#region Statics
    /**
     * Localized values for crud page
     */
    protected static localizedValues: IListPageLocalization;
    /**
     * List Page options
     */
    private static defaultOptions: IListPageOptions = {
        initializeModel: true,
        scrollToTop: true,
        pagingEnabled: true,
        editState: undefined,
        showMesssage: true,
        listButtonVisibility: {
            newButton: true,
            searchButton: true,
            clearButton: true,
            exportButton: true,
            deleteSelected: true
        },
        storeFilterValues: false
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
    get model(): IBaseListModel<TModel> | IPagingListModel<TModel> { return <IBaseListModel<TModel> | IPagingListModel<TModel>>this._model; }
    set model(value: IBaseListModel<TModel> | IPagingListModel<TModel>) {
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
    get gridData(): IBaseListModel<TModel> { return <IBaseListModel<TModel>>this.gridOptions.data; }
    /**
     * Selected rows
     * @returns {} 
     */
    get gridSeletedRows(): IBaseListModel<TModel> {
        if (this.isAssigned(this.gridApi) && this.isAssigned(this.gridApi.selection)) {
            return this.gridApi.selection.getSelectedRows();
        }
        return [];
    }
    /**
     * Filter object
     */
    public filter: TModelFilter;
    //#endregion
    //#endregion

    //#region Bundle Services
    static injects = BaseModelController.injects.concat(['uiGridConstants', 'uiGridExporterConstants', 'Caching']);
    protected uigridconstants: uiGrid.IUiGridConstants;
    protected uigridexporterconstants: uiGrid.exporter.IUiGridExporterConstants;
    protected caching: ICaching;
    //#endregion

    //#region Init
    /**
     * Extend crud page options with user options
     * @param bundle Service Bundle
     * @param options User options
     */
    private static extendOptions(bundle: IBundle, options?: IListPageOptions): IListPageOptions {
        const configService = bundle.systemBundles["config"] as IMainConfig;
        const listOptions: IListPageOptions = angular.merge({}, BaseListController.defaultOptions,
            {
                newItemParamName: configService.defaultNewItemParamName,
                pageSize: configService.gridDefaultPageSize
            }, options);
        return listOptions;
    }
    /**
     * Constructor
     * @param bundle Service bundle
     * @param options List page user options
     */
    constructor(bundle: IBundle, options?: IListPageOptions) {
        //merge options with defaults
        super(bundle, BaseListController.extendOptions(bundle, options));
        //set badge
        if (!this.stateInfo.isNestedState) {
            this.recordcountBadge.show = true;
            this.recordcountBadge.description = BaseListController.localizedValues.kayitsayisi + " 0";
        }
        //init filter object 
        this.filter = this.listPageOptions.storeFilterValues ?
            this.caching.sessionStorage.get<TModelFilter>(this.routing.currentUrl) || <TModelFilter>{} : <TModelFilter>{};
        //set grid features
        this.initGrid();
    }
    /**
     * Update bundle
     * @param bundle IBundle
     */
    initBundle(bundle: IBundle): void {
        super.initBundle(bundle);
        this.uigridconstants = bundle.systemBundles["uigridconstants"];
        this.uigridexporterconstants = bundle.systemBundles["uigridexporterconstants"];
        this.caching = bundle.systemBundles["caching"];
    }
    /**
     * Store localized value for performance issues (called in basecontroller)
     */
    protected storeLocalization(): void {
        if (BaseListController.localizedValues) return;

        BaseListController.localizedValues = {
            kayitbulunamadi: this.localization.getLocal('rota.kayitbulunamadi'),
            deleteconfirm: this.localization.getLocal('rota.deleteconfirm'),
            deleteconfirmtitle: this.localization.getLocal('rota.deleteconfirmtitle'),
            deleteselected: this.localization.getLocal('rota.onaysecilikayitlarisil'),
            kayitsayisi: this.localization.getLocal('rota.kayitsayisi')
        };
    }
    //#endregion

    //#region BaseModelController methods
    /**
    * @abstract Get model
    * @param args Model
    */
    abstract getModel(modelFilter?: TModelFilter): ng.IPromise<IBaseListModel<TModel>> |
        IBaseListModel<TModel> | ng.IPromise<IPagingListModel<TModel>> | IPagingListModel<TModel>;
    /**
     * Check if model is null ,set it empty array for grid
     * @param model Model
     */
    protected setModel(model: IBaseListModel<TModel> | IPagingListModel<TModel>): IBaseListModel<TModel> | IPagingListModel<TModel> {
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
    public loadedModel(model: IBaseListModel<TModel> | IPagingListModel<TModel>): void {
        //set grid datasource
        if (this.listPageOptions.pagingEnabled) {
            this.gridOptions.totalItems = (<IPagingListModel<TModel>>model).total || 0;
            this.gridOptions.data = (<IPagingListModel<TModel>>model).data;
            super.loadedModel((<IPagingListModel<TModel>>model).data);
        } else {
            this.gridOptions.data = <IBaseListModel<TModel>>model;
            super.loadedModel(<IBaseListModel<TModel>>model);
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
                recCount = (<IBaseListModel<TModel>>model).length;
            }
        }
        if (recCount === 0 && this.isActiveState() && this.listPageOptions.showMesssage) {
            this.toastr.warn({ message: BaseListController.localizedValues.kayitbulunamadi });
        }
    }
    //#endregion

    //#region Grid methods
    //#region Default Methods
    /**
    * Get default buttons
    */
    protected getDefaultGridButtons(): uiGrid.IColumnDef[] {
        const buttons: uiGrid.IColumnDef[] = [];
        const getButtonColumn = (name: string, template: string): any => {
            return {
                name: name,
                cellClass: 'col-align-center',
                width: '30',
                displayName: '',
                enableColumnMenu: false,
                cellTemplate: template
            };
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
        //ui-grid/ui-grid-row
        return {
            showEditButton: true,
            showDeleteButton: true,
            enableColumnMoving: true,
            enableColumnResizing: true,
            rowTemplateAttrs: [],
            //Row selection
            enableRowSelection: false,
            enableSelectAll: true,
            multiSelect: true,
            //Data
            data: [] as Array<TModel>,
            //Pager
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: this.listPageOptions.pageSize,
            useExternalPagination: true,
            //Export
            exporterSuppressColumns: [],
            exporterAllDataFn: (): ng.IPromise<any> => {
                const result = this.initSearchModel(this.getDefaultPagingFilter(1, this.gridOptions.totalItems));
                return (result as ng.IPromise<IPagingListModel<TModel>>).then(() => {
                    this.gridOptions.useExternalPagination = false;
                });
            },
            exporterCsvFilename: 'myFile.csv',
            exporterPdfDefaultStyle: { fontSize: 9 },
            exporterPdfTableStyle: { margin: [5, 5, 5, 5] },
            exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
            exporterPdfHeader: { text: this.routing.activeMenu.name, style: 'headerStyle' },
            exporterPdfFooter: (currentPage: number, pageCount: number) => {
                return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
            },
            exporterPdfCustomFormatter: docDefinition => {
                docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
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
    getDefaultPagingFilter(pageIndex?: number, pageSize?: number): any {
        const filter = {};
        filter[this.constants.grid.GRID_PAGE_INDEX_FIELD_NAME] = pageIndex || 1;
        filter[this.constants.grid.GRID_PAGE_SIZE_FIELD_NAME] = pageSize || this.listPageOptions.pageSize;
        return filter;
    }
    //#endregion

    /**
    * Initialize grid
    */
    private initGrid(): void {
        //get default options
        const options = this.getDefaultGridOptions();
        //merge user-defined cols
        this.gridOptions = angular.extend(options, { columnDefs: this.getGridColumns(options) });
        //Set rowFormatter attrs if assigned
        if (this.isAssigned(this.gridOptions.rowFormatter)) {
            this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_ROW_FORMATTER_ATTR);
        }
        if (this.isAssigned(this.gridOptions.showContextMenu)) {
            this.gridOptions.rowTemplateAttrs.push(this.constants.grid.GRID_CONTEXT_MENU_ATTR);
        }
        //Set row template
        if (this.gridOptions.rowTemplateAttrs.length) {
            this.gridOptions.rowTemplate = this.constants.grid.GRID_CUSTOM_ROW_TEMPLATE
                .replace('{0}', this.gridOptions.rowTemplateAttrs.join(' '));
        }
        //add default button cols
        const defaultButtons = this.getDefaultGridButtons();
        this.gridOptions.columnDefs = this.gridOptions.columnDefs.concat(defaultButtons);
        //Remove edit-delete buttons from exporting
        if (this.gridOptions.showEditButton)
            this.gridOptions.exporterSuppressColumns.push('edit-button');
        if (this.gridOptions.showDeleteButton)
            this.gridOptions.exporterSuppressColumns.push('delete-button');
        //set pagination
        this.gridOptions.enablePagination =
            this.gridOptions.enablePaginationControls = this.listPageOptions.pagingEnabled;
        //load initially if enabled
        if (this.listPageOptions.initializeModel) {
            this.initSearchModel();
        }
    }
    /**
     * @abstract Grid Columns
     * @param options Grid Columns
     * @returns {uiGrid.IColumnDef} ui-grid columns definition
     */
    abstract getGridColumns(options: IGridOptions<TModel>): uiGrid.IColumnDef[];
    /**
     * Register grid api
     * @param gridApi
     */
    protected onRegisterGridApi(gridApi: uiGrid.IGridApiOf<any>): void {
        //register paging event if enabled
        if (this.listPageOptions.pagingEnabled) {
            gridApi.pagination.on.paginationChanged(this.$scope, (currentPage: number, pageSize: number) => {
                if (this.gridOptions.useExternalPagination)
                    this.initSearchModel(this.getDefaultPagingFilter(currentPage, pageSize));
            });
        }
        //register datachanges
        if (!this.stateInfo.isNestedState) {
            gridApi.grid.registerDataChangeCallback((grid: uiGrid.IGridInstanceOf<any>) => {
                this.recordcountBadge.description = BaseListController.localizedValues.kayitsayisi + " " +
                    (this.listPageOptions.pagingEnabled ? this.gridOptions.totalItems.toString() : this.gridData.length.toString());
            }, [this.uigridconstants.dataChange.ROW]);
            //register selection changes
            if (this.isAssigned(gridApi.selection)) {
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
        }
    }

    /**
     * Clear all data and filters
     */
    clearAll(): void {
        this.clearGrid();
        this.filter = <TModelFilter>{};
        if (this.listPageOptions.storeFilterValues) {
            this.caching.sessionStorage.remove(this.routing.currentUrl);
        }
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
    /**
     * Export grid
     * @param {string} rowTypes which rows to export, valid values are uiGridExporterConstants.ALL,
     * @param {string} colTypes which columns to export, valid values are uiGridExporterConstants.ALL,
     */
    exportGrid(rowType: string, colTypes: string): void {
        if (rowType === "all") {
            this.dialogs.showConfirm({ message: this.localization.getLocal("rota.tumdataexportonay") }).then((): void => {
                this.gridApi.exporter[colTypes](rowType, this.uigridexporterconstants.ALL);
            });
            return;
        }
        this.gridApi.exporter[colTypes](rowType, this.uigridexporterconstants.ALL);
    }
    //#endregion

    //#region List Model methods

    /**
    * Starts getting model and binding
    * @param pager Paging pager
    */
    initSearchModel(pager?: any): ng.IPromise<IBaseListModel<TModel>> | ng.IPromise<IPagingListModel<TModel>> {
        let filter: TModelFilter = this.filter;
        if (this.listPageOptions.pagingEnabled) {
            filter = angular.extend(filter, pager || this.getDefaultPagingFilter());
        }
        return this.initModel(filter);
    }
    //#endregion

    //#region Button Clicks
    /**
    * Go detail state with id param provided
    * @param id
    */
    goToDetailState(id: string): ng.IPromise<any> {
        const params = {};
        if (this.common.isAssigned(id)) {
            params[this.listPageOptions.newItemParamName] = id;
            //store filter values if any
            if (this.listPageOptions.storeFilterValues) {
                const purgedFilters = _.omit(this.filter, [this.constants.grid.GRID_PAGE_INDEX_FIELD_NAME,
                this.constants.grid.GRID_PAGE_SIZE_FIELD_NAME]);
                if (!_.isEmpty(purgedFilters))
                    this.caching.sessionStorage.store(this.routing.currentUrl, purgedFilters);
            }
        }
        return this.routing.go(this.listPageOptions.editState, params);
    }
    /**
     * Init deletion model by unique key
     * @param id Unique id
     */
    protected initDeleteModel(id: number): ng.IPromise<any> {
        if (id === undefined || id === null || !id) return undefined;

        const confirmText = BaseListController.localizedValues.deleteconfirm;
        const confirmTitleText = BaseListController.localizedValues.deleteconfirmtitle;
        return this.dialogs.showConfirm({ message: confirmText, title: confirmTitleText }).then(() => {
            //call delete model
            const deleteResult = this.deleteModel(id);
            //removal of model depends on whether result is promise or void
            if (this.common.isPromise(deleteResult)) {
                return deleteResult.then(() => {
                    this.gridData.deleteById(id);
                    this.gridOptions.totalItems--;
                });
            }
            this.gridData.deleteById(id);
            return undefined;
        });
    }
    /**
     * Delete Model
     * @param id Unique key
     * @description Remove item from grid datasource.Must be overrided to implament your deletion logic and call super.deleteModel();
     */
    deleteModel(id: number | number[]): ng.IPromise<any> | void {
        return undefined;
    }
    /**
     * Init deletetion of selected rows
     */
    initDeleteSelectedModels(): ng.IPromise<any> {
        if (!this.gridSeletedRows.length) return undefined;

        const confirmText = BaseListController.localizedValues.deleteselected;
        const confirmTitleText = BaseListController.localizedValues.deleteconfirmtitle;
        return this.dialogs.showConfirm({ message: confirmText, title: confirmTitleText }).then(() => {
            const keyArray: number[] = _.pluck(this.gridSeletedRows, 'id');
            //call delete model
            const deleteResult = this.deleteModel(keyArray);
            //removal of model depends on whether result is promise or void
            if (this.common.isPromise(deleteResult)) {
                return deleteResult.then(() => {
                    keyArray.forEach((key) => {
                        this.gridData.deleteById(key);
                    });
                });
            }
            keyArray.forEach((key) => {
                this.gridData.deleteById(key);
            });
            return undefined;
        });
    }

    //#endregion
}

export { BaseListController }