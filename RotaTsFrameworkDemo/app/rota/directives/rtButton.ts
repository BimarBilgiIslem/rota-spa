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
interface IButtonAttributes extends ng.IAttributes {
    iconToRight: boolean;
    shortcut: string;
    ngDisabled: string;
}

interface IButtonScope extends ng.IScope {
    text: string;
    caption: string;
    spin: string;
    icon: string;
    doclick(e?: ng.IAngularEvent): void;
    click(e: ng.IAngularEvent): ng.IPromise<any> | any;
    isBusy: boolean;
    elemToScroll?: string;
}
//#endregion

//#region Directive
function buttonDirective($document: duScroll.IDocumentService, hotkeys: ng.hotkeys.HotkeysProvider, localization: ILocalization, common: ICommon) {
    const pendingText = localization.getLocal('rota.lutfenbekleyiniz');

    function compile(tElement: ng.IAugmentedJQuery, tAttrs: IButtonAttributes) {
        let disabledAttr = 'isBusy';
        if (common.isDefined(tAttrs['ngDisabled'])) {
            disabledAttr += ` || (${tAttrs['ngDisabled']})`;
        }
        tAttrs.$set('ngDisabled', disabledAttr);
        return (scope: IButtonScope, element: ng.IAugmentedJQuery, attrs: IButtonAttributes): void => {
            //get original items
            let orjText = scope.text;
            const orjIcon = scope.icon;
            scope.$watchGroup(['textI18n', 'text'], (data: any[]) => {
                orjText = scope.caption = data[1] || (data[0] && localization.getLocal(data[0]));
            });
            //shortcut
            if (angular.isDefined(attrs.shortcut)) {
                hotkeys.bindTo(scope).add({
                    combo: attrs.shortcut,
                    description: orjText,
                    allowIn: ['INPUT', 'TEXTAREA', 'SELECT'],
                    callback: () => {
                        if (!element.attr('disabled')) {
                            scope.doclick();
                        }
                    }
                });
            }
            scope.isBusy = false;
            //methods
            const setButtonAttrs = (buttonAttrs: { caption: string; icon: string; showSpin?: boolean; disable: boolean }) => {
                scope.caption = buttonAttrs.caption;
                scope.icon = `${buttonAttrs.icon} ${buttonAttrs.showSpin ? 'fa-spin' : ''}`;
                scope.isBusy = buttonAttrs.disable;
            }
            const startAjax = () => {
                setButtonAttrs({ caption: pendingText, icon: 'refresh', showSpin: true, disable: true });
            };
            const endAjax = () => {
                setButtonAttrs({ caption: orjText, icon: orjIcon, disable: false });
                //scroll if elem is defined
                if (scope.elemToScroll) {
                    const elem = document.getElementById(scope.elemToScroll);
                    $document.duScrollToElement(angular.element(elem), 0, 750);
                }
            };
            scope.doclick = e => {
                const result = scope.click(e);
                if (common.isPromise(result)) {
                    startAjax();
                    result.finally(() => {
                        endAjax();
                    });
                }
            };
        }
    }

    const directive = <ng.IDirective>{
        restrict: 'AE',
        replace: true,
        scope: {
            text: '@',
            textI18n: '@',
            icon: '@',
            color: '@',
            click: '&',
            size: '@',
            elemToScroll: '@'
        },
        templateUrl: (elem: ng.IAugmentedJQuery, attr: IButtonAttributes) => (angular.isDefined(attr.iconToRight) ?
            'rota/rtbutton-r.tpl.html' : 'rota/rtbutton-l.tpl.html'),
        compile: compile
    };
    return directive;
}
buttonDirective.$inject = ['$document', 'hotkeys', 'Localization', 'Common'];
//#endregion

//#region Register
angular.module('rota.directives.rtbutton', [])
    .directive('rtButton', buttonDirective)
    .run([
        '$templateCache', ($templateCache: ng.ITemplateCacheService) => {
            $templateCache.put('rota/rtbutton-r.tpl.html',
                '<a href ng-class="[\'btn\', \'btn-\' + color,\'btn-\' +size]" ' +
                'tooltip-placement="bottom">' +
                '<span class="hidden-sm hidden-xs">' +
                '{{caption}}</span>&nbsp;<i ng-if="icon" ng-class="[\'fa\', \'fa-\' + icon]"></i></a>');
            $templateCache.put('rota/rtbutton-l.tpl.html',
                '<button  ng-class="[\'btn\', \'btn-\' + color,\'btn-\' +size]" ng-click="doclick($event)" ' +
                'tooltip-placement="bottom">' +
                '<i ng-if="icon" ng-class="[\'fa\', \'fa-\' + icon]"></i><span class="hidden-sm hidden-xs">' +
                '{{caption}}</span></button>');
        }
    ]);
//#endregion


export { buttonDirective }