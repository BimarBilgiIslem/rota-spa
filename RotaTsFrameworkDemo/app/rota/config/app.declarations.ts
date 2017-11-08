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
 * optional plugin make the dependency optional,literal obj assign as defalt
 */
declare module "optional!*" {
    let json: any;
    export default json;
}
/**
 * json plugin which is override of text plugin is used to make async request to the restful services
 */
declare module "json!*" {
    let json: any;
    export default json;
}

/**
 * @description xdom plugin is used to import component or api from cross origin domains.
 * Make sure your CORS settings satisfied the criteries.
 * @example
 * import Injection = require("xdom!demo/customer/customer.api");
   import "xdom!demo/common/customer.directive"

   constructor(bundle: IBundle,
        @Inject(Injection.CustomerApi.injectionName) customerApi: any,
        private testapi: TestapiApi
    ) {
        super(bundle);

        this.customerApi = customerApi;
    }
 */
declare module "xdom!*" {
    let json: any;
    export = json;
}
/**
 * text plugin is used to fetch text files such as HTML,text etc.
 */
declare module "text!*" {
    let json: any;
    export default json;
}