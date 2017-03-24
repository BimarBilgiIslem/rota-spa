//#region Imports
import { IRotaApp } from './app.interface';
//deps
import { BaseApi } from "../base/baseapi";
//import { BaseController } from '../base/basecontroller';
import { InjectableObject } from '../base/injectableobject';
import { BaseModalController } from '../base/basemodalcontroller';
import "./infrastructure.index"
//#endregion

class RotaApp implements IRotaApp {
    //#region Props
    //Main module name
    static readonly moduleName = "rota-app";
    //Main module
    rotaModule: angular.IModule;
    private $injector: ng.auto.IInjectorService;
    private $controllerProvider: angular.IControllerProvider;
    private $provide: angular.auto.IProvideService;
    private $compileProvider: ng.ICompileProvider;
    private $filterProvider: ng.IFilterProvider;
    //calbacks
    private errCallBack: Function | any[];
    private companyChangedCallBack: Function | any[];
    //#endregion

    //#region Init
    constructor(moduleName: string) {
        this.rotaModule = angular.module(moduleName, ["rota"]);
        //Configure lazy loading assignments and debug options
        this.configure(['$filterProvider', '$animateProvider', '$compileProvider', '$controllerProvider',
            '$provide', 'ConfigProvider', '$sceDelegateProvider', '$uibTooltipProvider', 'Environment', 'Constants',
            ($filterProvider: ng.IFilterProvider,
                $animateProvider: ng.animate.IAnimateProvider,
                $compileProvider: ng.ICompileProvider,
                $controllerProvider: ng.IControllerProvider,
                $provide: ng.auto.IProvideService,
                configProvider: IMainConfigProvider,
                $sceDelegateProvider: ng.ISCEDelegateProvider,
                $uibTooltipProvider: ng.ui.bootstrap.ITooltipProvider,
                environment: IGlobalEnvironment,
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
                //register xdom paths
                if (!_.isEmpty(environment.xDomPaths)) {
                    const xdoms = ['self'];
                    for (let xdom in environment.xDomPaths) {
                        if (environment.xDomPaths.hasOwnProperty(xdom)) {
                            let domUrl = environment.xDomPaths[xdom];
                            if (domUrl) {
                                //check trailing slash
                                if (domUrl.slice(-1) !== '/') {
                                    domUrl += "/";
                                }
                                domUrl += "**";
                                xdoms.push(domUrl);
                            }
                        }
                    }
                    $sceDelegateProvider.resourceUrlWhitelist(xdoms);
                }
                //remove tooltips for mobile
                if (window.__constants.IS_TOUCHABLE) {
                    $uibTooltipProvider.options({
                        trigger: 'none'
                    });
                }
            }]);
        //Hook handlers
        this.run(["$rootScope", "Constants", ($rootScope: IRotaRootScope, constants: IConstants) => {
            $rootScope.$on(constants.events.EVENT_ON_ERROR, (e, error) => {
                if (this.errCallBack) {
                    this.$injector.invoke(<Function>this.errCallBack, error);
                }
            });
            $rootScope.$on(constants.events.EVENT_COMPANY_CHANGED, (e, company) => {
                if (this.companyChangedCallBack) {
                    this.$injector.invoke(<Function>this.companyChangedCallBack, company);
                }
            });
        }]);
        //reload if user specific culture different than browser culture
        this.run(["$window", "Localization", "Config", "CurrentUser", "Constants", "Common",
            ($window: ng.IWindowService, localization: ILocalization, config: IMainConfig,
                currentUser: IUser, constants: IConstants, common: ICommon) => {
                const userCulture = config.culture || currentUser.culture,
                    selCulture = localStorage.getItem(constants.localization.ACTIVE_LANG_STORAGE_NAME),
                    initialCulture = $window.__constants.CULTURE;

                if (userCulture && userCulture !== initialCulture && common.isNullOrEmpty(selCulture)) {
                    //store culture and reload
                    localization.currentLanguage = { code: userCulture };
                }
            }]);
        //add base modal controllers if not defined controller.see dialog.services->showModal
        this.rotaModule.controller(window.__constants.DEFAULT_MODAL_CONTROLLER_NAME, this.createAnnotation(BaseModalController));
    }
    //#endregion

    //#region App Methods
    onCompanyChanged?(callBack: Function | any[]): void {
        this.companyChangedCallBack = callBack;
    }
    /**
     * 
     * @param errCallBack
     */
    onError?(errCallBack: Function | any[]): void {
        this.errCallBack = errCallBack;
    }
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
    addController(controllerName: string, controller: typeof InjectableObject, ...dependencies: string[]): IRotaApp {
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
    addApi(apiName: string, api: typeof BaseApi, ...dependencies: string[]): IRotaApp {
        const apiAnnotation = this.createAnnotation(api, dependencies);
        this.$provide.service(apiName, apiAnnotation);
        return this;
    }
    /**
    * Add value provider service
    * @param serviceName Value service name
    * @param service Service itself
    */
    addValue<TModel extends IBaseModel>(serviceName: string, service: TModel): IRotaApp {
        this.$provide.value(serviceName, service);
        return this;
    }
    /**
     * Register directive
     * @param directiveName Directive Name
     * @param directiveFactory Directive function
     */
    addDirective(directiveName: string, directiveFactory: Function | any[]): IRotaApp {
        this.$compileProvider.directive(directiveName, directiveFactory);
        return this;
    }
    /**
     * Register filter
     * @param filterName Filter Name
     * @param filterFactory Filter factory
     */
    addFilter(filterName: string, filterFactory: Function | any[]): IRotaApp {
        this.$filterProvider.register(filterName, filterFactory);
        return this;
    }
    /**
     * Add module after app bootstrap
     * @param modules Modules to load
     */
    addModule(...modules: string[]): IRotaApp {
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
    * Configure app method
    * @param fn Function to register
    * @returns {IRotaApp} 
    */
    configure(fn: any): IRotaApp {
        this.rotaModule.config(fn);
        return this;
    }
    /**
    * Register run phase function
    * @param fn Function to register
    * @returns {IRotaApp} 
    */
    run(fn: any): IRotaApp {
        this.rotaModule.run(fn);
        return this;
    }
    /**
     * Sets home page settings
     * @param options Options
     * @returns {IRotaApp}
     */
    setHomePage(options: IHomePageOptions): IRotaApp {
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
    redirect(redirections: { from: string, to: string }[]): IRotaApp {
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
                customBundles: {},
                systemBundles: {}
            }
            const systemServices = args.slice(0, args.length - dependencies.length);
            const customServices = args.slice(systemServices.length, args.length);

            systemServices.forEach((service: any, index: number) => {
                const serviceName = injectableObject.injects[index];
                bundle.systemBundles[serviceName.toLowerCase()] = service;
            });
            customServices.forEach((service: any, index: number) => {
                const serviceName = dependencies[index];
                bundle.customBundles[serviceName] = service;
            });

            const instance = new injectableObject(bundle);
            return instance;
        };
        //add ctor
        deps.push(controllerCtor);
        return deps;
    }
    //#endregion
}
//Instance of rota app
var rotaApp: IRotaApp = new RotaApp(RotaApp.moduleName);
//Export
export { rotaApp as App }
