//#region Imports
import * as _ from "underscore";
import * as _s from "underscore.string";
import * as $ from 'jquery';
import { ObserableModel } from "../base/obserablemodel";
//#endregion

//#region Select Directive
function selectDirective($parse: ng.IParseService, $injector: ng.auto.IInjectorService,
    $q: ng.IQService, $sce: ng.ISCEService, localization: ILocalization, common: ICommon, logger: ILogger, dialogs: IDialogs,
    rtSelectI18N: ISelectI18NService, constants: IConstants) {

    function compile(cElement: ng.IAugmentedJQuery, cAttrs: ISelectAttributes) {
        const isAutoSuggest = angular.isDefined(cAttrs.onRefresh);
        //#region Validations
        if (common.isAssigned(cAttrs.displayTemplate)) {
            if (!common.isAssigned(cAttrs.customFilter) && !isAutoSuggest) {
                throw new Error(constants.errors.MISSING_CUSTOM_FILTER);
            }
        } else if (!common.isAssigned(cAttrs.displayProp)) {
            throw new Error(constants.errors.MISSING_DISPLAY_PROP_OR_TEMPLATE);
        }
        //#endregion

        //#region Dom manupulations
        const $choices = $('ui-select-choices', cElement),
            $match = $('ui-select-match', cElement),
            $row = $("<div/>");

        if (isAutoSuggest) {
            $choices.attr('repeat', 'listItem in listItems' +
                (angular.isDefined(cAttrs.valueProp) ? ' track by listItem.' + cAttrs.valueProp : ' track by $index'))
                .attr('refresh', "refreshFn($select.search)")
                .attr('refresh-delay', constants.select.DEFAULT_REFRESH_DELAY);
        } else {
            $choices.attr('repeat',
                ('listItem in listItems | limitTo:' +
                    (cAttrs.itemsCount || constants.select.DEFAULT_ITEMS_COUNT) +
                    ' | rtSelectFilter:$select.search:\'' +
                    (cAttrs.customFilter || cAttrs.displayProp) +
                    '\'') +
                (angular.isDefined(cAttrs.valueProp) ? ' track by listItem.' + cAttrs.valueProp : ' track by $index'));
            //group by
            if (angular.isDefined(cAttrs.groupbyProp)) {
                $choices.attr('group-by', 'groupbyFn');
            }
        }
        //placeholder
        $match.attr('placeholder', (cAttrs.placeholder || localization.getLocal(cAttrs.phI18n || constants.select.DEFAULT_PLACE_HOLDER_KEY)));
        //row style 
        if (common.isAssigned(cAttrs.onStyle))
            $row.attr('rt-select-style', '{{onStyle({item:listItem})}}');
        //display template
        if (common.isAssigned(cAttrs.displayTemplate)) {
            $row.html(common.updateExpressions(cAttrs.displayTemplate, 'listItem'));
        } else {
            $row.attr('ng-bind-html', `listItem.${cAttrs.displayProp}`);
        }
        //add row to choices
        $choices.append($row);
        //selected template
        if (common.isAssigned(cAttrs.selectedTemplate) || common.isAssigned(cAttrs.displayTemplate)) {
            $match.html(`${common.updateExpressions(cAttrs.selectedTemplate || cAttrs.displayTemplate, '$select.selected')}`);
        } else {
            $match.html(`<span ng-bind-html="$select.selected.${cAttrs.displayProp}"></span>`);
        }
        //#endregion
        return (scope: ISelectScope, element: ng.IAugmentedJQuery, attrs: ISelectAttributes, modelCtrl: ng.INgModelController): void => {
            //#region Init attrs
            /**
           * AutoSuggest flag
           */
            const autoSuggest = angular.isDefined(attrs.onRefresh);
            /**
             * Listing promise obj
             * @description  Wait for the request to finish so that items would be available for ngModel changes to select
             */
            let asyncModelRequestResult: ng.IPromise<Array<ISelectModel>>;
            /**
             * * Min autosuggest keyboard length
             */
            const minAutoSuggestCharLen = attrs.minAutoSuggestCharLen || constants.select.MIN_AUTO_SUGGEST_CHAR_LEN;
            /**
             * Value property name of model 
             */
            let valuePropGetter = attrs.valueProp && $parse(attrs.valueProp);
            /**
             * Check fire onchange event 
             */
            const fireChangeEventProgramatically = angular.isDefined(attrs.fireOnchange);

            //if scope.newItemOptions is null and attrs.newItemOptions is vaild value then newItemOptions 
            //must be evaluted on MultiSelect directive
            if (!common.isAssigned(scope.newItemOptions) && common.isAssigned(attrs.newItemOptions)) {
                scope.newItemOptions = (scope.$parent as IMultiSelectScope).newItemOptions;
            }
            //Same above
            if (!common.isAssigned(scope.searchItemsOptions) && common.isAssigned(attrs.searchItemsOptions)) {
                scope.searchItemsOptions = (scope.$parent as IMultiSelectScope).searchItemsOptions;
            }
            //Unique focus event name
            scope.focusEventName = `rt-select-focus:${common.getRandomNumber()}`;
            //#endregion

            //#region Utility Methods
            /**
             * Trigger select index changed event
             * @param modelValue Selected model value
             * @param model Selected model
             */
            const callSelectedEvent = (modelValue?: number, model?: ISelectModel): void => {
                if (common.isAssigned(scope.onChange)) {
                    scope.onChange({ args: { model: model, scope: scope, modelValue: modelValue } });
                }
            }
            /**
             * Value mapper function
             * @param itemObject Content obj or object itself
             */
            const getValueMapper = (itemObject: ISelectModel): number => (valuePropGetter ? valuePropGetter(itemObject) : itemObject);
            /**
             * Get item by model value wrapped by promise
             * @param key Model Value
             */
            const findItemById = (modelValue: number): ng.IPromise<ISelectModel> => {
                return asyncModelRequestResult.then((items: Array<ISelectModel>) => {
                    let foundItem: ISelectModel;
                    if (common.isArray(items)) {
                        for (let i = 0; i < items.length; i++) {
                            const itemValue = getValueMapper(items[i]);
                            if (itemValue === modelValue) {
                                foundItem = items[i];
                                break;
                            }
                        }
                    }
                    return foundItem || common.rejectedPromise();
                });
            }
            /**
             * Call select directive methods,
             * @param funcName Function name to be called
             * @param args Optional function params
             */
            const callMethod = <T>(dataSource: IItemsDataSourceMethod<T>, params: any): ng.IPromise<T> => {
                const d = $q.defer<T>();
                //call scope method
                const methodResult = dataSource(params);
                //make prom
                common.makePromise<T>(methodResult).then(callMethodResult => {
                    d.resolve(callMethodResult);
                }, (reason) => {
                    d.reject(reason);
                });
                return d.promise;
            };
            //#endregion

            //#region Model Methods
            /**
             * Set model 
             * @param value Moel object
             */
            const setModel = (model?: ISelectModel, fireChangeEvent?: boolean): void => {
                const currentValue = getValueMapper(scope.selected.model);
                const newValue = getValueMapper(model);

                if ((fireChangeEventProgramatically || fireChangeEvent) && currentValue !== newValue) {
                    callSelectedEvent(newValue, model);
                }

                scope.selected.model = model;
            };
            /**
             * Clear model
             */
            const clearModel = (fireChangeEvent?: boolean): void => {
                if (angular.isDefined(scope.allowClear) && !scope.allowClear) return;

                modelCtrl.$setViewValue(undefined);
                setModel(undefined, fireChangeEvent);

                if (autoSuggest) {
                    scope.listItems = [];
                }
            }
            /**
             * Set select data and resolve promise
             * @param items Items
             */
            const setItems = (items: ISelectModel[]): ISelectModel[] => {
                if (!common.isArray(items)) return undefined;

                scope.listItems = items;
                //give out data to 'data' prop
                if (common.isDefined(scope.onRetrived)) {
                    scope.onRetrived({ items: items });
                }
                return items;
            }
            /**
           * Get all items 
           * @param funcName AllItems method name
           */
            const bindAllItems = (): void => {
                asyncModelRequestResult = callMethod<Array<ISelectModel>>(scope.onFetch,
                    { params: scope.params }).then(
                    (data) => {
                        //convert enum obj to array
                        if (data && !common.isArray(data)) {
                            valuePropGetter = $parse(constants.select.OBJ_VALUE_PROP_NAME);
                            data = common.convertEnumToArray(data);
                        }
                        return setItems(data);
                    });
            };
            /**
             * Get Item by key value for autosuggest mode
             * @param key Model value
             */
            const bindItemById = (key: number): ng.IPromise<ISelectModel> => {
                return asyncModelRequestResult = callMethod<ISelectModel>(scope.onGet, { id: key }).then(
                    (data: ISelectModel) => {
                        let dataArray;
                        if (common.isAssigned(data)) {
                            dataArray = [data];
                            //if autosuggest mode active,set all items
                            if (autoSuggest)
                                setItems(dataArray);
                            else
                                //if combobox mode active,just add item to list
                                scope.listItems.unshift(data);
                        }
                        return dataArray;
                    });
            };
            /**
             * Get itesm by keyword
             * @param keyword Keyword
             */
            const bindItemsByKeyword = (keyword: string): ng.IPromise<Array<ISelectModel>> => {
                return asyncModelRequestResult = callMethod<Array<ISelectModel>>(scope.onRefresh,
                    { keyword: keyword }).then(
                    data => setItems(data));
            };
            //#endregion

            //#region Init
            /**
             * Updates tooltip of select
             */
            const initTooltip = (): void => {
                const toolTips = [];
                toolTips.push(rtSelectI18N.escsilaciklama);
                if (autoSuggest)
                    toolTips.push(rtSelectI18N.enazkaraktersayisi.replace('{0}', minAutoSuggestCharLen.toString()));
                if (scope.newItemOptions)
                    toolTips.push(rtSelectI18N.yeniitemicinarti);
                scope.toolTips = $sce.trustAsHtml(toolTips.join('<br/>'));
            }
            /**
             * Assign "refreshFn" function to scope
             * @description This method is called when in autosuggest mode,more than "minAutoSuggestCharLen" chars is typed
             */
            const initAutoSuggest = (): void => {
                if (!common.isDefined(scope.onRefresh)) {
                    throw new Error(constants.errors.MISSING_REFRESH_METHOD);
                }
                scope.refreshFn = (keyword: string): ng.IPromise<Array<ISelectModel>> => {
                    if (keyword && minAutoSuggestCharLen <= keyword.length) {
                        return bindItemsByKeyword(keyword);
                    }
                };
            };
            /**
             * Get all data and bind in normal mode
             * @description itemsMethod will be used if auto-bind is demanded.Watch triggers initally for first load
             */
            const initAllItems = (): void => {
                if (common.isDefined(scope.onFetch)) {
                    bindAllItems();
                }
            };
            /**
             * Initing select data
             */
            const init = (): void => {
                autoSuggest ? initAutoSuggest() : initAllItems();
                //set tooltips
                //tooltip is ignored due to stickness
                //initTooltip();
            }
            //#endregion

            //#region Init events & watchs
            /**
             * Update selected model by modelValue stemming from ngModel watch
             * @param modelValue Model value
             */
            const updateValueFromModel = (modelValue: number): void => {
                if (!common.isAssigned(modelValue)) {
                    return setModel();
                }
                //get item by id
                if (autoSuggest) {
                    bindItemById(modelValue);
                }
                //find item and set model
                findItemById(modelValue).then((item) => {
                    setModel(item);
                }, () => {
                    //force getById if defined
                    if (common.isAssigned(scope.onGet))
                        bindItemById(modelValue).then((model: ISelectModel): void => {
                            setModel(model);
                        });
                    else {
                        logger.console.warn({ message: 'item not found by ' + modelValue });
                    }
                });
            };
            /**
             * Inject formatter pipeline
             */
            modelCtrl.$formatters.push((modelValue: number) => {
                if (!common.isAssigned(asyncModelRequestResult) && !autoSuggest) return modelValue;

                updateValueFromModel(modelValue);
                return modelValue;
            });
            /**
             * Items is real data for select
             */
            scope.$watchCollection('items', (newValue?: ISelectModel[]): void => {
                if (common.isAssigned(newValue)) {
                    asyncModelRequestResult = common.promise(newValue);
                    setItems(newValue);

                    if (common.isAssigned(modelCtrl.$modelValue)) {
                        updateValueFromModel(<number>modelCtrl.$modelValue);
                    }
                }
            });
            //#endregion

            //#region Init scope
            scope.listItems = [];
            scope.selected = { model: null };
            //set groupBy function
            if (common.isAssigned(attrs.groupbyProp)) {
                scope.groupbyFn = item => item[attrs.groupbyProp];
            }
            /**
             * Selected index changed event  
             * @param item Model
             * @param model Model             
             */
            scope.onItemSelect = (item: ISelectModel, model: ISelectModel): void => {
                const modelValue = getValueMapper(item);
                modelCtrl.$setViewValue(modelValue);
                //Clear items after selected in autosuggest mode
                if (autoSuggest) {
                    scope.listItems = [];
                }
                callSelectedEvent(modelValue, model);
            }
            //new item options
            if (scope.newItemOptions) {
                scope.runNewItem = $event => {
                    if (scope.ngDisabled) return;
                    const instanceOptions: IModalInstanceOptions = {};
                    instanceOptions.params = scope.params || {};
                    if (common.isAssigned(scope.newItemOptions.instanceOptions)) {
                        instanceOptions.services = scope.newItemOptions.instanceOptions.services;
                    }
                    scope.newItemOptions.instanceOptions = instanceOptions;
                    scope.newItemOptions.instanceOptions.model = common.newCrudModel();
                    scope.newItemOptions.instanceOptions.model.modelState = ModelStates.Added;

                    dialogs.showModal(scope.newItemOptions).then((response: ICrudServerResponseData) => {
                        if (response) {
                            const entity = response.entity;
                            scope.listItems.unshift(entity);
                            setModel(entity);
                            scope.onItemSelect(entity, entity);
                        }
                    }).finally(() => {
                        scope.$broadcast(scope.focusEventName);
                    });
                    common.preventClick($event);
                };
            }
            //search options
            if (scope.searchItemsOptions) {
                scope.searchItems = $event => {
                    if (scope.ngDisabled) return;
                    scope.newItemOptions.instanceOptions = {
                        model: scope.selected.model,
                        params: scope.params
                    };
                    dialogs.showModal(scope.searchItemsOptions).then((foundItem: ISelectModel) => {
                        if (foundItem) {
                            const value = getValueMapper(foundItem);
                            if (autoSuggest) {
                                scope.listItems.unshift(foundItem);
                                setModel(foundItem);
                            } else {
                                updateValueFromModel(value);
                            }
                        }
                    });
                    common.preventClick($event);
                };
            }
            /**
           * Key press event for managing actions shortcut
           * @param e Angular event
           */
            scope.manageKeys = (e: JQueryEventObject): any => {
                switch (e.keyCode) {
                    case constants.key_codes.ESC:
                        clearModel(true);
                        break;
                    case constants.key_codes.PLUS:
                        if (common.isAssigned(scope.newItemOptions)) {
                            scope.runNewItem();
                            common.preventClick(e);
                            return false;
                        }
                }
            }
            //#endregion

            init();
        }
    }
    //#region Directive definition
    const directive = <ng.IDirective>{
        restrict: 'E',
        require: 'ngModel',
        replace: true,
        scope: {
            items: '=?',
            onFetch: '&?',
            onRefresh: '&?',
            onRetrived: '&?',
            onChange: '&?',
            onGet: '&?',
            onStyle: '&?',
            params: '=?',
            newItemOptions: '=?',
            searchItemsOptions: '=?',
            ngDisabled: '=?',
            modelPromise: '=?',
            itemsCount: '=?',
            allowClear: '=?'
        },
        templateUrl: 'rota/rtselect-options.tpl.html',
        compile: compile
    };
    return directive;
    //#endregion
}
//#region Injections
selectDirective.$inject = ['$parse', '$injector', '$q', '$sce', 'Localization', 'Common', 'Logger',
    'Dialogs', 'rtSelectI18N', 'Constants'];
