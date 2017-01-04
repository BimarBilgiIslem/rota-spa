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
    rotaModule: angular.IModule;
    private $controllerProvider: angular.IControllerProvider;
    private $provide: angular.auto.IProvideService;
    private $compileProvider: ng.ICompileProvider;
    private $filterProvider: ng.IFilterProvider;
    //#endregion

    //#region Init
    constructor(moduleName: string) {
        this.rotaModule = angular.module(moduleName, ["rota"]);
        //Configure lazy loading assignments and debug options
        this.configure(['$filterProvider', '$animateProvider', '$compileProvider', '$controllerProvider',
            '$provide', 'ConfigProvider', 'ivhTreeviewOptionsProvider', '$sceDelegateProvider', 'Environment', 'Constants',
            ($filterProvider: ng.IFilterProvider,
                $animateProvider: ng.animate.IAnimateProvider,
                $compileProvider: ng.ICompileProvider,
                $controllerProvider: ng.IControllerProvider,
                $provide: ng.auto.IProvideService,
                configProvider: IMainConfigProvider,
                ivhTreeviewOptionsProvider: any,
                $sceDelegateProvider: ng.ISCEDelegateProvider,
                environment: IGlobalEnvironment,
                constants: IConstants) => {
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
                //treeview global settings
                ivhTreeviewOptionsProvider.set({
                    idAttribute: 'id',
                    defaultSelectedState: false,
                    validate: true,
                    expandToDepth: 1,
                    twistieCollapsedTpl: constants.tree.TREE_TWISTIE_COLLAPSED_TPL,
                    twistieExpandedTpl: constants.tree.TREE_TWISTIE_EXPANDED_TPL,
                    twistieLeafTpl: '&nbsp;&nbsp;'
                });
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
            }]);
        //add base modal controllers if not defined controller.see dialog.services->showModal
        this.rotaModule.controller(window.__constants.DEFAULT_MODAL_CONTROLLER_NAME, this.createAnnotation(BaseModalController));
    }
    //#endregion

    //#region App Methods
    /**
     * Add controller with dependencies
     * @param controllerName Controller name
     * @param controller Controller instance
     * @param dependencies Dependencies 
     */
    addController(controllerName: string, controller: typeof InjectableObject, ...dependencies: string[]): void {
        const controllerAnnotation = this.createAnnotation(controller, dependencies);
        this.$controllerProvider.register(controllerName, controllerAnnotation);
    }
    /**
    * Add service api with dependencies
    * @param apiName Api name
    * @param api Api class itself
    * @param dependencies Optional dependencies
    */
    addApi(apiName: string, api: typeof BaseApi, ...dependencies: string[]): void {
        const apiAnnotation = this.createAnnotation(api, dependencies);
        this.$provide.service(apiName, apiAnnotation);
    }
    /**
    * Add value provider service
    * @param serviceName Value service name
    * @param service Service itself
    */
    addValue<TModel extends IBaseModel>(serviceName: string, service: TModel): void {
        this.$provide.value(serviceName, service);
    }
    /**
     * Register directive
     * @param directiveName Directive Name
     * @param directiveFactory Directive function
     */
    addDirective(directiveName: string, directiveFactory: Function | any[]): void {
        this.$compileProvider.directive(directiveName, directiveFactory);
    }
    /**
     * Register filter
     * @param filterName Filter Name
     * @param filterFactory Filter factory
     */
    addFilter(filterName: string, filterFactory: Function | any[]): void {
        this.$filterProvider.register(filterName, filterFactory);
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
    redirect(redirections: { from: string, to: string }[]): void {
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
var rotaApp: IRotaApp = new RotaApp("rota-app");
//Export
export { rotaApp as App }
