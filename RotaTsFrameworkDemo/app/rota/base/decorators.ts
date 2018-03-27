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
 * limitations under the License
 */
import App from "rota/config/app"

const STATIC_INJECTION_SYMBOL_NAME = "static-injections";
/**
 * This count is dynamically incremented to use as a suffix for the service register name
 */
let API_COUNT = 0;

/**
 * Used for static injection meta
 */
type StaticInject = {
    /**
     * injection name
     */
    name: string;
    /**
     * Param index
     */
    parameterIndex: number;
}
/**
 * Mixin type base constructor
 */
type BaseOptionsConstructor = {
    new(...args: any[]): {
        initController(): void;
    }
};

//#region Decorators
/**
 * Decoration that provides options of controller's behaviours
 * @param options Controller options or registerName 
 */
function Controller<TOptions extends IBasePageOptions>(options: TOptions | string) {
    return <T extends BaseOptionsConstructor>(base: T) => {
        //cast if only registerName supported
        if (typeof options === "string") {
            options = { registerName: options } as TOptions;
        }

        const extendedController = class extends base {
            constructor(...args: any[]) {
                //merge options with default options (es6 object shortcut is replaced with ng.merge due to shadow copy)
                const mergedOptions = angular.merge({}, (base as any).defaultOptions, options);
                //{ ...(base as any).defaultOptions, ...(options as object) };
                //merge options with bundle,args[0] is bundle
                args[0] = { ...args[0], options: mergedOptions };
                //call controller constructor
                super(...args);
                //injected services available here on this so call securely initController method
                this.initController();
            }
        }
        //register api
        App.addController(options.registerName, extendedController as any, ...getDependencies(base));
        return extendedController;
    }
}
/**
 * Decoration that provides options of api's behaviours
 * @param options Api Options
 */
function Api<TOptions extends IApiOptions>(options?: TOptions) {
    return <T extends {
        new(...args: any[]): {}
    }>(base: T) => {
        //register api
        const extendedApi = class extends base {
            constructor(...args: any[]) {
                //merge options with bundle
                args[0] = { ...args[0], options };
                //call controller constructor
                super(...args);
            }
        }
        //register api

        App.addApi((options && options.registerName) || `api_${++API_COUNT}`,
            extendedApi as any, ...getDependencies(base));
        return extendedApi;
    }
}
/**
 * Directive decorator
 * @param options 
 */
function Directive(registerName: string) {
    return <T extends {
        new(...args: any[]): {}
    }>(base: T) => {
        var directive = function (...args: any[]) {
            return new base(...args);
        };
        directive.$inject = getDependencies(base, 0);
        //register api
        App.addDirective(registerName, directive as any);
        return base;
    }
}
/**
 * Static injection decorator,
 * @description Must be used with builtin servicess such as $timeout,$sce
 * @param name
 */
function Inject(name: string) {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const injects: StaticInject[] = Reflect.getOwnMetadata(STATIC_INJECTION_SYMBOL_NAME, target) || [];
        injects.push({ name, parameterIndex });
        Reflect.defineMetadata(STATIC_INJECTION_SYMBOL_NAME, injects, target);
    }
}
/**
 * get injected param names
 * @description Get injected params from reflected params if available,otherwise use its param name
 * @param constructorFunction
 * @param startIndex 
 * @returns {string[]} dependecy names
 */
//#endregion

//#region Methods
const getDependencies = (constructorFunction: Function, startIndex: number = 1): string[] => {
    //get meta of constructor params using reflect
    const paramTypes: any[] = Reflect.getMetadata("design:paramtypes", constructorFunction);
    let dependencies: string[] = [];

    if (paramTypes && paramTypes.length) {
        const staticInjects: StaticInject[] = Reflect.getOwnMetadata(STATIC_INJECTION_SYMBOL_NAME, constructorFunction);
        //get injectionname of service otherwise get param key as string,skip bundle as first param
        dependencies = paramTypes.slice(startIndex).map((item, i) => {
            if (item.injectionName) return item.injectionName;
            if (staticInjects && staticInjects.length) {
                const injectName = staticInjects.firstOrDefault(item => item.parameterIndex === (i + startIndex));
                if (injectName) return injectName.name;
            }
            throw `injection failed for parameter index (${i + startIndex}).are you missing @Inject() decorator ?`;
        });
    }
    return dependencies;
}
//#endregion

export { Controller, Api, Directive, Inject }