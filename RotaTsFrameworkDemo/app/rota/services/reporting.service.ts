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
import * as moment from "moment";
//#endregion

//#region Reporting Service
/**
 * Reporting service
 */
class Reporting implements IReporting {
    serviceName = 'Reporting Service';
    static injectionName = "Reporting";

    static $inject = ['$q', 'Config', 'Logger', 'Constants', 'FileDownload', 'Localization'];
    constructor(
        private $q: ng.IQService,
        private config: IMainConfig,
        private logger: ILogger,
        private constants: IConstants,
        private fileDownload: IFileDownload,
        private localization: ILocalization,
        private notification: INotification) {

        if (!config.reportControllerUrl)
            this.logger.console.warn({ message: this.constants.errors.NO_REPORT_URL_PROVIDED });
        if (!config.reportViewerUrl)
            this.logger.console.warn({ message: this.constants.errors.NO_REPORT_VIEWER_URL_PROVIDED });
    }
    /**
     * Convert literak filter obj to ReportParams array     
     * @param filter Report Filter obj
     */
    private mapReportParams(filter: IBaseReportFilter): IReportParameter[] {
        const reportParams = _.reduce<any, IReportParameter[]>(filter, (memo, value: any, key: string) => {
            if (_.isArray(value)) {
                //SSRS expect a array with one item at least so add zero as default item
                const expectedArrayParam: Array<any> = value.length ? value : [0];
                memo = memo.concat(_.map(expectedArrayParam, item => { return { name: key, value: item } }));
            } else
                if (_.isDate(value))
                    memo.push({ name: key, value: moment(value).format(this.config.datetimeFormat.timeFormat) });
                else
                    memo.push({ name: key, value: value });
            return memo;
        }, []);
        return reportParams;
    }
    /**
     * Export/Downlaod report as specified mimetype
     * @param options Report generate options
     */
    downloadReport<TReportFilter extends IBaseReportFilter>(options: IReportDownloadOptions<TReportFilter>): IP<any> {
        //extend defaults
        options = angular.extend({
            reportExportType: ReportExportTypes.Pdf,
            reportDispositonType: ReportDispositonTypes.Attachment
        }, options);
        //get url and convert filter to report params
        const reportEndpoint = `${this.config.reportControllerUrl}/${this.constants.server.ACTION_NAME_GET_REPORT}`;
        const filter = this.mapReportParams(options.filter);
        const inline = options.reportDispositonType === ReportDispositonTypes.Inline;
        //start download 
        return this.fileDownload.download({
            url: reportEndpoint,
            filter: {
                options: {
                    reportName: options.reportName,
                    displayReportName: options.displayReportName,
                    reportExportType: options.reportExportType,
                    reportDispositonType: options.reportDispositonType,
                    reportCulture: options.reportCulture || this.localization.currentLanguage.code
                }, filter
            },
            inline,
            showIndicator: !inline
        }).then(
            () => this.logger.console.log({ message: options.reportName + ' report downloaded' }),
            (error: Error | string) => {
                const errorMessage = error && ((error as Error).message || (error as string));
                if (errorMessage) {
                    this.logger.notification.error({ message: errorMessage });
                }
                return this.$q.reject(new Error(errorMessage));
            });
    }
}

//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.reporting', []);
module.service(Reporting.injectionName, Reporting);
//#endregion

export { Reporting }