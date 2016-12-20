﻿//#region Interfaces
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

        let featureList;
        switch (cAttrs.gridFeatureList) {
            case "standart":
            case null:
            case undefined:
                featureList = config.gridStandartFeatureList;
                break;
            case "full":
                featureList = config.gridFullFeatureList;
                break;
            default:
                featureList = cAttrs.gridFeatureList;
        }
        const htmlMarkup = `<div class="grid" ui-grid="${optionsName}" ${featureList}></div>`;
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

//#region Register
angular.module('rota.directives.rtgrid', [])
    .directive('rtGrid', gridDirective)
    .run(["i18nService", "Localization", (i18nService, localization: ILocalization) => {
        //i18nService service ui-grid localization service - not defined in .d file
        const lang = localization.currentLanguage.code.substr(0, 2);
        i18nService.setCurrentLang(lang);
    }]);
//#endregion

export { gridDirective }