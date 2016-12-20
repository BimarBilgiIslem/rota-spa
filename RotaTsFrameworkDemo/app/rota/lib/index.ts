﻿//#region Import
import "spinner"
import "bootstrap"
import "grid"
import "hotkeys"
import "scroll"
import "select"
import "ngcurrency"
import "./dateTimeInput"
import "./datetimepicker"
import "ct-ui-router-extras"
import "./underscore.mixed"
import "mfb"
import "imgcrop"
import "jws"
import "rsa"
import "jsonsanseval"
import "crypto"
import "i18n";
import "text";
import "json";
import "optional";
import "xdom";
import "toastr";
import "fileupload"
import "circleprogress"
import "ckeditor"
import "ng-ckeditor"
import "ngcontextmenu"
import "treeview"
//#endregion

//#region Register
angular.module('rota.lib',
    [
        //Grid plugins
        //https://github.com/angular-ui/ui-grid
        'ui.grid', 'ui.grid.selection', 'ui.grid.pinning', 'ui.grid.pagination', 'ui.grid.exporter', 'ui.grid.grouping', 'ui.grid.resizeColumns',
        //Datetime picker
        //https://github.com/dalelotts/angular-bootstrap-datetimepicker
        'ui.dateTimeInput',
        'ui.bootstrap.datetimepicker',
        //Dropdown select-ui
        //https://github.com/angular-ui/ui-select
        'ui.select',
        //Hotkeys keyboard support
        //https://github.com/chieffancypants/angular-hotkeys/
        'cfp.hotkeys',
        //ui-router plugins - sticky states for modal support
        //https://github.com/christopherthielen/ui-router-extras
        //'ct.ui.router.extras.previous',
        'ct.ui.router.extras.sticky',
        'ct.ui.router.extras.dsr',
        //Scroll
        //https://github.com/oblador/angular-scroll
        'duScroll',
        //Currency directive
        //https://github.com/aguirrel/ng-currency
        'ng-currency',
        //https://github.com/nobitagit/ng-material-floating-button
        'ng-mfb',
        //Image cropping
        //https://github.com/alexk111/ngImgCrop
        'ngImgCrop',
        //Svg circluar progressbar
        //https://github.com/crisbeto/angular-svg-round-progressbar
        'angular-svg-round-progressbar',
        //RichEditor ckEditor for angular
        //https://github.com/miamarti/ng.ckeditor
        'ng.ckeditor',
        //Context Menu
        //https://github.com/Wildhoney/ngContextMenu
        'ngContextMenu',
        //https://github.com/iVantage/angular-ivh-treeview
        //Treeview 
        'ivh.treeview'
    ]);
//#endregion