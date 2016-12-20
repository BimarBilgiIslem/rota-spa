//#region Imports
import * as $ from "jquery";
//#endregion

//#region Interfaces
interface IMenuScope extends ng.IScope {
    subMenuHandler(event: JQueryEventObject): void
}
//#endregion

//#region Directive
menuDirective.$inject = ['$compile', 'hotkeys', 'Routing'];
function menuDirective($compile: ng.ICompileService, hotkeys: ng.hotkeys.HotkeysProvider, routing: IRouting) {
    function link(scope: IMenuScope, element: ng.IAugmentedJQuery): void {
        var createMenu = (menus: IHierarchicalMenuItem[], isSubMenu: boolean = false): string => {
            var menuHtml = '';
            menus.forEach(menu => {
                if (!menu.isMenu) return;

                if (menu.shortCut) {
                    hotkeys.bindTo(scope).add({
                        combo: menu.shortCut,
                        description: menu.title,
                        callback: () => {
                            if (menu.menuUrl) {
                                window.location.href = menu.menuUrl;
                            } else {
                                routing.go(menu.state);
                            }
                        }
                    });
                }

                if (menu.startGroup) {
                    menuHtml += '<li class="nav-divider"></li>';
                }

                const isSubMenuExists = menu.subMenus && _.some(menu.subMenus, (menu: IHierarchicalMenuItem): boolean => {
                    return menu.isMenu;
                });

                const url = isSubMenuExists ? '#' : !menu.menuUrl ? routing.getUrlByState(menu.state) : menu.menuUrl;
                menuHtml += `<li class="${isSubMenuExists ? 'dropdown' : ''}${isSubMenuExists && isSubMenu ? ' dropdown-submenu' : ''}">
                             <a href="${url}" ${isSubMenuExists ? ' class="dropdown-toggle" data-toggle="dropdown" ' : 'class="rota-animate-menu"'}
                             ${isSubMenuExists && isSubMenu ? 'ng-click=\'subMenuHandler($event)\'' : ''}>
                             <i class="fa ${isSubMenu ? 'fa-fw' : ''} fa-${menu.menuIcon}"></i> 
                             ${menu.title}${isSubMenuExists && !isSubMenu ? '<span class="caret"></span>' :
                        (menu.shortCut ? `<span class="label margin-left-10 menu-shortcut label-danger hidden-xs hidden-print hidden-sm">${menu.shortCut}</span>` : '')
                    }</a>`;
                if (isSubMenuExists) {
                    menuHtml += `<ul class="dropdown-menu">${createMenu(menu.subMenus, true)}</ul>`;
                }
            });
            menuHtml += '</li>';
            return menuHtml;
        };
        //this is hack for closing nav immidiately when nav item clicked.
        $(document).on('click', '.navbar-collapse.in', function (e) {
            if ($(e.target).is('a')) {
                $(this)['collapse']('hide');
            }
        });

        scope.$watch(() => routing.menus, menus => {
            if (menus && menus.length) {
                const htmlMarkup = `<ul class="nav navbar-nav">${createMenu(menus)}</ul>`;
                const liveHtml = $compile(htmlMarkup)(scope);
                element.append(liveHtml);
            }
        });

        //For subMenu support
        //http://www.bootply.com/QutOBjvgha
        scope.subMenuHandler = event => {
            // Avoid following the href location when clicking
            event.preventDefault();
            // Avoid having the menu to close when clicking
            event.stopPropagation();
            // If a menu is already open we close it
            var $parentUl = $('li.dropdown-submenu.open', $(event.target).parents('ul.dropdown-menu:first'));
            $parentUl.removeClass('open');
            // opening the one you clicked on
            $(event.target).parent().addClass('open');

            var menu = $(event.target).parent().find("ul");
            var menupos = menu.offset();
            var newpos: number;

            if ((menupos.left + menu.width()) + 30 > $(window).width()) {
                newpos = -menu.width();
            } else {
                newpos = $(event.target).parent().width();
            }
            menu.css({ left: newpos });
        };
    }

    const directive = <ng.IDirective>{
        restrict: 'EA',
        replace: true,
        link: link
    };
    return directive;
}
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.directives.rtmenu', []);
module.directive('rtMenu', menuDirective);
//#endregion

export { menuDirective }