

//#region Interfaces
interface IPanelScope extends ng.IScope {
    title: string;
    titleI18n: string;
    caption: string;
    headingElement: Element;
}

interface IPanelAttributes extends ng.IAttributes {
    title: string;
    titleI18n: string;
}
//#endregion

//#region Directive
function panelDirective(localization: ILocalization) {
    function compile(cElement: ng.IAugmentedJQuery, cAttrs: IPanelAttributes, trancludeFn: ng.ITranscludeFunction) {
        return (scope: IPanelScope, element: ng.IAugmentedJQuery): void => {
            scope.caption = scope.title || (scope.titleI18n && localization.getLocal(scope.titleI18n));
            const $panelBody = $(".panel-body", element);
            trancludeFn(scope.$parent, (clonedElement?: JQuery): any => {
                angular.forEach(clonedElement, (node: Element) => {
                    if (node.tagName && node.tagName.toLowerCase() === "rt-header") {
                        scope.headingElement = node;
                    } else {
                        $panelBody.append(node);
                    }
                });
            });
        }
    }

    const directive = <ng.IDirective>{
        restrict: 'E',
        scope: {
            title: '@',
            titleI18n: '@',
            icon: '@',
            color: '@',
            ngDisabled: '='
        },
        transclude: true,
        controller: (): void => {
        },
        template: '<div class="panel" ng-class="color ? \'panel-\' + color : \'panel-default\'">' +
        '   <div class="panel-heading" rt-heading-transclude>' +
        '       <h3 class="panel-title"><i ng-class="[\'fa\', \'fa-\' + icon]"></i>&nbsp;{{::caption}}</h3>' +
        '   </div>' +
        '   <div class="panel-body"></div>' +
        '</div>',
        compile: compile
    };
    return directive;
}

panelDirective.$inject = ['Localization'];

function headerDirective() {
    const directive = <ng.IDirective>{
        restrict: 'A',
        require: '^rtPanel',
        link: (scope: IPanelScope, element: ng.IAugmentedJQuery): void => {
            scope.$watch('headingElement', (heading: Element): void => {
                if (heading) {
                    element.html('');
                    element.append(heading);
                }
            });
        }
    };
    return directive;
}
//#endregion

//#region Register
angular.module('rota.directives.rtpanel', [])
    .directive('rtPanel', panelDirective)
    .directive('rtHeadingTransclude', headerDirective);
//#endregion

export { panelDirective }