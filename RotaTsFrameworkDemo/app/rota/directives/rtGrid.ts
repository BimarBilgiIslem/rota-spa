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
interface IGridDirectiveAttrs extends ng.IAttributes {
    /**
     * Grid option name
     * @description its defined as defaultvalue in config for list controllers  
     */
    gridOptions?: string;
    /**
     * ui-grid features defined in directives
     * @example ui-grid-selection ui-grid-pinning ui-grid-pagination ui-grid-exporter
     */
    gridFeatureList?: string;
    /**
     * List height
     */
    height: number;
}
//#endregion

//#region Ui-Grid wrapper
function gridDirective(config: IMainConfig, common: ICommon) {
    function compile(cElement: ng.IAugmentedJQuery, cAttrs: IGridDirectiveAttrs) {
        const optionsName = common.isNullOrEmpty(cAttrs.gridOptions) ? config.gridDefaultOptionsName : cAttrs.gridOptions;
        const htmlMarkup = `<div id="grid_${optionsName}" class="grid" ui-grid="${optionsName}" ${cAttrs.gridFeatureList || config.gridStandartFeatureList}></div>`;
        cElement.append(htmlMarkup);
        return (): void => {
        }
    }
    //#region Directive Definition
    const directive = <ng.IDirective>{
        restrict: 'E',
        replace: true,
        compile: compile
    };
    return directive;
    //#endregion
}

//#region Injections
gridDirective.$inject = ['Config', 'Common'];
//#endregion
//#endregion

//#region RightClick Selection
/**
 * This directive is to activate (select) the row on which context menu is clicked
 */
function gridRightClickSelectionDirective() {
    function link(scope: ng.IScope, element: ng.IAugmentedJQuery) {
        element.bind('contextmenu', event => {
            scope.$apply(() => {
                const selectedRow = (scope.$parent.$parent as any).row;
                //only single selection active
                if (selectedRow && selectedRow.grid) {
                    selectedRow.grid.api.selection.clearSelectedRows();
                    selectedRow.setSelected(true);
                }
            });
        });
    }
    //#region Directive Definition
    const directive = <ng.IDirective>{
        link: link
    };
    return directive;
    //#endregion
}
//#endregion


//#region Register
angular.module('rota.directives.rtgrid', [])
    .directive('rtGrid', gridDirective)
    .directive('rtGridRightClickSel', gridRightClickSelectionDirective)
    .run(["i18nService", "Localization", (i18nService, localization: ILocalization) => {
        //i18nService service ui-grid localization service - not defined in .d file
        const lang = localization.currentLanguage.code.substr(0, 2);
        i18nService.setCurrentLang(lang);
    }]);
//#endregion

export { gridDirective }