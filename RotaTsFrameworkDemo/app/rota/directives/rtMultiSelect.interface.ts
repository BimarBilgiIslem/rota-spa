//#region Interfaces
/**
 * Multi Select Model
 */
interface IMultiSelectModel {
    $selectItem?: ISelectModel;
    $model?: IBaseCrudModel | number;
}
/**
 * event args for MultiSelect adding or removing items
 */
interface IMultiSelectedEventArgs extends IMultiSelectModel {
    /**
     * Flag indicates that all items being removed or added
     */
    isBatchProcess?: boolean;
}
/**
 * Notififcation struct
 */
interface IMultiSelectNotification {
    /**
     * Notification message
     */
    message: string;
    /**
     * Notification Type
     */
    type: IAlertStyle;
}
/**
 * Localization structs
 */
interface IMultiSelectI18NService {
    kayitsayisi: string;
    kayitbulunamadi: string;
    islemler: string;
    tumunuekle: string;
    tumunusil: string;
    sil: string;
    kayitsilindi: string;
    kayiteklendi: string;
    zatenekli: string;
    silinenItemGeriAlindi: string;
    onaytumkayitekle: string;
    onaytumkayitsil: string;
    tumkayitlarsilindi: string;
    tumkayitlareklendi: string;
}
/**
 * rtMultiSelect attributes
 */
interface IMultiSelectAttributes extends ISelectAttributes {
    /**
     * Value prop name of list model which equals to value-prop of select model
     */
    modelProp: string;
    /**
     * Radio selection model property name
     */
    selectionProp: string;
    /**
     * NgDisabled - Disabled state
     */
    ngDisabled: any;
    /**
     * Required flag
     */
    required: boolean;
    /**
     * ngModel
     */
    ngModel: any;
}
/**
 * Multi Select scope
 */
interface IMultiSelectScope extends ISelectScope {
    /**
     * Autosuggest flag
     * @description declared refresh  method indicates that control will be autosuggest
     */
    autoSuggest: boolean;
    /**
     * Selected model {ISelectModel}
     */
    selectedModel: ISelectModel;
    //Localizations
    ttTumunuekle: string;
    ttTumunusil: string;
    ttSil: string;
    ttKayitbulunamadi: string;
    ttIslemler: string;
    /**
     * Selection enabled flag
     */
    showSelection: boolean;
    /**
     * Visible items shown on the list
     */
    visibleItems: IMultiSelectModel[];
    /**
     * Grouped items
     */
    groupItems: _.Dictionary<IMultiSelectModel[]>;
    /**
     * Information label shown on footer
     */
    recordInfo: string;
    /**
     * Selection event when triggered radio button clicked
     * @param selItem Selection item
     * @param groupItems Grouped items if enabled
     */
    setSelected: (selItem: IBaseCrudModel, groupItems: IGroupItemModel[]) => void;
    /**
     * Remove item
     * @param item Item to be removed 
     * @param event Angular event
     */
    removeItem: (item: IBaseCrudModel, event: ng.IAngularEvent) => ng.IPromise<any>;
    /**
     * Add all items
     * @param event Angular event     
     */
    addAll: (event: ng.IAngularEvent) => void;
    /**
     * Remove all items
     * @param event Angular event     
     */
    removeAll: (event: ng.IAngularEvent) => void;
    /**
     * Triggered when select items get populated
     * @param items Select items     
     */
    onItemsPopulated: (items: Array<ISelectModel>) => void;
    /**
     * Triggered when selection changed
     * @param args Selection args     
     */
    onSelectionChanged: (args: ISelectedEventArgs) => void;
    /**
     * Notification object
     */
    notification: IMultiSelectNotification;
    /**
     * Triggered when an item has been removed
     * @param item Removed item
     */
    onRemoved: (item: any) => void;
    /**
     * Triggered when an item is about to remove
     * @description Return rejected promise to stop removing process
     * @param item Removed item
     */
    onRemove: (item: any) => ng.IPromise<any>;
    /**
     * Triggered when an item has been added
     * @param item Removed item
     */
    onAdded: (item: any) => void;
    /**
     * Triggered when an item is about to add
     * @description Return rejected promise to stop adding process
     * @param item Added item
     */
    onAdd: (item: any) => ng.IPromise<any>;
    /**
     * Hides a action buttons
     */
    hideButtons?: boolean;
}
/**
 * Mapper obj
 */
interface IMapper<TContext, TTarget> {
    (context: TContext): TTarget;
}
//#endregion

