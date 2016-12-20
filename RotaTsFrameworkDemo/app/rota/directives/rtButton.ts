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
}
//#endregion

//#region Directive
function buttonDirective(hotkeys: ng.hotkeys.HotkeysProvider, localization: ILocalization, common: ICommon) {
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
            size: '@'
        },
        templateUrl: (elem: ng.IAugmentedJQuery, attr: IButtonAttributes) => (angular.isDefined(attr.iconToRight) ?
            'rota/rtbutton-r.tpl.html' : 'rota/rtbutton-l.tpl.html'),
        compile: compile
    };
    return directive;
}
buttonDirective.$inject = ['hotkeys', 'Localization', 'Common'];
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