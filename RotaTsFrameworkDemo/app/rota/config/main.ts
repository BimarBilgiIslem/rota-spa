//#region Import main configuration
import "./main.configuration"
import { IRotaApp } from './app.interface';
//#endregion

//#region Load initial files
require(['config/vendor.index'], (): void => {
    require(['startup'], (app: IRotaApp): void => {
        //remove progress bar
        const pbar = document.getElementById('progressBar');
        if (pbar && pbar.parentNode) {
            pbar.parentNode.removeChild(pbar);
        }
        //bootstrap rota app
        angular.element(document).ready(() => {
            const $injector = angular.bootstrap(document, [app.rotaModule.name]);
            app.setInjector($injector);
        });
    });
});
//#endregion
