﻿/**
 * Extending global window
 */
declare global {
    interface Window {
        /**
    * Environment settings applied by web.config
    */
        __globalEnvironment?: IGlobalEnvironment;
        /**
         * Access token for async request of text plugin
         */
        __access_token?: string;
        /**
         * Global storage names
         * @description this global constants aims to be aligned with main constants service
         */
        __constants?: {
            STORAGE_NAME_CURRENT_COMPANY: string;
            ACTIVE_LANG_STORAGE_NAME: string;
            DEFAULT_LANGUAGE: ISupportedCultures;
            HEADER_NAME_LANGUAGE: string;
            HEADER_NAME_ROLE_ID: string;
            HEADER_NAME_COMPANY_ID: string;
            DEFAULT_MODAL_CONTROLLER_NAME: string;
            IS_TOUCHABLE: boolean;
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
         * Device information
         */
        device?: IUAParser.IDevice;

        opera?: string;
    }


    interface JSON {
        dateParser?: (key, value) => Date;
    }
}

export { }