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

interface IConstants {
    APP_VERSION: string;
    APP_TITLE: string;
    DEFAULT_LOGO_IMAGE_NAME: string;
    PRODUCTION_DEBUG_WARNING: string;
    MIN_NUMBER_VALUE: number;
    MAX_NUMBER_VALUE: number;
    localization: {
        ACTIVE_LANG_STORAGE_NAME: string;
        DEFAULT_LANGUAGE: ISupportedCultures,
        DEFAULT_LANGUAGE_DISPLAY_NAME: string,
        ENGLISH_LANGUAGE: ISupportedCultures,
        ENGLISH_LANGUAGE_DISPLAY_NAME: string,
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
        ACTION_NAME_EXPORT_LIST: string;
        ACTION_NAME_GET_BY_ID: string;
        ACTION_NAME_SAVE: string;
        ACTION_NAME_DELETE: string;
        ACTION_NAME_SET_REPORT_FILTERS: string;
        ACTION_NAME_GENERATE_REPORT: string;
        ACTION_NAME_GET_REPORT: string;
        HEADER_NAME_LANGUAGE: string;
        HEADER_NAME_ROLE_ID: string;
        HEADER_NAME_COMPANY_ID: string;
        AJAX_TIMER_DELAY: number;
    };
    events: {
        EVENT_LOGIN_CHANGED: string;
        EVENT_AJAX_FINISHED: string;
        EVENT_AJAX_STARTED: string;
        EVENT_LOGIN_REQIRED: string;
        EVENT_MODEL_LOADED: string;
        EVENT_STATE_CHANGE_START: string;
        EVENT_STATE_CHANGE_SUCCESS: string;
        EVENT_ON_ERROR: string;
        EVENT_COMPANY_CHANGED: string;
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
        GRID_PAGE_SIZE_FIELD_NAME: string;
        GRID_MAX_PAGE_SIZE: number;
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
        STORAGE_NAME_STORED_FILTER_URL: string;
        GRID_REFRESH_INTERVALS: number[];
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
        NO_AVATAR_URI_PROVIDED: string;
        NO_REPORT_URL_PROVIDED: string;
        NO_REPORT_VIEWER_URL_PROVIDED: string;
        NO_VALIDATORS_DEFINED: string;
        NO_VALIDATOR_DEFINED: string;
        NO_VALIDATION_FUNC_DEFINED: string;
    };
    security: {
        STORAGE_NAME_CURRENT_COMPANY: string;
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
        SHELL_CONTROLLER_NAME: string;
        SHELL_PATH: string;
        SHELL_STATE_NAME: string;
        TEMPLATES: ITemplates;
        SHELL_CONTENT_STATE_NAME: string;
        NOT_FOUND_STATE_NAME: string;
        INTERNAL_ERROR_STATE_NAME: string;
        CONTROLLER_ALIAS_NAME: string;
        SHELL_CONTROLLER_ALIAS_NAME: string;
        QUICKMENU_STORAGE_KEY: string;
        MAX_QUICKMENU_LEN: number;
    },
    dashboard: {
        WIDGET_LOADING_TEMPLATE: string;
        MIN_WIDGET_REFRESH_INTERVAL: number;
    }
} 