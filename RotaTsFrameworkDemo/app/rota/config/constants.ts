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
        ACTIVE_LANG_STORAGE_NAME: window.__constants.ACTIVE_LANG_STORAGE_NAME,
        DEFAULT_LANGUAGE: window.__constants.DEFAULT_LANGUAGE,
        ENGLISH_LANGUAGE: window.__constants.ENGLISH_LANGUAGE,
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
        //Reporting Service
        ACTION_NAME_SET_REPORT_FILTERS: 'setReportParameters',
        ACTION_NAME_GENERATE_REPORT: 'generateReport',
        ACTION_NAME_GET_REPORT: 'getReport',
        //Request Header
        HEADER_NAME_LANGUAGE: window.__constants.HEADER_NAME_LANGUAGE,
        HEADER_NAME_ROLE_ID: window.__constants.HEADER_NAME_ROLE_ID,
        HEADER_NAME_COMPANY_ID: window.__constants.HEADER_NAME_COMPANY_ID,
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
        EVENT_MENU_CHANGED: 'rota:menuChanged',
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
        GRID_STANDART_FEATURE_LIST: 'ui-grid-pagination ui-grid-exporter',
        /**
        * This template for used if rowFormatter is defined
        * @description https://github.com/angular-ui/ui-grid/blob/master/src/templates/ui-grid/ui-grid-row.html
        */
        GRID_CUSTOM_ROW_TEMPLATE: '<div {0}><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns ' +
        'track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" class="ui-grid-cell" ' +
        'ng-class="{ \'ui-grid-row-header-cell\':col.isRowHeader}" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ui-grid-cell></div></div>',
        GRID_ROW_FORMATTER_ATTR: "ng-class='grid.options.rowFormatter(row)'",
        GRID_CONTEXT_MENU_ATTR: "context-menu='contextmenu.html'",
        GRID_EDIT_BUTTON_HTML:
        '<a class="btn btn-info btn-xs" ng-click="grid.appScope.vm.goToDetailState(row.entity[\'id\'])"' +
        ' uib-tooltip=\'Detay\' tooltip-append-to-body="true" tooltip-placement="top"><i class="fa fa-edit"></i></a>',
        GRID_DELETE_BUTTON_HTML: '<a class="btn btn-danger btn-xs" ' +
        'ng-click="grid.appScope.vm.initDeleteModel(row.entity[\'id\'])" uib-tooltip=\'Sil\'' +
        ' tooltip-append-to-body="true" tooltip-placement="top"><i class="fa fa-trash"></i></a>',
        GRID_PAGE_INDEX_FIELD_NAME: 'pageIndex',
        GRID_PAGE_SIZE_FIELD_NAME: 'pageSize'
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
        DEFAULT_MODAL_CONTROLLER_NAME: window.__constants.DEFAULT_MODAL_CONTROLLER_NAME,
        //Default ajax spinner options
        DEFAULT_SPINNER_OPTIONS: {
            lines: 13, // The number of lines to draw
            length: 1, // The length of each line
            width: 10, // The line thickness
            radius: 30, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#FFC280', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%' // Left position relative to parent
        },
        ALLOWED_AVATAR_EXTENSIONS: '.png,.jpg'
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
        NO_VALIDATION_FUNC_DEFINED: 'no validation function defined'
    },
    //Securty Service
    security: {
        //Storage names
        STORAGE_NAME_CURRENT_COMPANY: window.__constants.STORAGE_NAME_CURRENT_COMPANY,
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

//#region Register
const module: ng.IModule = angular.module('rota.constants', []);
module.constant('Constants', rotaConstants);
//#endregion

export { rotaConstants }