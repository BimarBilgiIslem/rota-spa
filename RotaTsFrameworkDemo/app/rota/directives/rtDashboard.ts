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
        '<div class="panel-body" rt-async-content="options">' +
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
asyncContentDirective.$inject = ['$compile', '$http', '$q', '$controller', '$templateCache', 'Loader', 'RouteConfig', 'Config', 'Constants'];
function asyncContentDirective($compile: ng.ICompileService, $http: ng.IHttpService,
    $q: ng.IQService, $controller: ng.IControllerService, $templateCache: ng.ITemplateCacheService,
    loader: ILoader, routeconfig: IRouteConfig, config: IMainConfig, constants: IConstants) {

    const compileWidget = (options: IWidgetOptions, element: ng.IAugmentedJQuery,
        scope: ng.IScope, prevScope?: ng.IScope): IP<ng.IScope> => {
        //set loading template
        element.html(config.dashboardOptions.widgetLoadingTemplate);
        //load controller & template
        return loader.resolve([options.controllerUrl, options.templateUrl]).then(response => {
            //create controller
            const templateScope = scope.$new();
            const templateCtrl = $controller<IBaseModelController<IBaseCrudModel>>(options.controller,
                { $scope: templateScope, stateInfo: { isNestedState: true }, widget: options });
            templateScope[routeconfig.contentControllerAlias] = templateCtrl;
            //controller getModel promise
            const widgetDataPromise = templateCtrl.modelPromise || $q.when();
            //wait for model being loaded
            widgetDataPromise.finally(() => {
                //append template
                element.html(response[1]);
                //set template
                element.children().data('$ngControllerController', templateCtrl);
                $compile(element.contents())(templateScope);
            });
            //remove prev scope
            if (prevScope) {
                prevScope.$destroy();
            }

            return templateScope;
        }, (err: RequireError) => {
            element.html(`<div class="alert alert-danger"><b>Widget failed</b><br>${err.message}</div>`);
        });
    }

    function link(scope: IWidgetScope, element: ng.IAugmentedJQuery, attrs: IAsyncContentAttributes): void {
        //parse options
        const options: IWidgetOptions = scope.$eval(attrs.rtAsyncContent);
        let currentScope: ng.IScope;
        //compile widget
        compileWidget(options, element, scope).then(scope => {
            currentScope = scope;
        });
    }

    const directive = <ng.IDirective>{
        restrict: 'EA',
        require: '^rtWidget',
        link: link
    };
    return directive;
}

//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.directives.rtdashboard', []);
module.directive('rtDashboard', dashboardDirective)
    .directive('rtWidget', widgetDirective)
    .directive('rtAsyncContent', asyncContentDirective);
//#endregion

export { }