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

//#region Imports
import * as $ from "jquery";
//#endregion

//#region Controllers
class DashboardController {
    widgets: IWidgetOptions[] = [];

    constructor(private scope: IDashboardScope, private readonly common: ICommon) {
    }

    addWidget(options: IWidgetOptions): void {
        this.widgets.unshift(options);
    }

    deleteWidget(value: number | IWidgetOptions): void {
    }
}
DashboardController.$inject = ['$scope', 'Common'];
//#endregion

//#region Directives
//Dashboard
function dashboardDirective() {

    const directive = <ng.IDirective>{
        restrict: 'EA',
        transclude: true,
        controllerAs: 'dashboardVm',
        controller: DashboardController,
        template: '<div class="rtDashboard" ng-transclude></div>',
        bindToController: {}
    };
    return directive;
}
//Widget
function widgetDirective(localization: ILocalization) {
    function link(scope: IWidgetScope, element: ng.IAugmentedJQuery,
        attrs: IWidgetAttributes, dashBoardCnt: DashboardController): void {
        dashBoardCnt.addWidget(scope.options);
        scope.caption = scope.options.title ||
            (scope.options.titleI18N && localization.getLocal(scope.options.titleI18N));
    }

    const directive = <ng.IDirective>{
        restrict: 'EA',
        require: '^rtDashboard',
        link: link,
        template: '<div ng-class="options.class">' +
        '<div class="panel panel-default">' +
        '<div class="panel-heading">{{caption}}</div>' +
        '<div class="panel-body" rt-content="options">' +
        '</div>' +
        '</div>' +
        '</div>',
        controller: () => { },
        scope: {
            options: '='
        }
    };
    return directive;
}

widgetDirective.$inject = ["Localization"];

//Async Widget

//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.directives.rtdashboard', []);
module.directive('rtDashboard', dashboardDirective)
    .directive('rtWidget', widgetDirective);
//#endregion

export { }