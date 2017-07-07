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
import * as _s from "underscore.string";
import * as $ from 'jquery';
import ObserableModel from "../base/obserablemodel";
//#endregion

//#region Multi Select Directive
function multiSelectDirective($timeout: ng.ITimeoutService, $parse: ng.IParseService, $injector: ng.auto.IInjectorService,
    $q: ng.IQService, common: ICommon, logger: ILogger, dialogs: IDialogs, multiSelectI18NService: IMultiSelectI18NService,
    constants: IConstants) {

    function compile(cElement: ng.IAugmentedJQuery, cAttrs: IMultiSelectAttributes) {
        //#region DOM manupulations
        //#region rtSelect settings
        const dropDown = $('rt-select', cElement);
        dropDown.attr('value-prop', cAttrs.valueProp)
            .attr('display-prop', cAttrs.displayProp)
            .attr('custom-filter', cAttrs.customFilter)
            .attr('display-template', cAttrs.displayTemplate)
            .attr('groupby-prop', cAttrs.groupbyProp)
            .attr('ph-i18n', cAttrs.phI18n)
            .attr('placeholder', cAttrs.placeholder)
            .attr('items-count', cAttrs.itemsCount)
            .attr('new-item-options', <any>cAttrs.newItemOptions)
            .attr('search-item-options', <any>cAttrs.searchItemsOptions);

        if (common.isDefined(cAttrs.onRefresh)) {
            dropDown.attr('on-refresh', 'onRefresh({keyword:keyword})');
            dropDown.attr('on-get', 'onGet({id:id})');
        } else {
            dropDown.attr('items', 'items');
            dropDown.attr('on-fetch', 'onFetch({params:params})');
        }
        //#endregion
        const groupbyEnabled = common.isDefined(cAttrs.groupbyProp);
        //Display template
        if (cAttrs.displayTemplate) {
            $('td.value', cElement).html(common.updateExpressions(cAttrs.displayTemplate, 'item.$selectItem'));
        } else {
            $('td.value', cElement).html('{{item.$selectItem.' + cAttrs.displayProp + '}}');
        }
        //Selection Prop
        if (common.isDefined(cAttrs.selectionProp)) {
            const timestamp = common.getRandomNumber();
            $('td.selection>input:radio', cElement).attr('name', (groupbyEnabled ? '{{group}}' + timestamp : timestamp))
                .attr('ng-model', 'item.$model.' + cAttrs.selectionProp);
            //selection row highlight class
            $('tr.item', cElement).attr('ng-class', '{selected:item.$model.' + cAttrs.selectionProp + '}');
        }
        //#endregion
        return (scope: IMultiSelectScope, element: ng.IAugmentedJQuery, attrs: IMultiSelectAttributes,
            modelCtrl: ng.INgModelController): void => {
            //#region Init Attrs
            /**
            * AutoSuggest flag
            */
            const autoSuggest = common.isDefined(attrs.onRefresh);
            /**
             * Filter mode active flag
             */
            const isFilterMode = !common.isDefined(attrs.modelProp);
            /**
             * Value prop getter function
             */
            const valuePropGetter = attrs.valueProp && $parse(attrs.valueProp);
            /**
             * Model value prop getter function
             */
            const modelValuePropGetter = attrs.modelProp && $parse(attrs.modelProp);
            /**
             * Added items store 
             */
            const addedItems: IMultiSelectModel[] = [];
            /**
             * Listing defer obj
             * @description  Wait for the request to finish so that items would be available for ngModel changes to select
             */
            let asyncModelRequestResult: ng.IDeferred<Array<ISelectModel>> = $q.defer();
            /**
             * Model is being updated from ngModel
             */
            let initializingModel: boolean = true;
            //if autosuggest,initially resolve selectItems promise
            if (autoSuggest) asyncModelRequestResult.resolve([]);
            //#endregion

            //#region Validations
            if (common.isDefined(cAttrs.selectionProp) && isFilterMode) {
                throw new Error(constants.errors.SELECTION_NOT_AVAILABLE);
            }
            if (!common.isAssigned(valuePropGetter)) {
                throw new Error(constants.errors.MISSING_VALUE_PROP);
            }
            //#endregion

            //#region Mappers
            /**
             * Base mapper function
             * @param context Context obj
             * @param parser Parser method
             */
            const getMappedValue = <TContext extends IBaseModel, TTarget>(context: TContext, parser?: ng.ICompiledExpression): TTarget => {
                if (parser && angular.isObject(context)) {
                    return <TTarget>parser(context);
                }
                return <any>context;
            }
            const getSelectValueMapper: IMapper<ISelectModel, number> = (context: ISelectModel): number => getMappedValue<ISelectModel, number>(context, valuePropGetter);
            const getModelValueMapper: IMapper<IBaseCrudModel | number, number> = (context: IBaseCrudModel) => getMappedValue<IBaseCrudModel, number>(context, modelValuePropGetter || valuePropGetter);
            //#endregion

            //#region Utility
            /**
             * Update visible items
             */
            const refresh = (): void => {
                scope.visibleItems = isFilterMode ? addedItems : _.filter(addedItems, item => (item.$model as IBaseCrudModel).modelState !== ModelStates.Deleted &&
                    (item.$model as IBaseCrudModel).modelState !== ModelStates.Detached);

                if (groupbyEnabled) {
                    scope.groupItems = _.groupBy<IMultiSelectModel>(scope.visibleItems, model => {
                        return model.$selectItem[attrs.groupbyProp];
                    });
                }
                //run all validators
                modelCtrl.$validate();
                //set required validator
                const required = !scope.visibleItems.length && common.isDefined(attrs.required) && attrs.required;
                modelCtrl.$setValidity('required', !required);
            }
            /**
             *  Find list item by list item or value
             * @param value List item object or value
             */
            const findSelectItem = (value: IBaseCrudModel | number): ng.IPromise<ISelectModel> => {
                const findValue = getModelValueMapper(value);
                return asyncModelRequestResult.promise.then((items: ISelectModel[]) => {
                    const foundItem = _.find<ISelectModel>(items, (item): boolean => {
                        const modelValue = getSelectValueMapper(item);
                        return modelValue === findValue;
                    });
                    return foundItem || common.rejectedPromise();
                });
            }
            /**
             * Find list item by list item or value
             * @param value List item object or value
             */
            const findListItem = (value: ISelectModel): IMultiSelectModel => {
                const findValue = getSelectValueMapper(value);
                return _.find(addedItems, (item: IMultiSelectModel): boolean => {
                    const modelValue = getModelValueMapper(item.$model);
                    return modelValue === findValue;
                });
            }
            /**
             * Check whether model already added
             * @param model Model
             */
            const findListItemByModel = (model: IBaseCrudModel | number): IMultiSelectModel => {
                const findValue = getModelValueMapper(model);
                const foundItem = _.find(addedItems, (item: IMultiSelectModel): boolean => {
                    const modelValue = getModelValueMapper(item.$model);
                    return modelValue === findValue;
                });
                return foundItem;
            }
            //#endregion

            //#region ngModel Methods
            if (!isFilterMode) {
                //Inject formatter pipeline
                modelCtrl.$formatters.push((items: IBaseListModel<IBaseCrudModel> | Array<number>) => {
                    if (!items) return items;
                    //clear previous items
                    addedItems.length = 0;
                    //load item on init
                    addModels(items);
                    //watch models changes for update view
                    (items as IBaseListModel<IBaseCrudModel>)
                        .subscribeCollectionChanged((action?: ModelStates, model?: IBaseCrudModel) => {
                            if (action === ModelStates.Added) {
                                const existingModel = findListItemByModel(model);
                                if (!existingModel ||
                                    (existingModel.$model as IBaseCrudModel).modelState === ModelStates.Detached)
                                    addModels([model]);
                            } else {
                                refresh();
                            }
                        });

                    return items;
                });
            } else {
                scope.$parent.$watchCollection<Array<number>>(attrs.ngModel, (newItems, oldItems) => {
                    //remove items
                    _.each(_.difference<number>(oldItems, newItems) as Array<number>, (item: number) => {
                        removeItem(findListItemByModel(item));
                    });
                    //add items
                    const itemsToAdd = _.filter(newItems, item => !findListItemByModel(item));
                    addModels(itemsToAdd);
                });
            }
            //#endregion

            //#region Adding Methods
            /**
           * Update value according to ngModel
           * @param model
           */
            const addModels = (items: IBaseListModel<IBaseCrudModel> | Array<number>): void => {
                const resultPromises: ng.IPromise<any>[] = [];
                let result = common.promise();
                //this flag is to prevent triggering events
                initializingModel = true;

                for (let i = 0; i < items.length; i++) {
                    result = ((promise: ng.IPromise<any>, model: IBaseCrudModel | number) => {
                        return promise.finally(() => {
                            const modelResultPromise = findSelectItem(model).catch(() => {
                                if (scope.onGet)
                                    return common.makePromise<ISelectModel>(scope.onGet({ id: getModelValueMapper(model) }));
                            });
                            return modelResultPromise.then((selectItem: ISelectModel): ng.IPromise<any> => {
                                return addItem(selectItem, model).catch((message: string) => {
                                    message && logger.toastr.warn({ message: message });
                                });
                            });
                        });
                    })(result, items[i]);
                    resultPromises.push(result);
                }

                $q.all(resultPromises).finally((): void => {
                    refresh();
                    initializingModel = false;
                    scope.selectedModel = null;
                });
            }
            /**
            * Create multi select model or add selected value
            * @param selectItem Select Item
            */
            const createModel = (selectItem: ISelectModel): IBaseCrudModel | number => {
                //get selected item value
                const selectValue = getSelectValueMapper(selectItem);

                if (!isFilterMode) {
                    //create model
                    const model = common.newCrudModel();
                    model[attrs.modelProp] = selectValue;
                    if (scope.showSelection) {
                        model[attrs.selectionProp] = false;
                    }
                    return new ObserableModel(model);
                } else {
                    return selectValue;
                }
            }
            /**
            * Add all items to list
            */
            const addAll = (): ng.IPromise<any> => {
                return asyncModelRequestResult.promise.then((items: ISelectModel[]) => {
                    const allP = [];
                    items.forEach((item): void => {
                        allP.push(
                            addItem(item, null, true)
                                .then((model: IBaseCrudModel | number) => {
                                    if (!isFilterMode)
                                        (modelCtrl.$modelValue as IBaseListModel<IBaseCrudModel>)
                                            .add(model as IBaseCrudModel);
                                    else
                                    (modelCtrl.$modelValue as Array<number>).unshift(model as number);
                                }));
                    });

                    return $q.all(allP)
                        .finally(() => {
                            refresh();
                        });
                });
            }
            /**
            * Add item to list
            * @param selectItem Select Item
            * @param model Existing model
            */
            const addItem = (selectItem: ISelectModel, model?: IBaseCrudModel | number, isBatchProcess?: boolean): ng.IPromise<IBaseCrudModel | number | string> => {
                if (!common.isAssigned(selectItem)) return common.rejectedPromise('select item must be assigned');
                const defer = $q.defer<any>();
                //check item already added previously
                const existingModel = findListItem(selectItem);
                const msModelArgs: IMultiSelectedEventArgs = { isBatchProcess: isBatchProcess };

                if (!common.isAssigned(existingModel)) {
                    msModelArgs.$model = model || createModel(selectItem);
                    msModelArgs.$selectItem = selectItem;
                    //call onadd method - 
                    const addResult = initializingModel ? common.promise() : scope.onAdd({ args: msModelArgs });
                    const addResultPromise = common.makePromise(addResult);
                    addResultPromise.then((): void => {
                        addedItems.unshift({ $model: msModelArgs.$model, $selectItem: msModelArgs.$selectItem });
                        modelCtrl.$setDirty();
                        //call added event
                        if (!initializingModel) {
                            scope.onAdded({ args: msModelArgs });
                        }
                        defer.resolve(msModelArgs.$model);
                    }, (reason: string): void => {
                        defer.reject(reason);
                    });
                } else {
                    if (!isFilterMode) {
                        //model mode here
                        const obserableModel = existingModel.$model as IBaseCrudModel;
                        if (obserableModel.modelState === ModelStates.Deleted ||
                            obserableModel.modelState === ModelStates.Detached) {
                            //if deleted previously,just make it visible again
                            obserableModel.modelState = obserableModel.modelState === ModelStates.Deleted
                                ? ModelStates.Unchanged
                                : ModelStates.Added;
                            //call added event
                            msModelArgs.$model = existingModel.$model;
                            msModelArgs.$selectItem = existingModel.$selectItem;
                            if (!initializingModel) {
                                scope.onAdded({ args: msModelArgs });
                            }
                            defer.reject(multiSelectI18NService.silinenItemGeriAlindi);
                        } else {
                            defer.reject(multiSelectI18NService.zatenekli);
                        }
                    } else {
                        defer.reject(multiSelectI18NService.zatenekli);
                    }
                }
                return defer.promise;
            }
            //#endregion

            //#region Removing Methods
            /**
            * Remove selected item
            * @param item Item to be removed
            */
            const removeItem = (item: IMultiSelectModel, isBatchProcess?: boolean): ng.IPromise<any> => {
                if (!common.isAssigned(item)) return common.rejectedPromise('item must be assigned');

                const msModelArgs: IMultiSelectedEventArgs = { isBatchProcess: isBatchProcess };
                msModelArgs.$model = item.$model;
                msModelArgs.$selectItem = item.$selectItem;

                const removeResult = scope.onRemove({ args: msModelArgs });
                const removeResultPromise = common.makePromise(removeResult);

                return removeResultPromise.then(() => {
                    const index = addedItems.indexOf(item);
                    if (index === -1)
                        return common.rejectedPromise('no item found at index ' + index);
                    if (!isFilterMode) {
                        (item.$model as IObserableModel<IBaseCrudModel>).remove();
                    } else {
                        (modelCtrl.$modelValue as Array<number>).delete(item.$model as number);
                        addedItems.delete(item);
                    }
                    modelCtrl.$setDirty();
                    scope.onRemoved({ args: item });
                });
            }
            /**
             * Remove all items
             */
            const removeAll = (): ng.IPromise<any> => {
                const itemPromises: ng.IPromise<any>[] = [];
                addedItems.forEach((item): void => {
                    itemPromises.push(removeItem(item));
                });
                return $q.all(itemPromises);
            };
            //#endregion

            //#region Init scope
            /**
             * Auto suggest
             */
            scope.autoSuggest = autoSuggest;

            //#region Tooltips
            scope.ttTumunuekle = multiSelectI18NService.tumunuekle;
            scope.ttTumunusil = multiSelectI18NService.tumunusil;
            scope.ttSil = multiSelectI18NService.sil;
            scope.ttKayitbulunamadi = multiSelectI18NService.kayitbulunamadi;
            scope.ttIslemler = multiSelectI18NService.islemler;
            //#endregion
            /**
             * Remove item
             * @param item MultiSelectListItem
             * @param event Angular event
             */
            scope.removeItem = (item: IMultiSelectModel, event: ng.IAngularEvent) => {
                common.preventClick(event);
                return removeItem(item).then(() => {
                }, (message: string): void => {
                    logger.toastr.error({ message: message });
                });
            };
            /**
             * Add all items 
             * @param event Angular event
             */
            scope.addAll = (event: ng.IAngularEvent): void => {
                common.preventClick(event);
                dialogs.showConfirm({ message: multiSelectI18NService.onaytumkayitekle }).then(() => {
                    addAll().finally(() => {
                        logger.toastr.info({ message: multiSelectI18NService.tumkayitlareklendi });
                    });
                });
            };
            /**
             * Remove all items
             * @param event Angular event
             */
            scope.removeAll = (event: ng.IAngularEvent): void => {
                common.preventClick(event);
                dialogs.showConfirm({ message: multiSelectI18NService.onaytumkayitsil }).then(() => {
                    removeAll()
                        .finally(() => {
                            logger.toastr.info({ message: multiSelectI18NService.tumkayitlarsilindi });
                        });
                });
            };
            /**
             * rtSelect selected index changed event
             * @param args Selected index changed event args             
             */
            scope.onSelectionChanged = (args: ISelectedEventArgs): void => {
                if (!common.isAssigned(args.model)) return;
                addItem(args.model)
                    .then((model: IBaseCrudModel | number) => {
                        if (!isFilterMode) {
                            (modelCtrl.$modelValue as IBaseListModel<IBaseCrudModel>).add(model as IBaseCrudModel);
                        } else
                                (modelCtrl.$modelValue as Array<number>).unshift(model as number);
                    },
                    (message: string) => {
                        message && logger.toastr.warn({ message: message });
                    })
                    .finally(() => {
                        refresh();
                        scope.selectedModel = null;
                    });
            }
            /**
             * Show selection radio
             */
            scope.showSelection = angular.isDefined(attrs.selectionProp);
            /**
             * Selection raido button click event
             * @param selItem Selected item
             * @param groupItems Grouped items if grouping enabled
             */
            scope.setSelected = (selItem: IMultiSelectModel, groupItems?: IMultiSelectModel[]) => {
                //uncheck all items
                const items = groupItems || addedItems;

                for (let item of items) {
                    if (item.$model[attrs.selectionProp] === true) {
                        item.$model[attrs.selectionProp] = false;
                    }
                }

                //set selection
                selItem.$model[attrs.selectionProp] = true;
            }
            /**
             * Event triggered since Select items gets populated
             * @description Defer object resolved here to wait for ngModel changes
             * @param items Select items
             */
            scope.onItemsPopulated = (items: Array<ISelectModel>): void => {
                if (autoSuggest)
                    asyncModelRequestResult = $q.defer();
                asyncModelRequestResult.resolve(items);
            }
            /**
             * Watch required attribute
             */
            scope.$watch("ngRequired", (newValue, oldValue) => {
                if (newValue !== oldValue)
                    refresh();
            });
            //#endregion
        }
    }
    //#region Directive definition
    const directive = <ng.IDirective>{
        restrict: 'AE',
        require: 'ngModel',
        replace: true,
        scope: {
            //rtSelect options
            items: '=?',
            onFetch: '&?',
            onRefresh: '&?',
            onRetrived: '&?',
            onChange: '&?',
            onGet: '&?',
            params: '=?',
            newItemOptions: '=?',
            searchItemsOptions: '=?',
            ngDisabled: '=?',
            ngRequired: '=?',
            hideButtons: '=',
            //rtMultiSelect options
            onRemoved: '&',
            onRemove: '&',
            onAdded: '&',
            onAdd: '&'
        },
        templateUrl: (elem: ng.IAugmentedJQuery, attr: IMultiSelectAttributes) => (common.isDefined(attr.groupbyProp) ?
            'rota/rtmultiselect.group.tpl.html' : 'rota/rtmultiselect.tpl.html'),
        compile: compile
    };
    return directive;
    //#endregion
}
//#region Injections
multiSelectDirective.$inject = ['$timeout', '$parse', '$injector', '$q', 'Common', 'Logger',
    'Dialogs', 'rtMultiSelectI18N', 'Constants'];