//#endregion
//#endregion

//#region Select Filter
const selectFilter = ['Common', function (common: ICommon) {
    return function (list: ISelectModel[], keyword: string, displayProp: string) {
        if (!keyword) return list;
        return common.filterArray(list, displayProp, keyword);
    }
}];
//#endregion

//#region Select Style Directive
function selectStyleDirective() {
    const directive = <ng.IDirective>{
        link: function (scope, elem: ng.IAugmentedJQuery, attrs: ISelectColorAttrs) {
            elem.parent().attr('style', attrs.rtSelectStyle);
        }
    };
    return directive;
}
//#endregion

//#region Select Focus Directive (due to animation,also see app.ts)
function selectFocusHack($animate: ng.animate.IAnimateService) {
    const directive = <ng.IDirective>{
        link: function (scope, elem: any) {
            $animate.enabled(elem, false);
        }
    };
    return directive;
}
selectFocusHack.$inject = ["$animate"];
//#endregion

//#region Select Localization Service
const selectI18NService = [
    'Localization', (localization: ILocalization): ISelectI18NService => {
        return {
            escsilaciklama: localization.getLocal("rota.escsilaciklama"),
            enazkaraktersayisi: localization.getLocal("rota.enazkaraktersayisi"),
            yeniitemicinarti: localization.getLocal("rota.yeniitemicinarti")
        };
    }
];

