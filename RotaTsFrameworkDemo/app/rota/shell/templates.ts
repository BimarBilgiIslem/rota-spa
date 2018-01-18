//#region Imports
import badges = require("text!./views/badges.html");
import breadcrumb = require("text!./views/breadcrumb.html");
import content = require("text!./views/content.html");
import currentCompany = require("text!./views/current-company.html");
import error404 = require("text!./views/error404.html");
import error500 = require("text!./views/error500.html");
import feedback = require("text!./views/feedback.html");
import headerActionButtons = require("text!./views/header-action-buttons.html");
import header = require("text!./views/header.html");
import navMenuMobile = require("text!./views/nav-menu-mobile.html");
import shell = require("text!./views/shell.html");
import title = require("text!./views/title.html");
import userProfile = require("text!./views/user-profile.html");
//#endregion

//#region Register
const module: ng.IModule = angular.module('rota.shell.templates', []);
module.run([
    '$templateCache', 'Constants', ($templateCache: ng.ITemplateCacheService, constants: IConstants) => {
        $templateCache.put(constants.routing.TEMPLATES.error404, error404);
        $templateCache.put(constants.routing.TEMPLATES.error500, error500);
        $templateCache.put(constants.routing.TEMPLATES.title, title);
        $templateCache.put(constants.routing.TEMPLATES.shell, shell);
        $templateCache.put(constants.routing.TEMPLATES.header, header);
        $templateCache.put(constants.routing.TEMPLATES.navmenumobile, navMenuMobile);
        $templateCache.put(constants.routing.TEMPLATES.badges, badges);
        $templateCache.put(constants.routing.TEMPLATES.actions, headerActionButtons);
        $templateCache.put(constants.routing.TEMPLATES.breadcrumb, breadcrumb);
        $templateCache.put(constants.routing.TEMPLATES.content, content);
        $templateCache.put(constants.routing.TEMPLATES.currentcompany, currentCompany);
        $templateCache.put(constants.routing.TEMPLATES.feedback, feedback);
        $templateCache.put(constants.routing.TEMPLATES.userprofile, userProfile);
    }]);
//#endregion
export { module };