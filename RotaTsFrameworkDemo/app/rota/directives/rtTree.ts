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
angular.module('rota.directives.rttree', [])
    .directive('rtTree', treeDirective);
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