//#endregion
//#endregion

//#region MultiSelect Localization Service
const multiSelectI18NService = [
    'Localization', (localization: ILocalization): IMultiSelectI18NService => {
        return {
            kayitsayisi: localization.getLocal("rota.kayitsayisi"),
            kayitbulunamadi: localization.getLocal("rota.kayitbulunamadi"),
            tumunuekle: localization.getLocal("rota.tumunuekle"),
            tumunusil: localization.getLocal("rota.tumunusil"),
            sil: localization.getLocal("rota.sil"),
            kayitsilindi: localization.getLocal('rota.kayitsilindi'),
            kayiteklendi: localization.getLocal('rota.kayiteklendi'),
            zatenekli: localization.getLocal('rota.zatenekli'),
            onaytumkayitekle: localization.getLocal('rota.onaytumkayitekle'),
            onaytumkayitsil: localization.getLocal('rota.onaytumkayitsil'),
            tumkayitlarsilindi: localization.getLocal('rota.tumkayitlarsilindi'),
            tumkayitlareklendi: localization.getLocal('rota.tumkayitlareklendi'),
            islemler: localization.getLocal('rota.islemler'),
            silinenItemGeriAlindi: localization.getLocal('rota.silinenitemgerialindi')
        };
    }
];

//#endregion

