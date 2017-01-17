interface IConstants {
    APP_VERSION: string;
    APP_TITLE: string;
    DEFAULT_LOGO_IMAGE_NAME: string;
    PRODUCTION_DEBUG_WARNING: string;
    MIN_NUMBER_VALUE: number;
    MAX_NUMBER_VALUE: number;
    localization: {
        ACTIVE_LANG_STORAGE_NAME: string;
        DEFAULT_LANGUAGE: string,
        TIME_FORMAT: string;
        DATE_FORMAT: string;
        MONTH_FORMAT: string;
        YEAR_FORMAT: string;
        MIN_STEP: number;
    };
    key_codes: {
        ENTER: number; ESC: number; PLUS: number, DOWN_ARROW: number, UP_ARROW: number
    };
    server: {
        DEFAULT_API_PREFIX: string;
        ACTION_NAME_DEFAULT_FILE_UPLOAD: string;
        ACTION_NAME_LIST: string;
        ACTION_NAME_PAGED_LIST: string;
        ACTION_NAME_GET_BY_ID: string;
        ACTION_NAME_SAVE: string;
        ACTION_NAME_DELETE: string;
        ACTION_NAME_SET_REPORT_FILTERS: string;
        ACTION_NAME_GENERATE_REPORT: string;
        ACTION_NAME_GET_REPORT: string;
        ACTION_NAME_ANTI_FORGERY_TOKEN: string;
        HEADER_NAME_ANTI_FORGERY_TOKEN: string;
        HEADER_NAME_LANGUAGE: string;
        HEADER_NAME_ROLE_ID: string;
        HEADER_NAME_COMPANY_ID: string;
        AJAX_TIMER_DELAY: number
    };
    events: {
        EVENT_LOGIN_CHANGED: string;
        EVENT_AJAX_FINISHED: string;
        EVENT_AJAX_STARTED: string;
        EVENT_LOGIN_REQIRED: string;
        EVENT_MENU_CHANGED: string;
        EVENT_MODEL_LOADED: string;
        EVENT_RELOAD_WIDGET: string;
    };
    grid: {
        GRID_DEFAULT_PAGE_SIZE: number;
        GRID_DEFAULT_OPTIONS_NAME: string;
        GRID_FULL_FEATUTE_LIST: string;
        GRID_STANDART_FEATURE_LIST: string;
        GRID_CUSTOM_ROW_TEMPLATE: string;
        GRID_ROW_FORMATTER_ATTR: string;
        GRID_CONTEXT_MENU_ATTR: string;
        GRID_EDIT_BUTTON_HTML: string;
        GRID_DELETE_BUTTON_HTML: string;
        GRID_PAGE_INDEX_FIELD_NAME: string;
        GRID_PAGE_SIZE_FIELD_NAME: string
    };
    tree: { TREE_TWISTIE_COLLAPSED_TPL: string; TREE_TWISTIE_EXPANDED_TPL: string };
    select: {
        OBJ_VALUE_PROP_NAME: string;
        OBJ_DISPLAY_PROP_NAME: string;
        FILTER_STARTS_WITH: string;
        FILTER_CONTAINS: string;
        DEFAULT_PLACE_HOLDER_KEY: string;
        MIN_AUTO_SUGGEST_CHAR_LEN: number;
        DEFAULT_ITEMS_COUNT: number;
        DEFAULT_REFRESH_DELAY: number;
    };
    controller: {
        DEFAULT_FORM_NAME: string;
        DEFAULT_NEW_ITEM_PARAM_VALUE: string;
        DEFAULT_NEW_ITEM_PARAM_NAME: string;
        DEFAULT_READONLY_PARAM_NAME: string;
        DEFAULT_MODEL_ORDER_FIELD_NAME: string;
        DEFAULT_AUTOSAVE_INTERVAL: number;
        DEFAULT_MODAL_CONTROLLER_NAME: string;
        DEFAULT_SPINNER_OPTIONS: SpinnerOptions;
        ALLOWED_AVATAR_EXTENSIONS: string;
    };
    shortcuts: { GO_TO_FIRST_ROW_OF_GRID: string };
    errors: {
        MODEL_EXPECTED_AS_ARRAY: string;
        NO_TOTAL_PROP_PROVIDED: string;
        MISSING_CUSTOM_FILTER: string;
        MISSING_DISPLAY_PROP_OR_TEMPLATE: string;
        MISSING_REFRESH_METHOD: string;
        SELECTION_NOT_AVAILABLE: string;
        MISSING_VALUE_PROP: string;
        MISSING_TABS: string;
        MISSING_TEMPLATE_URL: string;
        NOT_ROOT_MENU_FOUND: string;
        NO_ANTIFORGERY_TOKEN_URL_DEFINED: string;
        NO_AVATAR_URI_PROVIDED: string;
        NO_REPORT_URL_PROVIDED: string;
        NO_REPORT_VIEWER_URL_PROVIDED: string;
        NO_VALIDATORS_DEFINED: string;
        NO_VALIDATOR_DEFINED: string;
        NO_VALIDATION_FUNC_DEFINED: string;
    };
    security: {
        AUTHORITY_PART: string;
        OPEN_ID_BUILTIN_CLAIMS: string[];
        DEFAULT_ROTA_SCOPES: string;
        DEFAULT_ROTA_RESPONSE_TYPE: string;
        REDIRECT_URI_PATH: string;
        STORAGE_NAME_AUTH_TOKEN: string;
        STORAGE_NAME_ROLE_ID: string;
        STORAGE_NAME_COMPANY_ID: string;
        STORAGE_NAME_TEMP_STATE: string;
        IDLE_TIMEOUT: number;
        COUNT_DOWN_FOR_IDLE_TIMEOUT: number;
    },
    logger: {
        TOASTR_TIMEOUT: number;
        TOASTR_POSITION: string;
        TOASTR_WARN_TIMEOUT: number;
        TOASTR_ERROR_TIMEOUT: number;
        TOASTR_INFO_TIMEOUT: number;
        TOASTR_SUCCESS_TIMEOUT: number;
        TOASTR_DEBUG_TIMEOUT: number;
    },
    routing: {
        SHELL_PATH: string;
        SHELL_STATE_NAME: string;
        SHELL_CONTENT_STATE_NAME: string;
        NOT_FOUND_HTML_NAME: string;
        NOT_FOUND_STATE_NAME: string;
        INTERNAL_ERROR_HTML_NAME: string;
        INTERNAL_ERROR_STATE_NAME: string;
        CONTROLLER_ALIAS_NAME: string;
        SHELL_CONTROLLER_ALIAS_NAME: string;
    },
    dashboard: {
        WIDGET_LOADING_TEMPLATE: string;
        MIN_WIDGET_REFRESH_INTERVAL: number;
    }
} 