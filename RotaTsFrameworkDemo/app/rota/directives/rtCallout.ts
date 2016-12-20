//#region Imports
import * as moment from "moment";
//#endregion

//#region Interfaces
interface ICalloutAttributes extends ng.IAttributes {
    ngModel: string;
    rtValidator?: string;
    ngMinlength?: string;
    ngMaxlength?: string;
    minDate?: string;
    maxDate?: string;
    minValue?: number;
    maxValue?: number;
}
//#endregion

//#region Directive
function calloutDirective($position: any, $timeout: ng.ITimeoutService, $filter: ng.IFilterService,
    common: ICommon, constants: IConstants, localization: ILocalization, config: IMainConfig) {

    //#region Localization
    const zorunlualan = localization.getLocal('rota.zorunlualan');
    const maxuzunluk = localization.getLocal('rota.maxuzunluk');
    const minuzunluk = localization.getLocal('rota.minuzunluk');
    const hatalimail = localization.getLocal('rota.hatalimail');
    const hataliurl = localization.getLocal('rota.hataliurl');
    const hatalisayi = localization.getLocal('rota.hatalisayi');
    const hatalipattern = localization.getLocal('rota.hatalipattern');
    const hatalitariharaligimin = localization.getLocal('rota.hatalitariharaligimin');
    const hatalitariharaligimax = localization.getLocal('rota.hatalitariharaligimax');
    const hatalidegermin = localization.getLocal('rota.hatalidegermin');
    const hatalidegermax = localization.getLocal('rota.hatalidegermax');
    //#endregion

    const arrowSize = 6;

    function link(scope: ng.IScope,
        element: ng.IAugmentedJQuery,
        attrs: ICalloutAttributes,
        ngModelCnt: ng.INgModelController): void {

        const $elem = $(element), $calloutElem = $('<div class="rt-callout"></div>');
        $elem.after($calloutElem);

        const updateCallout = (msg?: string) => {
            $timeout(() => {
                $calloutElem.html(msg);
                var ttPosition = $position.positionElements(element, $calloutElem, 'top-left');
                $calloutElem.css({
                    visibility: msg.length && ngModelCnt.$dirty ? 'visible' : 'hidden',
                    top: (ttPosition.top - arrowSize) + 'px', left: ttPosition.left + 'px'
                });
            }, 0);
        }

        scope.$watch(() => ngModelCnt.$error, (value) => {
            const hasError = common.isNotEmptyObject(value),
                errorMessages = [];
            if (hasError) {
                for (let key in value) {
                    if (value.hasOwnProperty(key)) {
                        switch (key) {
                            case "required":
                                errorMessages.unshift(zorunlualan);
                                break;
                            case "minlength":
                                errorMessages.unshift(minuzunluk.replace('{0}', attrs.ngMinlength));
                                break;
                            case "maxlength":
                                errorMessages.unshift(maxuzunluk.replace('{0}', attrs.ngMaxlength));
                                break;
                            case "email":
                                errorMessages.unshift(hatalimail);
                                break;
                            case "url":
                                errorMessages.unshift(hataliurl);
                                break;
                            case "number":
                                errorMessages.unshift(hatalisayi);
                                break;
                            case "pattern":
                                errorMessages.unshift(hatalipattern);
                                break;
                            case "daterange":
                                if (attrs.minDate)
                                    errorMessages.unshift(hatalitariharaligimin
                                        .replace('{0}',
                                        moment(scope.$eval(attrs.minDate)).format(config.datetimeFormat
                                            .timeFormat)));
                                if (attrs.maxDate)
                                    errorMessages.unshift(hatalitariharaligimax
                                        .replace('{0}',
                                        moment(scope.$eval(attrs.maxDate)).format(config.datetimeFormat
                                            .timeFormat)));
                                break;
                            case "min":
                                //ngCurrency
                                errorMessages.unshift(hatalidegermin.replace('{0}',
                                    $filter('currency')(attrs.minValue || constants.MIN_NUMBER_VALUE, '', 0)));
                                break;
                            case "max":
                                //ngCurrency
                                errorMessages.unshift(hatalidegermax.replace('{0}',
                                    $filter('currency')(attrs.maxValue || constants.MAX_NUMBER_VALUE, '', 0)));
                                break;
                            case attrs.rtValidator:
                                errorMessages.unshift(scope[attrs.rtValidator]);
                                break;
                        }
                    }
                }
            }
            updateCallout(errorMessages.join('</br>'));
        }, true);
    }

    const directive = <ng.IDirective>{
        restrict: 'A',
        require: 'ngModel',
        link: link
    };
    return directive;
}
calloutDirective.$inject = ['$uibPosition', '$timeout', '$filter', 'Common', 'Constants', 'Localization', 'Config'];
//#endregion

//#region Register
angular.module('rota.directives.rtcallout', [])
    .directive('rtCallout', calloutDirective);
//#endregion

export { calloutDirective }