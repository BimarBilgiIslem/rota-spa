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
    constructor(bundle: IBundle) {
        this.initBundle(bundle);
    }
    /**
     * Resolve services
     * @param bundle Injected services
     */
    initBundle(bundle: IBundle): void {
        this.$injector = bundle.systemBundles['$injector'];
        //custom bundles
        for (let customBundle in bundle.customBundles) {
            if (bundle.customBundles.hasOwnProperty(customBundle)) {
                ((bundleName: string) => {
                    this.defineService(bundleName, bundle.customBundles[bundleName]);
                })(customBundle);
            }
        }
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
