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
         * Global storage names
         * @description this global constants aims to be aligned with main constants service
         */
        __constants?: {
            STORAGE_NAME_AUTH_TOKEN: string;
            STORAGE_NAME_ROLE_ID: string;
            STORAGE_NAME_COMPANY_ID: string;
            ACTIVE_LANG_STORAGE_NAME: string;
            DEFAULT_LANGUAGE: string;
            HEADER_NAME_LANGUAGE: string;
            HEADER_NAME_ROLE_ID: string;
            HEADER_NAME_COMPANY_ID: string;
            DEFAULT_MODAL_CONTROLLER_NAME: string;
        };
        /**
         * Global require
         */
        require?: Require;
        /**
         * ckEditor path,debug <ckeditor path>/* ,release /dist/rota/lib/ckeditor/
         */
        CKEDITOR_BASEPATH?: string;
    }
}

export { }