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

//#region Imports
import InjectableObject from '../base/injectableobject';
import "./infrastructure.index"
//#endregion

class RotaApp {
    //#region Props
    //Main module name
    static readonly moduleName = "rota-app";
    //registered objs
    private registeredObjs: IDictionary<Array<string>> = {};
    //Main module
    rotaModule: angular.IModule;
    private $injector: ng.auto.IInjectorService;
    private $controllerProvider: angular.IControllerProvider;
    private $provide: angular.auto.IProvideService;
    private $compileProvider: ng.ICompileProvider;
    private $filterProvider: ng.IFilterProvider;
    //#endregion

    //#region Init
    constructor(moduleName: string) {
        this.rotaModule = angular.module(moduleName, ["rota"]);
        this.init();
    }
    /**
     * Initialize module setup
     */
    private init(): this {
        //#region Config Blocks
        //Configure lazy loading assignments and debug options
        this.configure(['$filterProvider', '$animateProvider', '$compileProvider', '$controllerProvider',
            '$provide', 'ConfigProvider', '$uibTooltipProvider', 'Constants',
            ($filterProvider: ng.IFilterProvider,
                $animateProvider: ng.animate.IAnimateProvider,
                $compileProvider: ng.ICompileProvider,
                $controllerProvider: ng.IControllerProvider,
                $provide: ng.auto.IProvideService,
                configProvider: IMainConfigProvider,
                $uibTooltipProvider: ng.ui.bootstrap.ITooltipProvider,
                constants: IConstants) => {
                //Lazy registering 
                this.$controllerProvider = $controllerProvider;
                this.$provide = $provide;
                this.$compileProvider = $compileProvider;
                this.$filterProvider = $filterProvider;
                //remove debug info in prod
                if (!configProvider.config.debugMode) {
                    $compileProvider.debugInfoEnabled(false);
                    console.log('%c %s %s %s ', 'color: white; background-color: #c11;font-size:30px;', '--',
                        constants.PRODUCTION_DEBUG_WARNING, '--');
                }
                //only animation starts with rota-animate is allowed 
                //Stricted due to error in ui - select https://github.com/angular-ui/ui-select/issues/1467
                $animateProvider.classNameFilter(/rota-animate/);
                //remove tooltips for mobile
                if (window.__IS_TOUCHABLE) {
                    $uibTooltipProvider.options({
                        trigger: 'none'
                    });
                }
            }]);
        //#endregion

        //#region Run Blocks
        //reload if user specific culture different than browser culture
        //TODO:move to localization service
        this.run(["$window", "Localization", "Config", "CurrentUser", "Constants", "Common",
            ($window: ng.IWindowService, localization: ILocalization, config: IMainConfig,
                currentUser: IUser, constants: IConstants, common: ICommon) => {
                const userCulture = config.culture || currentUser.culture,
                    selCulture = localStorage.getItem(constants.localization.ACTIVE_LANG_STORAGE_NAME),
                    initialCulture = $window.__CULTURE;

                if (userCulture && userCulture.toLowerCase() !== initialCulture.toLowerCase() && common.isNullOrEmpty(selCulture)) {
                    //store culture and reload
                    localization.currentLanguage = { code: userCulture };
                }
            }]);
        //Make Typescript async/await available with angular $q service
        //https://stackoverflow.com/a/41825004/1016147
        this.run(['$window', '$q', ($window: ng.IWindowService, $q: ng.IQService) => {
            $window.Promise = $q;
        }]);
        //Set favicon
        this.run(["Config", "Common", (config: IMainConfig, common: ICommon) => {
            if (config.favIconName) {
                common.setFavIcon(common.addPrefixSlash(config.favIconName));
            }
        }]);
        //#endregion
        return this;
    }
    //#endregion

