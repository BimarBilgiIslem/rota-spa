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

//Global rota contants
const rotaConstants: IConstants = {
    //Application
    APP_VERSION: '0.0.1',
    APP_TITLE: 'Bimar Rota SPA App',
    DEFAULT_LOGO_IMAGE_NAME: 'logo_place_holder.png',
    PRODUCTION_DEBUG_WARNING: 'Dur ! Bu alan yazılımcılar içindir',
    MIN_NUMBER_VALUE: -9999999999,
    MAX_NUMBER_VALUE: 9999999999,
    //Localization
    localization: {
        ACTIVE_LANG_STORAGE_NAME: 'active.language',
        DEFAULT_LANGUAGE: 'tr-tr',
        DEFAULT_LANGUAGE_DISPLAY_NAME: 'Türkçe',
        ENGLISH_LANGUAGE: 'en-us',
        ENGLISH_LANGUAGE_DISPLAY_NAME: 'English',
        TIME_FORMAT: 'DD-MM-YYYY HH:mm',
        DATE_FORMAT: 'DD-MM-YYYY',
        MONTH_FORMAT: 'YYYY / MM',
        YEAR_FORMAT: 'YYYY',
        MIN_STEP: 5
    },
    //Key codes used
    key_codes: {
        ENTER: 13,
        ESC: 27,
        PLUS: 107,
        DOWN_ARROW: 40,
        UP_ARROW: 38
    },
    //Restful Service
    server: {
        //BaseApi
        DEFAULT_API_PREFIX: 'api',
        ACTION_NAME_DEFAULT_FILE_UPLOAD: 'UploadFile',
        //BaseCrudApi
        ACTION_NAME_LIST: 'getlist',
        ACTION_NAME_PAGED_LIST: 'getpagedlist',
        ACTION_NAME_GET_BY_ID: 'getmodelbyid',
        ACTION_NAME_SAVE: 'savechanges',
        ACTION_NAME_DELETE: 'deletemodelbyid',
        ACTION_NAME_EXPORT_LIST: 'exportmodel',
        //Reporting Service
        ACTION_NAME_SET_REPORT_FILTERS: 'setReportParameters',
        ACTION_NAME_GENERATE_REPORT: 'generateReport',
        ACTION_NAME_GET_REPORT: 'getReport',
        //Request Header
        HEADER_NAME_LANGUAGE: 'Rota-Language',
        HEADER_NAME_ROLE_ID: 'Current-RoleId',
        HEADER_NAME_COMPANY_ID: 'Current-CompanyId',
        //Misc
        AJAX_TIMER_DELAY: 800
    },
    //Angular event names
    events: {
        //Events names
        EVENT_LOGIN_CHANGED: 'rota:userLoginChanged',
        EVENT_AJAX_FINISHED: 'rota:ajaxFinished',
        EVENT_AJAX_STARTED: 'rota:ajaxStarted',
        EVENT_LOGIN_REQIRED: 'rota:loginRequired',
        EVENT_MODEL_LOADED: 'rota:modelLoaded',
        EVENT_STATE_CHANGE_START: '$stateChangeStart',
        EVENT_STATE_CHANGE_SUCCESS: '$stateChangeSuccess',
        EVENT_ON_ERROR: 'rota:error',
        EVENT_COMPANY_CHANGED: 'rota:companychanged'
    },
    //Grid 
    grid: {
        GRID_DEFAULT_PAGE_SIZE: 25,
        GRID_DEFAULT_OPTIONS_NAME: 'vm.gridOptions',
        GRID_FULL_FEATUTE_LIST:
        'ui-grid-selection ui-grid-pinning ui-grid-pagination ui-grid-exporter ui-grid-resize-columns ui-grid-save-state ui-grid-move-columns',
        GRID_STANDART_FEATURE_LIST: 'ui-grid-selection ui-grid-pagination ui-grid-exporter ui-grid-resize-columns ' +
            'ui-grid-save-state ui-grid-move-columns ui-grid-edit ui-grid-row-edit',
        /**
        * This template for used if rowFormatter is defined
        * @description https://github.com/angular-ui/ui-grid/blob/master/src/templates/ui-grid/ui-grid-row.html
        */
        GRID_CUSTOM_ROW_TEMPLATE: '<div {0}><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns ' +
        'track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" class="ui-grid-cell" ' +
        'ng-class="{ \'ui-grid-row-header-cell\':col.isRowHeader}" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ' +
        'ui-grid-cell></div></div>',
        GRID_ROW_FORMATTER_ATTR: "ng-class='grid.options.rowFormatter(row)'",
        GRID_ROW_CLICK_EDIT_ATTR: "ng-click=\"grid.appScope.vm.goToDetailState(row.entity[\'id\'],row.entity,row,$event)\"",
        GRID_ROW_DOUBLE_CLICK_EDIT_ATTR: "ng-dblclick=\"grid.appScope.vm.goToDetailState(row.entity[\'id\'],row.entity,row,$event)\"",
        GRID_CONTEXT_MENU_ATTR: "context-menu='contextmenu.html' rt-grid-right-click-sel",
        GRID_EDIT_BUTTON_HTML:
        '<a class="btn btn-info btn-xs" ng-click="grid.appScope.vm.goToDetailState(row.entity[\'id\'],row.entity,row,$event)"' +
        ' uib-tooltip="{{::\'rota.detay\' | i18n}}" tooltip-append-to-body="true" tooltip-placement="top"><i class="fa fa-edit"></i></a>',
        GRID_DELETE_BUTTON_HTML: '<a class="btn btn-danger btn-xs" ' +
        'ng-click="grid.appScope.vm.initDeleteModel(row.entity[\'id\'],row.entity,$event)" uib-tooltip="{{::\'rota.sil\' | i18n}}"' +
        ' tooltip-append-to-body="true" tooltip-placement="top"><i class="fa fa-trash"></i></a>',
        GRID_MAX_PAGE_SIZE: 999999
    },
    tree: {
        //rtTree
        TREE_TWISTIE_COLLAPSED_TPL: '<span class="fa fa-plus-square text-primary"></span>',
        TREE_TWISTIE_EXPANDED_TPL: '<span class="fa fa-minus-square text-primary"></span>'
    },
    //rtSelect
    select: {
        OBJ_VALUE_PROP_NAME: 'key',
        OBJ_DISPLAY_PROP_NAME: 'value',
        FILTER_STARTS_WITH: 'startsWith',
        FILTER_CONTAINS: 'contains',
        DEFAULT_PLACE_HOLDER_KEY: 'rota.seciniz',
        MIN_AUTO_SUGGEST_CHAR_LEN: 3,
        DEFAULT_ITEMS_COUNT: 100,
        DEFAULT_REFRESH_DELAY: 700
    },
    //Controllers
    controller: {
        //Default form element name
        DEFAULT_FORM_NAME: 'rtForm',
        //New item id param value default name
        DEFAULT_NEW_ITEM_PARAM_VALUE: 'new',
        //New item id param default name
        DEFAULT_NEW_ITEM_PARAM_NAME: 'id',
        DEFAULT_READONLY_PARAM_NAME: 'readonly',
        DEFAULT_MODEL_ORDER_FIELD_NAME: 'order',
        DEFAULT_AUTOSAVE_INTERVAL: 60 * 1000,
        //Default modal cont.name
        DEFAULT_MODAL_CONTROLLER_NAME: 'defaultModalController',
        //Default ajax spinner options
        DEFAULT_SPINNER_OPTIONS: {
            lines: 13 // The number of lines to draw
            , length: 28 // The length of each line
            , width: 14 // The line thickness
            , radius: 42 // The radius of the inner circle
            , scale: 0.25 // Scales overall size of the spinner
            , corners: 1 // Corner roundness (0..1)
            , color: '#31708f' // #rgb or #rrggbb or array of colors
            , opacity: 0.25 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 1 // Rounds per second
            , trail: 60 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , top: '50%' // Top position relative to parent
            , left: '50%' // Left position relative to parent
            , shadow: false // Whether to render a shadow
            , hwaccel: false // Whether to use hardware acceleration
            , position: 'absolute' // Element positioning
        },
        ALLOWED_AVATAR_EXTENSIONS: '.png,.jpg',
        STORAGE_NAME_STORED_FILTER_URL: 'urls_stored_filters',
        GRID_REFRESH_INTERVALS: [1, 3, 5, 10]
    },
    //Shortcuts
    shortcuts: {
        GO_TO_FIRST_ROW_OF_GRID: 'ctrl+shift+right'
    },
    //Errors
    errors: {
        //ListController
        MODEL_EXPECTED_AS_ARRAY: 'list model is not array,please check your paging settings',
        NO_TOTAL_PROP_PROVIDED: 'total property must be returned from the response of paging listing request',
        //rtSelect
        MISSING_CUSTOM_FILTER: 'custom-filter must be defined while display-template is filled',
        MISSING_DISPLAY_PROP_OR_TEMPLATE: 'display-prop or display-template must be defined',
        MISSING_REFRESH_METHOD: 'on-refresh method must be defined in autosuggest mode',
        //rtMultiSelect
        SELECTION_NOT_AVAILABLE: 'selection not available for filter mode',
        MISSING_VALUE_PROP: 'value prop must be defined',
        //Tabs
        MISSING_TABS: 'tabs must be defined as array of ITab',
        MISSING_TEMPLATE_URL: 'templateUrl is missing',
        //Routing
        NOT_ROOT_MENU_FOUND: 'root menus not found',
        //Securty
        NO_AVATAR_URI_PROVIDED: 'no avatarUploadUri is provided',
        //reports
        NO_REPORT_URL_PROVIDED: 'reportcontroller url is not defined',
        NO_REPORT_VIEWER_URL_PROVIDED: 'reportviewer url is not defined',
        //validators
        NO_VALIDATORS_DEFINED: 'validators only available in basecrudcontroller',
        NO_VALIDATOR_DEFINED: 'no validator defined with the name {0}',
        NO_VALIDATION_FUNC_DEFINED: 'no validation function defined',
        //Identity server errors
        IDSRV_GENERIC_ERROR_EN: 'There is something wrong with this app authorization,please refer to help desk !',
        IDSRV_GENERIC_ERROR_TR: 'Uygulama yetkilendirme ayarlarında problem mevcut,Lütfen sistem destek ekibi ile görüşünüz !',
        IDSRV_IAT_IS_IN_FUTURE_ERROR_EN: 'There is a discrepancy in system time of this running device/computer with the server.\n' +
        'It needs to be aligned with server time settings.',
        IDSRV_IAT_IS_IN_FUTURE_ERROR_TR: 'Server saat ayarları ile çalıştığınız makinanın ayarları farklılık gösteriyor.\n' +
        'Server saati ile eşitlenmesi gerekiyor.'
    },
    //Securty Service
    security: {
        //Storage names
        STORAGE_NAME_CURRENT_COMPANY: 'current-company',
        IDLE_TIMEOUT: 1800000,
        COUNT_DOWN_FOR_IDLE_TIMEOUT: 300000
    },
    //Logger service
    logger: {
        TOASTR_POSITION: 'toast-bottom-right',
        //timeouts
        TOASTR_TIMEOUT: 2000,
        TOASTR_WARN_TIMEOUT: 4000,
        TOASTR_ERROR_TIMEOUT: 5000,
        TOASTR_INFO_TIMEOUT: 3000,
        TOASTR_SUCCESS_TIMEOUT: 3000,
        TOASTR_DEBUG_TIMEOUT: 6000,
    },
    routing: {
        //shell options
        SHELL_CONTROLLER_NAME: 'ShellController',
        SHELL_PATH: 'rota/shell/views/',
        SHELL_STATE_NAME: 'shell',
        SHELL_CONTENT_STATE_NAME: 'shell.content',
        QUICKMENU_STORAGE_KEY: 'quick-menus',
        MAX_QUICKMENU_LEN: 4,
        //error pages settings
        TEMPLATES: {
            error404: 'error404.html',
            error500: 'error500.html',
            title: 'title.html',
            shell: 'shell.html',
            header: 'header.html',
            userprofile: 'user-profile.html',
            badges: 'badges.html',
            actions: 'header-action-buttons.html',
            breadcrumb: 'breadcrumb.html',
            content: 'content.html',
            currentcompany: 'current-company.html',
            navmenumobile: 'nav-menu-mobile.html'
        },
        NOT_FOUND_STATE_NAME: 'shell.error404',
        INTERNAL_ERROR_STATE_NAME: 'shell.error500',
        //alias
        CONTROLLER_ALIAS_NAME: 'vm',
        SHELL_CONTROLLER_ALIAS_NAME: 'shellvm'
    },
    dashboard: {
        MIN_WIDGET_REFRESH_INTERVAL: 5000,
        WIDGET_LOADING_TEMPLATE: '\<div class="progress progress-striped active">\n\
                                    <div class="progress-bar" role="progressbar" style="width: 100%">\n\
                                      <span class="sr-only">loading ...</span>\n\
                                    </div>\n\
                                  </div>'
    }
};

export = rotaConstants;