//#region Directive
function crudButtonsDirective() {
    const directive = <ng.IDirective>{
        restrict: 'E',
        replace: true,
        template:
        '<div class="rt-crudbutton" ng-if="vm.isNew || !vm.crudPageOptions.readOnly">' +
        '<div class="btn-group">' +
        '<div class="btn-group">' +
        '<rt-button ng-if="vm.crudPageOptions.crudButtonsVisibility.newButton" text-i18n="rota.yeni" icon="plus"  color="info" click="vm.initNewModel()" ng-disabled="vm.isNew" ' +
        'uib-tooltip="{{::\'rota.yenikayit\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom" shortcut="ctrl+ins"></rt-button>' +
        '<button ng-if="vm.crudPageOptions.crudButtonsVisibility.copyButton" type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" ng-disabled="vm.isNew">' +
        '<span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button>' +
        '<ul class="dropdown-menu">' +
        '<li><a href i18n="rota.yenikopyala" ng-click="vm.initNewModel(true)"></a></li>' +
        '</ul></div></div>&nbsp;' +
        '<div class="btn-group">' +
        '<rt-button ng-if="vm.crudPageOptions.crudButtonsVisibility.saveButton" text-i18n="rota.kaydet"  icon="floppy-o" color="success" click="vm.initSaveModel()" shortcut="ctrl+enter" ' +
        'uib-tooltip="{{::\'rota.tt_kaydet\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom" ng-disabled="vm.isFormInvalid || vm.isFormPending || !vm.isModelDirty"></rt-button>' +
        '<rt-button ng-if="vm.crudPageOptions.crudButtonsVisibility.saveContinueButton" text-i18n="rota.kaydetdevam"  icon="play" color="success" click="vm.initSaveAndContinue()" shortcut="ctrl+shift+ins" ' +
        'uib-tooltip="{{::\'rota.tt_kaydetdevam\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom" ng-disabled="vm.isFormInvalid || vm.isFormPending || !vm.isModelDirty"></rt-button>&nbsp;' +
        '</div>' +
        '<div class="btn-group">' +
        '<rt-button ng-if="vm.crudPageOptions.crudButtonsVisibility.revertBackButton" text-i18n="rota.gerial"  icon="refresh" color="warning" click="vm.revertBack()" shortcut="shift+del" ' +
        'uib-tooltip="{{::\'rota.tt_gerial\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom" ng-disabled="vm.isNew || !vm.isModelDirty"></rt-button>' +
        '<rt-button ng-if="vm.crudPageOptions.crudButtonsVisibility.deleteButton" text-i18n="rota.sil"  icon="remove" color="danger" click="vm.initDeleteModel()" shortcut="ctrl+del" ' +
        'uib-tooltip="{{::\'rota.tt_sil\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom" ng-disabled="vm.isNew"></rt-button>' +
        '</div>' +
        '</div>'
    };
    return directive;
}
//#endregion

//#region Register
angular.module('rota.directives.rtcrudbuttons', [])
    .directive('rtCrudButtons', crudButtonsDirective);
//#endregion

export { crudButtonsDirective }