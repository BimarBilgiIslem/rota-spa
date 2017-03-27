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

/**
 * Extending global window
 */
declare global {
    interface Window {
        /**
    * Environment settings applied by web.config
    */
        __globalEnvironment?: IGlobalEnvironment;
        /**
         * OIDC manager for async request of text plugin
         */
        __OIDC?: IOidcManager;
        /**
         * Global storage names
         * @description this global constants aims to be aligned with main constants service
         */
        __constants?: {
            STORAGE_NAME_CURRENT_COMPANY: string;
            ACTIVE_LANG_STORAGE_NAME: string;
            DEFAULT_LANGUAGE: ISupportedCultures;
            ENGLISH_LANGUAGE: ISupportedCultures;
            HEADER_NAME_LANGUAGE: string;
            HEADER_NAME_ROLE_ID: string;
            HEADER_NAME_COMPANY_ID: string;
            DEFAULT_MODAL_CONTROLLER_NAME: string;
            IS_TOUCHABLE: boolean;
            CULTURE?: string;
        };
        /**
         * Global require
         */
        require?: Require;
        /**
         * ckEditor path,debug <ckeditor path>/* ,release /dist/rota/lib/ckeditor/
         */
        CKEDITOR_BASEPATH?: string;
        /**
         * this is for device detect
         */
        opera?: string;
    }


    interface JSON {
        dateParser?: (key, value) => Date;
    }
}

export { }