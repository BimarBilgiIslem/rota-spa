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
//#endregion

//#region Localization Service
class FileDownload implements IFileDownload {
    //#region Props
    serviceName = "FileDownlaod Service";
    static injectionName = "FileDownload";
    //#region Init
    static $inject = ["$rootScope", "$q", "$httpParamSerializerJQLike", "Common", "Constants", "Localization", "Logger"];
    constructor(
        private $rootScope: IRotaRootScope,
        private $q: ng.IQService,
        private $httpParamSerializerJQLike: (obj: any) => string,
        private common: ICommon,
        private constants: IConstants,
        private localization: ILocalization,
        private logger: ILogger
    ) {

    }

    /**
     * Extract error message from server exception
     * @param responseHtml
     */
    tryToExtractError(responseHtml: string): string {
        //TODO: regex must be recured
        const regex = /<h2>\s?<i>(.*)<\/i>\s?<\/h2>/gmi;
        const result = regex.exec(responseHtml);

        if (result && result.length > 0) {
            return result[1];
        }
    }
    //#endregion

    //#region Methods 
    /**
     * Download a file with given credentials
     *
     * @param options Download options
     * @returns {IP<any>} Returns promise
     */
    download(options: FileDownloadOptions): IP<any> {
        const defer = this.$q.defer();
        const secureUrl = this.common.appendAccessTokenToUrl(options.url);
        ($ as any).fileDownload(secureUrl,
            {
                httpMethod: "POST",
                inline: options.inline,
                //$.param can not handle Date objects,must be ISO format so recurement is $httpParamSerializerJQLike
                data: this.$httpParamSerializerJQLike(options.filter),
                successCallback: () => {
                    this.$rootScope.$broadcast(this.constants.events.EVENT_FINISH_FILEDOWNLOAD);
                    defer.resolve();
                },
                prepareCallback: () => {
                    if (options.showIndicator)
                        this.$rootScope.$broadcast(this.constants.events.EVENT_AJAX_STARTED);
                },
                failCallback: (reponseHtml, url, error) => {
                    this.$rootScope.$broadcast(this.constants.events.EVENT_FAILED_FILEDOWNLOAD);
                    const message = this.localization.getLocal("rota.downloaderror");
                    this.logger.notification.error({ message });
                    defer.reject(error || this.tryToExtractError(reponseHtml));
                }
            }).always(() => {
                if (options.showIndicator)
                    this.$rootScope.$broadcast(this.constants.events.EVENT_AJAX_FINISHED);
            });

        return defer.promise;
    }
    //#endregion 
}
//#endregion

//#region Register
const module: ng.IModule = angular.module('rota.services.filedownload', []);
module.service(FileDownload.injectionName, FileDownload);

//#endregion

export { FileDownload }
