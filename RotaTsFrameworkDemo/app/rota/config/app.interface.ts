//import { BaseController } from '../base/basecontroller';
import { InjectableObject } from '../base/injectableobject';
import { BaseApi } from '../base/baseapi';

/**
 * Application interface
 */
export interface IRotaApp {
    rotaModule: ng.IModule;
    /**
    * Add controller with dependencies
    * @param controllerName Controller name
    * @param controller Controller instance
    * @param dependencies Dependencies 
    */
    addController(controllerName: string, controller: typeof InjectableObject, ...dependencies: string[]): void;
    /**
    * Register directive
    * @param directiveName Directive Name
    * @param directiveFactory Directive function
    */
    addDirective(directiveName: string, directiveFactory: Function | any[]): void;
    /**
    * Register filter
    * @param filterName Filter Name
    * @param filterFactory Filter factory
    */
    addFilter(filterName: string, filterFactory: Function | any[]): void;
    /**
     * Add service api with dependencies
     * @param apiName Api name
     * @param api Api class itself
     * @param dependencies Optional dependencies
     */
    addApi(apiName: string, api: typeof BaseApi, ...dependencies: string[]): void;
    /**
     * Add value provider service
     * @param serviceName Value service name
     * @param service Service itself
     */
    addValue<TModel extends IBaseModel>(serviceName: string, service: TModel): void;
    /**
     * Configure app method
     * @param fn Function to register
     * @returns {IRotaApp} 
     */
    configure(fn: Function): IRotaApp;
    /**
     * Configure app method
     * @param fn Function to register
     * @returns {IRotaApp} 
     */
    configure(fn: any[]): IRotaApp;
    /**
     * Register run phase function
     * @param fn Function to register
     * @returns {IRotaApp} 
     */
    run(fn: Function): IRotaApp;
    /**
     * Register run phase function
     * @param fn Function to register
     * @returns {IRotaApp} 
     */
    run(fn: any[]): IRotaApp;
    /**
     * Define a state rule providing the url
     * @description When from url is requested,go to url defined in to param
     * @param redirections List of reddirections including from and to paths
     * @example App.redirect([
    {
        from: "bkg/new",
        to: "bkg/new/genelbilgiler"
    }]);
     */
    redirect(redirections: { from: string, to: string }[]): void;
    /**
     * Sets home page settings
     * @param options Options
     * @returns {IRotaApp}
     */
    setHomePage(options: IHomePageOptions): IRotaApp;
}
