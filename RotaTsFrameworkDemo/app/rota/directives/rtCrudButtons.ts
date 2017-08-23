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

//#region Directive
function crudButtonsDirective() {
    const directive = <ng.IDirective>{
        restrict: 'E',
        replace: true,
        template:
        '<div class="rt-crudbutton" ng-if="vm.isNew || !vm.crudPageOptions.readOnly" rt-sticky="{{::vm.crudPageOptions.enableStickyCrudButtons}}">' +
        '<div class="btn-group">' +
        '<div class="btn-group" uib-dropdown>' +
        '<rt-button ng-if="vm.crudPageOptions.crudButtonsVisibility.newButton" text-i18n="rota.yenikayit" icon="plus"  color="info" click="vm.initNewModel()" ng-disabled="vm.isNew" ' +
        'uib-tooltip="{{::\'rota.tt_yenikayit\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom" shortcut="ctrl+ins"></rt-button>' +
        '<button uib-dropdown-toggle ng-if="vm.crudPageOptions.crudButtonsVisibility.copyButton" type="button" class="btn btn-info" ng-disabled="vm.isNew">' +
        '<span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button>' +
        '<ul class="dropdown-menu" uib-dropdown-menu>' +
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
        'uib-tooltip="{{::\'rota.tt_gerial\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="bottom" ng-disabled="!vm.isModelDirty"></rt-button>' +
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