    //#region App Methods
    /**
     * Set injector for further module dependecy
     * @param $injector
     */
    setInjector($injector: ng.auto.IInjectorService): void {
        this.$injector = $injector;
    }
    /**
     * Add controller with dependencies
     * @param controllerName Controller name
     * @param controller Controller instance
     * @param dependencies Dependencies 
     */
    addController(controllerName: string, controller: typeof InjectableObject, ...dependencies: string[]): this {
        //check name
        this.validateName(controllerName, "controller");
        //register
        const controllerAnnotation = this.createAnnotation(controller, dependencies);
        this.$controllerProvider.register(controllerName, controllerAnnotation);
        return this;
    }
    /**
    * Add service api with dependencies
    * @param apiName Api name
    * @param api Api class itself
    * @param dependencies Optional dependencies
    */
    addApi(apiName: string, api: typeof InjectableObject, ...dependencies: string[]): this {
        //check name
        this.validateName(apiName, "api");
        api.injectionName = apiName;
        //register
        const apiAnnotation = this.createAnnotation(api, dependencies);
        this.$provide.service(apiName, apiAnnotation);
        return this;
    }
    /**
    * Add value provider service
    * @param serviceName Value service name
    * @param service Service itself
    */
    addValue<TModel extends IBaseModel>(serviceName: string, service: TModel): this {
        this.validateName(serviceName, "value");
        this.$provide.value(serviceName, service);
        return this;
    }
    /**
     * Register directive
     * @param directiveName Directive Name
     * @param directiveFactory Directive function
     */
    addDirective(directiveName: string, directiveFactory: Function | any[]): this {
        this.validateName(directiveName, "directive");
        this.$compileProvider.directive(directiveName, directiveFactory);
        return this;
    }
    /**
     * Register filter
     * @param filterName Filter Name
     * @param filterFactory Filter factory
     */
    addFilter(filterName: string, filterFactory: Function | any[]): this {
        this.validateName(filterName, "filter");
        this.$filterProvider.register(filterName, filterFactory);
        return this;
    }
    /**
     * Add module after app bootstrap
     * @param modules Modules to load
     */
    addModule(...modules: string[]): this {
        /**
         * Following code injected to angular to make "module adding after bootstrap" available.line 4345
         * https://github.com/angular/angular.js/pull/4694
         * 
         * instanceInjector.loadNewModules = function (mods) {
              forEach(loadModules(mods), function (fn) { instanceInjector.invoke(fn || noop); });
           };
         */
        this.$injector.loadNewModules(modules);
        return this;
    }
    /**
     * Set app global settings
     * @param settings App settings
     */
    setConfig(settings: IAppConfig): this {
        this.configure(["ConfigProvider", "SecurityConfigProvider", "RouteConfigProvider", "$urlRouterProvider", "Environment",
            (config: IMainConfigProvider, securityConfig: ISecurityConfigProvider,
                routeConfig: IRouteConfigProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider,
                environment: IGlobalEnvironment) => {
                //set all configs
                settings.main && config.configure(settings.main);
                settings.security && securityConfig.configure(settings.security);
                settings.routing && routeConfig.configure(settings.routing);

                if (settings.main && settings.main.homePageOptions) {
                    if (settings.main.homePageOptions.url) {
                        let baseUrl = "";
                        if (environment.baseUrl)
                            baseUrl = environment.baseUrl.replace(/\/$/, "");
                        //just redirect to home page when "/" is active state
                        $urlRouterProvider.when("/", baseUrl + settings.main.homePageOptions.url);
                    }
                }
            }]);
        return this;
    }
    /**
     * Add menus
     * @param menus Navigational menus
     */
    setNavMenus(menus: IMenuModel[]): this;
    setNavMenus(fn: (currentUser: IUser, currentCompany: ICompany) => IMenuModel[]): this;
    setNavMenus(args: any): this {
        this.run(["Routing", "CurrentUser", "CurrentCompany",
            (routing: IRouting, currentUser: IUser, currentCompany: ICompany) => {
                let menus: IMenuModel[];
                if (angular.isArray(args)) {
                    menus = args;
                }
                if (angular.isFunction(args)) {
                    menus = args(currentUser, currentCompany);
                }
                routing.addMenus(menus);
            }]);
        return this;
    }
    /**
     * Extend resources with dynamic resources from DB or else
     * @param dynamicresource Dynamic resource object
     */
    setResources(dynamicresource: IDictionary<string | IDictionary<string>>): this {
        this.run(["Resource", (resource: IDictionary<string | IDictionary<string>>) => {
            //Extend resources from server to statics
            resource = angular.extend(resource, dynamicresource);
        }]);
        return this;
    }
    /**
    * Configure app method
    * @param fn Function to register
    * @returns {this} 
    */
    configure(fn: any): this {
        this.rotaModule.config(fn);
        return this;
    }
    /**
    * Register run phase function
    * @param fn Function to register
    * @returns {this} 
    */
    run(fn: any): this {
        this.rotaModule.run(fn);
        return this;
    }
    /**
    * Sets home page settings
    * @param options Options
    * @returns {this}
    */
    setHomePage(options: IHomePageOptions): this {
        this.configure([
            "$urlRouterProvider", "RouteConfigProvider", "ConfigProvider",
            ($urlRouterProvider: ng.ui.IUrlRouterProvider, routeConfig: IRouteConfigProvider, config: IMainConfigProvider) => {
                if (options.url) {
                    //just redirect to home page when "/" is active state
                    $urlRouterProvider.when("/", options.url);
                }
                config.config.homePageOptions = options;
            }
        ]);
        return this;
    }
    /**
     * Define a state rule providiing the url 
     * @param redirections List of reddirections including from and to paths
     */
    redirect(redirections: { from: string, to: string }[]): this {
        this.configure(["$urlRouterProvider",
            ($urlRouterProvider: ng.ui.IUrlRouterProvider) => {
                const escapeRegex = (stringToGoIntoTheRegex: string): string => {
                    return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                }
                redirections.forEach((redirectItem): void => {
                    const regex = new RegExp(`^((?!\/${escapeRegex(redirectItem.to)}).)*${escapeRegex(redirectItem.from)}`, "i");
                    $urlRouterProvider.when(regex, "/" + redirectItem.to);
                });
            }]);
        return this;
    }
    /**
    * Create annotation style of contructor function
    * @param injectableObject Object type to register
    * @param dependencies Optional services depended
    */
    private createAnnotation(injectableObject: typeof InjectableObject, dependencies: string[] = []): any[] {
        const deps = new Array<any>().concat(injectableObject.injects, dependencies);
        const controllerCtor: Function = (...args: any[]): InjectableObject => {
            const bundle: IBundle = {
                services: {}
            }
            const systemServices = args.slice(0, args.length - dependencies.length);
            const customServices = args.slice(systemServices.length, args.length);

            systemServices.forEach((service: any, index: number) => {
                const serviceName = injectableObject.injects[index];
                bundle.services[serviceName.toLowerCase()] = service;
            });

            const instance = new injectableObject(bundle, ...customServices);
            return instance;
        };
        //add ctor
        deps.push(controllerCtor);
        return deps;
    }
    /**
     * Validate name if already registered
     * @param name Name
     * @param kind Kind of angular obj
     */
    private validateName(name: string, kind: "controller" | "api" | "value" | "directive" | "filter"): void {
        const names = this.registeredObjs[kind] || (this.registeredObjs[kind] = []);
        if (names.indexOf(name) !== -1) throw `${name} already registered - ${kind}`;
        names.push(name);
    }
    //#endregion
}
//Export
export default new RotaApp(RotaApp.moduleName);