//#region Register
const module: ng.IModule = angular.module('rota.directives.rtmultiselect', ['rota.directives.rtselect']);
module.factory('rtMultiSelectI18N', multiSelectI18NService)
    .directive('rtMultiSelect', multiSelectDirective)
    .run([
        '$templateCache', ($templateCache: ng.ITemplateCacheService) => {
            $templateCache.put('rota/rtmultiselect.tpl.html',
                '<div ng-model-options="{allowInvalid: true}" ng-class="{\'list-open\':visibleItems && visibleItems.length}" class="rt-multiselect">' +
                '<div class="header" ng-class="{\'input-group\':!hideButtons}"><rt-select ng-disabled=ngDisabled ng-model="selectedModel" ' +
                'on-retrived="onItemsPopulated(items)" on-change="onSelectionChanged(args)"></rt-select>' +
                '<div uib-dropdown class="input-group-addon" ng-hide=hideButtons><a href uib-dropdown-toggle><i class="fa fa-th"></i></a>' +
                '<ul class="dropdown-menu text-left" uib-dropdown-menu>' +
                '<li><a ng-hide=ngDisabled href ng-if="!autoSuggest" ng-click="addAll($event)">{{::ttTumunuekle}}</a></li>' +
                '<li><a ng-hide=ngDisabled href ng-click="removeAll($event)">{{::ttTumunusil}}</a></li>' +
                '</ul></div></div>' +
                '<div ng-show="visibleItems && visibleItems.length" class="body"><table class="items">' +
                '<tr class="item rota-animate-rt-multiselect" ng-repeat="item in visibleItems"><td class="selection" ng-if="showSelection">' +
                '<input type="radio" ng-value="true" ng-click="setSelected(item)"/></td><td class="value"></td>' +
                '<td align="right" class="text-align-center" style="width:10px">' +
                '<a class="command" ng-hide=ngDisabled href ng-click="removeItem(item,$event)" uib-tooltip="{{::ttSil}}" tooltip-placement="right">' +
                '<i class="fa fa-minus-circle text-danger"></i></a></td></tr></table></div></div>');
            $templateCache.put('rota/rtmultiselect.group.tpl.html',
                '<div ng-model-options="{allowInvalid: true}" ng-class="{\'list-open\':visibleItems && visibleItems.length}" class="rt-multiselect">' +
                '<div class="header" ng-class="{\'input-group\':!hideButtons}"><rt-select ng-disabled=ngDisabled ng-model="selectedModel" ' +
                'on-retrived="onItemsPopulated(items)" on-change="onSelectionChanged(args)"></rt-select>' +
                '<div uib-dropdown class="input-group-addon" ng-hide=hideButtons><a href uib-dropdown-toggle><i class="fa fa-th"></i></a>' +
                '<ul class="dropdown-menu text-left" uib-dropdown-menu>' +
                '<li><a ng-hide=ngDisabled href ng-if="!autoSuggest" ng-click="addAll($event)">{{::ttTumunuekle}}</a></li>' +
                '<li><a ng-hide=ngDisabled href ng-click="removeAll($event)">{{::ttTumunusil}}</a></li>' +
                '</ul></div></div><div class="body" ng-show="visibleItems && visibleItems.length"><table class="items">' +
                '<tr class="group-item" ng-repeat-start="(group,items) in groupItems"><td colspan="4">' +
                '<span class="badge alert-info">{{group}}</span></td></tr>' +
                '<tr ng-repeat-end class="item child-item rota-animate-rt-multiselect" ng-repeat="item in items">' +
                '<td class="child-indent"></td><td class="selection" ng-if="showSelection">' +
                '<input type="radio" ng-value="true" ng-click="setSelected(item,items)"/></td><td class="value"></td>' +
                '<td align="right" class="text-align-center" style="width:10px">' +
                '<a class="command" href ng-click="removeItem(item,$event)" uib-tooltip="{{::ttSil}}" tooltip-placement="right">' +
                '<i class="fa fa-minus-circle text-danger"></i></a></td></tr></table></div></div>');
        }
    ]);
//#endregion

export { }