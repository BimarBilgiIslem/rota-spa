import "./config"
import "./constants"
import "../base/index"
import "../services/index"
import "../directives/index"
import "../filters/index"
import "../extensions/index"
//shell controllers
import "../shell/shell.controller"
import "../shell/profile.controller"

angular.module('rota', [
    'rota.constants',
    'rota.services',
    'rota.config',
    'rota.directives',
    'rota.filters',
    'rota.shell',
    'rota.shell.profile',
    /*lib & core loaded in vendor.index*/
    'rota.lib',
    'rota.core'
]);
