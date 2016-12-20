//#region Interfaces
/**
 * Select Model
 */
interface ISelectModel extends IBaseModel {
    disabled?: boolean;
    icon?: string;
}
/**
 * Group Item Moedl
 */
interface IGroupItemModel extends ISelectModel {
}
/**
 * Selection model interface for prototyping issues
 */
interface ISelection {
    model: ISelectModel
}
/**
 * Used Constants
 */
interface ISelectConstants {
    /**
     * When Enum object binded,its key value
     */
    objValuePropName: string;
    /**
     * When Enum object binded,its text value
     */
    objDisplayPropName: string;
    /**
     * Filter startsWith 
     */
    filterStartsWith: string;
    /**
     * Filter contains
     */
    filterContains: string;
    /**
     * Default placeholder
     */
    defaultPlaceholderKey: string;
    /**
     * Min autosuggest keyword length
     */
    minAutoSuggestCharLen: number;
    /**
     * Key code to clear model 
     */
    keyCodeToClearModel: number;
    /**
     * Key code to add model 
     */
    keyCodeToAddModel: number;
    /**
     * Default items count to display
     */
    defaultItemsCount: number;
    /**
     * Refresh delay 
     */
    defaultRefreshDelay: number;
}
/**
 * Selected event args
 */
interface ISelectedEventArgs {
    modelValue?: number;
    model?: ISelectModel,
    scope: ISelectScope;
}
/**
 * Selected event
 */
interface ISelectedIndexChangedEvent {
    (args: { args: ISelectedEventArgs }): void
}
/**
 * Data fetcher event interface
 */
interface IItemsDataSourceMethod<T> {
    (...args: any[]): ng.IPromise<T> | T;
}
/**
 * rtSelect attributes
 */
interface ISelectAttributes extends ng.IAttributes {
    /**
     * Flag to check autosuggest mode is on
     */
    onRefresh: string;
    /**
     * Propertyof model to be grouped by
     */
    groupbyProp: string;
    /**
     * Display property name of model
     */
    displayProp: string;
    /**
     * Custom row template
     */
    displayTemplate: string;
    /**
     * Custom selected template
     */
    selectedTemplate: string;
    /**
     * Custom filter
     * @description Fields names delimeted by comma
     * @example "name,surname"
     */
    customFilter: string;
    /**
     * Value property anme of model
     */
    valueProp: string;
    /**
     * With of rtSelect default to 100%
     */
    width: string;
    /**
     * rtSelect Placeholder
     */
    placeholder: string;
    /**
     * rtSelect Placeholder i18n
     */
    phI18n: string;
    /**
     * Min autosuggest keyboard length
     */
    minAutoSuggestCharLen: number;
    /**
     * Custom class to be added container 
     */
    class: string;
    /**
     * Trigger onChange event programatically,default false
     */
    fireOnchange?: boolean;
    /**
   * New item modal options
   */
    newItemOptions: IModalOptions;
    /**
     * Search items model options
     */
    searchItemsOptions: IModalOptions;
    /**
     * Item style
     * @param item Select Item
     * @returns {string} 
     */
    onStyle: (item: ISelectModel) => string;
    /**
     * Max items to display ,default 100 
     */
    itemsCount?: number;
}
/**
 * Select localization struct
 */
interface ISelectI18NService {
    escsilaciklama: string;
    enazkaraktersayisi: string;
    yeniitemicinarti: string;

}
/**
 * Select scope
 */
interface ISelectScope extends ng.IScope {
    //#region Internal params
    /**
     * Focus name to implicitly focus ui-select by broadcasting event
     */
    focusEventName?: string;
    /**
     * Flag that if select is clearable or not
     */
    allowClear?: boolean;
    /**
     * Select tooltips
     */
    toolTips?: string;
    /**
     * Key press event for managing actions shortcut
     * @param e Angular event
     */
    manageKeys: (e: JQueryEventObject) => any;
    /**
     * Items binded to ui-select
     */
    listItems: Array<ISelectModel>;
    /**
     * Selected model
     */
    selected: ISelection;
    /**
     * Group by function
     * @param model Model
     */
    groupbyFn: (model: ISelectModel) => any;
    /**
     * Refresh function to bind in autosuggest mode
     * @param keyword Keyword
     */
    refreshFn: (keyword: string) => void;
    /**
     * Selected item changed event
     * @param item Model
     * @param model Model
     */
    onItemSelect: (item: ISelectModel, model: ISelectModel) => void;
    /**
     * Opens a new item modal window
     * @param event Event
     */
    runNewItem: (event?: ng.IAngularEvent) => void;
    /**
     * Opens a search items modal window
     * @param event Event
     */
    searchItems: (event: ng.IAngularEvent) => void;
    //#endregion

    //#region External params 
    /**
     * SelectedIndex changed event 
     */
    onChange: ISelectedIndexChangedEvent;
    /**
     * Triggered event after items get populated
     * @param model Items
     */
    onRetrived: (model: { items: Array<ISelectModel> }) => void;
    /**
     * New item modal options
     */
    newItemOptions: IModalOptions;
    /**
     * Search items model options
     */
    searchItemsOptions: IModalOptions;
    /**
     * Datasource object model
     */
    items: ISelectModel[];
    /**
     * Method that returns datasource object for combo mode
     */
    onFetch: IItemsDataSourceMethod<Array<ISelectModel>>;
    /**
     * Method that returns datasource object for autosuggest mode
     */
    onRefresh: IItemsDataSourceMethod<Array<ISelectModel>>;
    /**
     * In AutoSuggest mode,get select model by model value
     */
    onGet: IItemsDataSourceMethod<ISelectModel>;
    /**
     * Item style
     * @param item Select Item
     * @returns {string} 
     */
    onStyle: (item: ISelectModel) => string;
    /**
    * Items method's optional parameters
    */
    params: any;
    /**
     * Disable state
     */
    ngDisabled: any;
    //#endregion
}
/**
 * Select style
 */
interface ISelectColorAttrs extends ng.IAttributes {
    rtSelectStyle: any;
}
//#endregion
