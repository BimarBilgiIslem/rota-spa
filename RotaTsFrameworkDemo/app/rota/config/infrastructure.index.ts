import "./config"
import "./constants"
import "../base/index"
import "../services/index"
import "../directives/index"
import "../filters/index"
import "../extensions/index"
import "../shell/shell.controller"

angular.module('rota', [
    'rota.constants',
    'rota.services',
    'rota.config',
    'rota.directives',
    'rota.filters',
    'rota.shell',
    /*lib & core loaded in vendor.index*/
    'rota.lib',
    'rota.core'
]);
