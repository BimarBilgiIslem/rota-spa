import 'jquery';
import 'angular';
import 'angular-ui-router';
import 'angular-animate';
import 'angular-sanitize';
import 'angular-bootstrap';
import 'angular-local';
import 'angular-cookies';
//this module set user-agent information to window obj before fr is loaded
import "./user-agent-info"

angular.module('rota.core',
    [
        'ngAnimate',
        'ngSanitize',
        'ngCookies'
    ]);