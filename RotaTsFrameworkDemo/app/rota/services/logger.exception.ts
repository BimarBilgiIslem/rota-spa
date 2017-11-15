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
import "./logger.service"
//#endregion

//#region Client Error Tracker
const exceptionHandler = ($delegate: ng.IExceptionHandlerService, $injector: ng.auto.IInjectorService,
    config: IMainConfig) => {
    let loggerService: ILogger;
    let httpService: ng.IHttpService;
    let $rootScope: ng.IRootScopeService;
    //server logging
    const serverLogger = (exception: IException): ng.IPromise<any> => {
        httpService = httpService || $injector.get<ng.IHttpService>('$http');
        return httpService({
            method: 'POST',
            url: config.serverExceptionLoggingBackendUrl,
            data: exception,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    //Catch requirejs Errors
    requirejs.onError = err => {
        $rootScope = $rootScope || $injector.get<ng.IRootScopeService>('$rootScope');
        loggerService = loggerService || $injector.get<ILogger>('Logger');

        $rootScope.$apply((): void => {
            loggerService.notification.error({ message: err.message });
        });

        throw err;
    };

    return (exception: IException | string, cause?: string) => {
        if (config.debugMode) {
            $delegate(exception as IException, cause);
        } else {
            if (config.serverExceptionLoggingEnabled) {
                try {
                    serverLogger(exception as IException);
                } catch (e) { }
            }
        };
        loggerService = loggerService || $injector.get<ILogger>('Logger');
        //toastr and notification log
        const errorMsg = typeof exception === "string" ? exception : exception.message;
        loggerService.toastr.error({ message: errorMsg });
        loggerService.notification.error({ message: errorMsg });
    };
};
exceptionHandler.$inject = ['$delegate', '$injector', 'Config'];
//#endregion

//#region Server Error Tracker
var errorHttpInterceptorService = ($q: ng.IQService, $rootScope: IRotaRootScope,
    logger: ILogger, config: IMainConfig, constants: IConstants) => {
    //display server error messages
    const concatErrorMessages = (exception: IServerFailedResponseData | string): string => {
        if (angular.isString(exception)) {
            return <string>exception;
        }
        let exceptionMessages = new Array<string>();
        const error = exception as IServerFailedResponseData;
        //standart error messages properties
        error.message && exceptionMessages.push(error.message);
        error.exceptionMessage && exceptionMessages.push(error.exceptionMessage);
        //optional custom error messages
        if (error.errorMessages && error.errorMessages.length) {
            exceptionMessages = exceptionMessages.concat(error.errorMessages);
        }
        //stackTrace
        if (error.stackTrace && config.debugMode) {
            exceptionMessages = exceptionMessages.concat(error.stackTrace);
        }
        error.messageDetail && exceptionMessages.push(error.messageDetail);

        if (!exceptionMessages.length) return null;

        return exceptionMessages.join('<br/>');
    }
    return {
        responseError: (response: IBaseServerResponse<IServerFailedResponseData>) => {
            //Istemci hatasi 4xx ve Sunucu hatalari 5xx
            //Bad Requests,Internal Server Errors
            if (response.status >= 400 && response.status <= 500) {
                /********************************************************/
                let message = "Unknown error occured";
                //customize 404 messages
                if (response.status === 404) {
                    message = `'<b>${response.config.url}</b>' not found on the server`;
                } else {
                    message = concatErrorMessages(response.data);
                }
                logger.notification.error({ message: message });
                /********************************************************/
            } else if (response.status === 0) {
                //no response from server
                logger.notification.error({ message: 'Server connection lost' });
            }
            return $q.reject(response);
        }
    };
}
errorHttpInterceptorService.$inject = ['$q', '$rootScope', 'Logger', 'Config', 'Constants'];
//#endregion

//#region Register
const module = angular.module('rota.services.log');
//Register client exception handler
module.config(['$provide', ($provide: angular.auto.IProvideService) => {
    $provide.decorator('$exceptionHandler', exceptionHandler);
}]);
//Register server error interceptor
module.factory('errorHttpInterceptor', errorHttpInterceptorService)
    .config([
        '$httpProvider', ($httpProvider: ng.IHttpProvider) => {
            $httpProvider.interceptors.push('errorHttpInterceptor');
        }
    ]);
//#endregion