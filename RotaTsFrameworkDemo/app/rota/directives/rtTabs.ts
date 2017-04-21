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

//#region Ui-Tabs wrapper
//#region Tabs Controller
class TabsController {
    /**
     * Show nested ui-view 
     */
    isShowRelativeView: boolean;
    /**
     * Tabs
     */
    tabs: ITab[];
    /**
     * Active tab index
     */
    activeIndex: number = 0;
    /**
     * Tab selected event
     * @param tab Selected Tab
     */
    onSelected: (tab: ITab) => void;

    constructor($rootScope: ng.IRootScopeService,
        private $state: ng.ui.IStateService,
        private $scope: ng.IScope,
        private common: ICommon,
        private routing: IRouting,
        private logger: ILogger,
        private constants: IConstants) {
        if (!common.isArray(this.tabs)) {
            throw new Error(constants.errors.MISSING_TABS);
        }

        const offBinds: Function[] = [];
        ['$stateChangeSuccess', '$stateChangeError', '$stateChangeCancel', '$stateNotFound'].forEach((event: string): void => {
            offBinds.push($rootScope.$on(event, this.refresh.bind(this)));
        });
        $scope.$on('$destroy', (): void => {
            offBinds.forEach((offFn): void => {
                offFn();
            });
        });

        this.refresh();
    }
    /**
     * Check if tab is active state
     * @param tab
     */
    isActive(tab: ITab): boolean {
        return this.$state.includes(tab.activeState || tab.state, tab.params);
    }
    /**
     * Got to tab state
     * @param tab Selected Tab
     */
    go(tab: ITab): void {
        const isCurrentState = this.$state.is(tab.state, tab.params);

        if (!isCurrentState && !tab.disable) {
            this.routing.go(tab.state, tab.params);
            this.onSelected(tab);
        }
    }
    /**
     * Refresh all tabs
     */
    refresh(): void {
        let i = 0;
        this.tabs.forEach((tab: ITab): void => {
            const state = this.routing.getState(tab.state);
            if (!this.common.isAssigned(state)) {
                this.logger.console.warn({ message: state + ' not found' });
                return;
            }
            tab.index = i++;
            tab.badgeType = tab.badgeType || 'alert-info';
            tab.params = tab.params || {};
            tab.disable = tab.disable;
            if (this.isActive(tab) && !tab.disable) {
                this.activeIndex = tab.index;
            }
            tab.heading = tab.heading || state.hierarchicalMenu.title;
            tab.icon = tab.icon || state.hierarchicalMenu.menuIcon;
            if (state.sticky) {
                tab.tabViewName = tab.tabViewName || state.name;
            } else {
                tab.tabViewName = 'nosticky';
                this.isShowRelativeView = true;
            }
        });
    }
}

//#endregion

//#region Injections
TabsController.$inject = ['$rootScope', '$state', '$scope', 'Common', 'Routing', 'Logger', 'Constants'];
//#endregion

//#region Directive Definition
function tabsDirective() {
    const directive = <ng.IDirective>{
        restrict: 'E',
        replace: true,
        controller: TabsController,
        controllerAs: 'tabvm',
        bindToController: {
            tabs: '=',
            type: '@',
            justified: '@',
            vertical: '@',
            onSelected: '&'
        },
        scope: true,
        template: '<div class="rt-tabs"><uib-tabset active="tabvm.activeIndex" class="tab-container" type="{{tabvm.type}}" vertical="{{tabvm.vertical}}" ' +
        'justified="{{tabvm.justified}}">' + '<uib-tab index="tab.index" class="tab" ng-repeat="tab in tabvm.tabs track by tab.state"' +
        'disable="tab.disable" ng-click="tabvm.go(tab)">' +
        '<uib-tab-heading><i ng-class="[\'fa\', \'fa-\' + tab.icon]"></i> {{::tab.heading}}' +
        '<span ng-show="tab.badge" class="tabbadge badge" ng-class="tab.badgeType">{{tab.badge}}</span> </uib-tab-heading>' +
        '</uib-tab></uib-tabset>' +
        '<div ng-class="[\'body\',tabvm.type]"><div ng-repeat="tab in tabvm.tabs|filter:{tabViewName:\'!nosticky\'}" ng-show="tabvm.$state.includes(\'{{::tab.state}}\')" ' +
        'class="anim-fadein" ui-view="{{::tab.tabViewName}}"></div>' +
        '<div ng-if="tabvm.isShowRelativeView" ui-view></div>' +
        '</div></div>'
    };
    return directive;
}
//#endregion
//#endregion

//#region Register
angular.module('rota.directives.rttabs', [])
    .directive('rtTabs', tabsDirective);
//#endregion

export { tabsDirective }