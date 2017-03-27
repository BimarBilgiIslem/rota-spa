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

//#region Interfaces
interface ITreeAttrs extends ng.IAttributes {
    displayProp?: string;
    valueProp?: string;
    selectionProp?: string;
    childrenProp?: string;
    items: Array<any>;
}

interface ITreeScope {
    items: Array<any>;
    expandAll: () => void;
    collapseAll: () => void;
    selectAll: () => void;
    deSelectAll: () => void;
    options: any;
    treeOptions: any;
}
//#endregion

//#region Tree directive
function treeDirective(ivhTreeviewMgr: any) {
    //#region Directive Definition
    const directive = <ng.IDirective>{
        restrict: 'E',
        scope: {
            items: '=',
            options: '=?'
        },
        link: function (scope: ITreeScope, elem, attrs: ITreeAttrs) {
            scope.expandAll = function () {
                ivhTreeviewMgr.expandRecursive(scope.items);
            }
            scope.collapseAll = function () {
                ivhTreeviewMgr.collapseRecursive(scope.items);
            }
            scope.selectAll = function () {
                ivhTreeviewMgr.selectAll(scope.items, { 'selectedAttribute': attrs.selectionProp });
            }
            scope.deSelectAll = function () {
                ivhTreeviewMgr.deselectAll(scope.items, { 'selectedAttribute': attrs.selectionProp });
            }
        },
        template: (elem, attrs: ITreeAttrs) => {
            return '<div class="rt-tree">' +
                '<div class="action-buttons">' +
                '<a href ng-click="selectAll()"' +
                'uib-tooltip="{{::\'rota.hepsinisec\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom"' +
                '><i class="fa fa-check-square-o"></i></a>' +
                '<a href ng-click="deSelectAll()"' +
                'uib-tooltip="{{::\'rota.secimlerikaldir\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom"' +
                '><i class="fa fa-square-o"></i></a>' +
                '<a href ng-click="expandAll()"' +
                'uib-tooltip="{{::\'rota.hepsiniac\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom"' +
                '><i class="fa fa-minus-square-o"></i></a>' +
                '<a href ng-click="collapseAll()"' +
                'uib-tooltip="{{::\'rota.hepsinikapat\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom"' +
                '><i class="fa fa-plus-square-o"></i></a></div>' +
                '<div ivh-treeview="items" ivh-treeview-options="options"' +
                (attrs.valueProp ? 'ivh-treeview-id-attribute="\'' + attrs.valueProp + '\'" ' : '') +
                'ivh-treeview-label-attribute="\'' + attrs.displayProp + '\'" ' +
                'ivh-treeview-children-attribute="\'' + attrs.childrenProp + '\'" ' +
                (attrs.selectionProp ? 'ivh-treeview-selected-attribute="\'' + attrs.selectionProp + '\'"' : 'ivh-treeview-use-checkboxes="false"') + '></div></div>';
        }
    };
    return directive;
    //#endregion
}
//#endregion

treeDirective.$inject = ['ivhTreeviewMgr'];

//#region Register
angular.module('rota.directives.rttree', ['ivh.treeview'])
    .directive('rtTree', treeDirective)
    .config(['ivhTreeviewOptionsProvider', 'Constants', (ivhTreeviewOptionsProvider: any, constants: IConstants) => {
        //treeview global settings
        ivhTreeviewOptionsProvider.set({
            idAttribute: 'id',
            defaultSelectedState: false,
            validate: true,
            expandToDepth: 1,
            twistieCollapsedTpl: constants.tree.TREE_TWISTIE_COLLAPSED_TPL,
            twistieExpandedTpl: constants.tree.TREE_TWISTIE_EXPANDED_TPL,
            twistieLeafTpl: '&nbsp;&nbsp;'
        });
    }]);

//#endregion

//https://github.com/iVantage/angular-ivh-treeview#options
/**
idAttribute: 'id',
labelAttribute: 'label',
childrenAttribute: 'children',
selectedAttribute: 'selected',
useCheckboxes: true,
expandToDepth: 0,
indeterminateAttribute: '__ivhTreeviewIndeterminate',
expandedAttribute: '__ivhTreeviewExpanded',
defaultSelectedState: true,
validate: true,
twistieExpandedTpl: '(-)',
twistieCollapsedTpl: '(+)',
twistieLeafTpl: 'o',
nodeTpl: '...'
   */

export { treeDirective }