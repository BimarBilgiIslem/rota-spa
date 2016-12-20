﻿//#region Directive
function listButtonsDirective() {
    const directive = <ng.IDirective>{
        restrict: 'E',
        replace: true,
        template:
        '<div class="rt-listbutton">' +
        '<rt-button ng-if="vm.listPageOptions.listButtonVisibility.searchButton"  text-i18n="rota.ara" icon="search"' +
        'uib-tooltip="{{::\'rota.ara\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom" ' +
        ' ng-disabled="vm.rtForm.$invalid" color="warning" click="vm.initSearchModel()" shortcut="ctrl+enter"></rt-button>&nbsp;' +
        '<div ng-if="vm.listPageOptions.listButtonVisibility.exportButton" class="btn-group">' +
        '<rt-button  color="info" icon="external-link" click="vm.exportGrid(\'visible\',\'pdfExport\')" text-i18n="rota.disariyaaktar"' +
        'uib-tooltip="{{::\'rota.disariyaaktar\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom"></rt-button>' +
        '<button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown">' +
        '<span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button>' +
        '<ul class="dropdown-menu">' +
        '<li><a href i18n="rota.aktarallcsv" ng-click="vm.exportGrid(\'all\',\'csvExport\')"></a></li>' +
        '<li><a href i18n="rota.aktarekrandakicsv" ng-click="vm.exportGrid(\'visible\',\'csvExport\')"></a></li>' +
        '<li><a href i18n="rota.aktarsecilicsv" ng-disabled="vm.gridSeletedRows.length" ng-click="vm.exportGrid(\'selected\',\'csvExport\')"></a></li>' +
        '<li role="separator" class="divider"></li>' +
        '<li><a href i18n="rota.aktarallpdf" ng-click="vm.exportGrid(\'all\',\'pdfExport\')"></a></li>' +
        '<li><a href i18n="rota.aktarekrandakipdf" ng-click="vm.exportGrid(\'visible\',\'pdfExport\')"></a></li>' +
        '<li><a href i18n="rota.aktarsecilipdf" ng-disabled="vm.gridSeletedRows.length" ng-click="vm.exportGrid(\'selected\',\'pdfExport\')"></a></li>' +
        '</ul></div>' +
        '&nbsp;' +
        '<rt-button ng-if="vm.listPageOptions.listButtonVisibility.clearButton"  text-i18n="rota.temizle" icon="eraser" ' +
        'uib-tooltip="{{::\'rota.temizle\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom" ' +
        'color="info" click="vm.clearAll()"></rt-button>&nbsp;' +
        '<rt-button ng-if="vm.listPageOptions.listButtonVisibility.newButton"  text-i18n="rota.yenikayit" icon="plus" ' +
        'uib-tooltip="{{::\'rota.yenikayit\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom" ' +
        'color="success" click="vm.goToDetailState()" shortcut="ctrl+ins"></rt-button>&nbsp;' +
        '<rt-button  text-i18n="rota.secilikayitlarisil" icon="remove" color="danger" click="vm.initDeleteSelectedModels()" ' +
        'uib-tooltip="{{::\'rota.secilikayitlarisil\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom" ' +
        'shortcut="ctrl+shift+del" ' +
        'ng-if="vm.listPageOptions.listButtonVisibility.deleteSelected && vm.gridSeletedRows.length"></rt-button>' +
        '</div>'
    };
    return directive;
}
//#endregion

//#region Register
angular.module('rota.directives.rtlistbuttons', [])
    .directive('rtListButtons', listButtonsDirective);
//#endregion
export { listButtonsDirective }