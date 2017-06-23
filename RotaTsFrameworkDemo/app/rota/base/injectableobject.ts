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

import * as _s from "underscore.string";
/**
 * Injectable class must be overriden by controllers and services to get access of registered dependencies
 */
class InjectableObject {
    //#region Props
    $injector: ng.auto.IInjectorService;
    /**
     * Service names to be injected
     */
    static injects = ['$injector'];
    //#endregion

    //#region Init
    constructor(bundle: IBundle, ...services: any[]) {
        this.initBundle(bundle);
    }
    /**
     * Resolve services
     * @param bundle Injected services
     */
    initBundle(bundle: IBundle): void {
        this.$injector = bundle.services['$injector'];
    }
    /**
     * Dynamically define service on controller
     * @param serviceName Service name
     * @param serviceInstance Service Instance
     */
    defineService(serviceName: string, serviceInstance: any): void {
        const propName = _s.decapitalize(serviceName);
        Object.defineProperty(this, propName, {
            get: () => {
                return serviceInstance;
            }
        });
    }
    //#endregion
}

export { InjectableObject }
