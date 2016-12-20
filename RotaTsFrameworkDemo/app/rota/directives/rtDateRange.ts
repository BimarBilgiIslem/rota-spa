//#region Imports
import { IDateTimeDirectiveAttrs } from "./rtDatePicker";
import * as moment from "moment";
//#endregion

//#region Interfaces
/**
 * Date Range attributes
 */
interface IDateRangeDirectiveAttrs extends IDateTimeDirectiveAttrs {
    /**
     * This attribute is used when custom date would be specified by user
     * @description if set is set,date inputs is shown
     */
    set: string;
    /**
     * Fixed range indicates day interval which will be set radio selection
     * @example fixed-range="7" Last week will be selected,
     * fixed-range="30" Last month will be selected
     */
    fixedRange: number;
}
/**
 * Date Range Scope
 */
interface IDateRangeScope extends ng.IScope {
    /**
     * Starting date
     */
    dateStart: Date;
    /**
     * Finishing date
     */
    dateEnd: Date;
    /**
     * Show fixed range div used internally
     */
    showfixedrange: boolean;
    /**
     * Fixed range value
     */
    fixedrange: number;
    /**
     * Invalid class (ng-invalid) when range is invalid
     */
    rangeIsValidClass: string;
}
//#endregion

//#region DateRange directive
function dateRangeDirective($parse: ng.IParseService, config: IMainConfig, common: ICommon) {
    function compile(cElement: ng.IAugmentedJQuery, cAttrs: IDateRangeDirectiveAttrs) {
        //#region DOM manupulations
        var $sd = $('rt-date-picker.start', cElement),
            $ed = $('rt-date-picker.end', cElement);
        //Show time
        if (angular.isDefined(cAttrs.dateFormat)) {
            $sd.attr('date-format', cAttrs.dateFormat);
            $ed.attr('date-format', cAttrs.dateFormat);
        }
        //#endregion

        return (scope: IDateRangeScope, element: ng.IAugmentedJQuery, attrs: IDateRangeDirectiveAttrs, formCtrl: ng.IFormController): void => {
            //set dates
            const setDates = (startDate: Date, endDate: Date) => {
                scope.dateStart = startDate;
                scope.dateEnd = endDate;
            }
            //set dates or fixed range
            if (common.isDefined(attrs.set)) {
                const strDate = moment().startOf(attrs.set || 'day').toDate();
                const endDate = moment().endOf(attrs.set || 'day').toDate();
                setDates(strDate, endDate);
                scope.showfixedrange = true;
            } else {
                scope.fixedrange = attrs.fixedRange;
            }
            //Watch fixed range
            scope.$watch('fixedrange', (newValue: number) => {
                if (newValue) {
                    const strDate = moment().subtract(newValue - 1, 'days').startOf('day').toDate();
                    const endDate = moment().endOf('day').toDate();
                    setDates(strDate, endDate);
                }
            });
            //#region Range validation method
            scope.$watchGroup(['dateStart', 'dateEnd'], (dates: Date[]) => {
                const sd = dates[0], ed = dates[1];
                const isValid = (sd && ed) ? moment(sd).isBefore(ed) : true;
                formCtrl && formCtrl.$setValidity('range', isValid, null);
                scope.rangeIsValidClass = isValid ? 'ng-valid' : 'ng-invalid';
            });
            //#endregion
        }
    }
    //#region Directive Definition
    const directive = <ng.IDirective>{
        restrict: 'E',
        replace: true,
        compile: compile,
        require: '?^form',
        scope: {
            dateStart: '=',
            dateEnd: '='
        },
        template: '<div class="row range-date-picker" ng-class="rangeIsValidClass">' +
        '<div class="col-sm-12 fixedrange" ng-hide="showfixedrange">' +
        '<input id="fr1" type="radio" ng-model="fixedrange" value="1" /><label for="fr1" i18n=\'rota.bugun\'></label>' +
        '<input id="fr7" type="radio" ng-model="fixedrange" value="7" /><label for="fr7" i18n=\'rota.sonbirhafta\'></label>' +
        '<input id="fr30" type="radio" ng-model="fixedrange" value="30" /><label for="fr30" i18n=\'rota.sonbiray\'></label>' +
        '<input id="fr180" type="radio" ng-model="fixedrange" value="180" /><label for="fr180" i18n=\'rota.sonaltiay\'></label>' +
        '<input id="fr365" type="radio" ng-model="fixedrange" value="365" /><label for="fr365" i18n=\'rota.sonbiryil\'></label>' +
        '<input id="cus" type="radio" ng-model="fixedrange" value="" ng-click="showfixedrange=true" /><label for="cus" i18n=\'rota.ozel\'></label></div>' +
        '<div ng-show="showfixedrange">' +
        '<div class="col-sm-6 ">' +
        '<rt-date-picker ng-model=dateStart class="start"></rt-date-picker>' +
        '</div><div class="col-sm-6 ">' +
        '<rt-date-picker ng-model=dateEnd class="end"></rt-date-picker>' +
        '</div></div></div>'
    };
    return directive;
    //#endregion
}

//#region Injections
dateRangeDirective.$inject = ['$parse', 'Config', 'Common'];
//#endregion
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.directives.rtdaterange', []);
module.directive('rtDateRange', dateRangeDirective);
//#endregion

export { dateRangeDirective }