//#endregion

//#region Register
const module: ng.IModule = angular.module('rota.directives.rtselect', []);
module.factory('rtSelectI18N', selectI18NService)
    .directive('rtSelect', selectDirective)
    .directive('rtSelectStyle', selectStyleDirective)
    .directive('rtSelectDisableAnimation', selectFocusHack)
    .filter('rtSelectFilter', selectFilter)
    .run([
        '$templateCache', ($templateCache: ng.ITemplateCacheService) => {
            $templateCache.put('rota/rtselect-options.tpl.html',
                '<div ng-keydown="manageKeys($event)" ng-class="{\'input-group\':newItemOptions || searchItemsOptions}" ' +
                'class="no-padding col-md-12 col-sm-12 col-lg-12 col-xs-12 rt-select"><ui-select focus-on="{{focusEventName}}" ng-disabled=ngDisabled ' +
                'style="width:100%" reset-search-input="true" ng-model="selected.model" ' +
                'on-select="onItemSelect($item, $model)" theme="select2">' +
                '<ui-select-match allow-clear="{{allowClear}}"></ui-select-match>' +
                '<ui-select-choices rt-select-disable-animation></ui-select-choices></ui-select>' +
                '<a href ng-if="newItemOptions" ng-click="runNewItem($event)" class="input-group-addon"><i class="fa fa-plus-circle"></i></a>' +
                '<a href ng-if="searchItemsOptions" ng-click="searchItems($event)" class="input-group-addon"><i class="fa fa-search"></i></a></div>');
        }
    ]);
//#endregion

export { }