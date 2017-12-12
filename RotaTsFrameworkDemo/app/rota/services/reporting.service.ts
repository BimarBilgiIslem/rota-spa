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

    static $inject = ['$http', '$q', 'Routing', 'Config', 'Common', 'Localization', 'Dialogs', 'Logger', 'Constants'];
    constructor(
        private $http: ng.IHttpService,
        private $q: ng.IQService,
        private routing: IRouting,
        private config: IMainConfig,
        private common: ICommon,
        private localization: ILocalization,
        private dialogs: IDialogs,
        private logger: ILogger,
        private constants: IConstants) {
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
    downloadReport<TReportFilter extends IBaseReportFilter>(options: IReportDownloadOptions<TReportFilter>): ng.IPromise<any> {
        //extend defaults
        options = angular.extend({ reportExportType: ReportExportTypes.Pdf, reportDispositonType: ReportDispositonTypes.Attachment }, options);
        //get url
        const generateReportUrl = this.config.reportControllerUrl + "/" + this.constants.server.ACTION_NAME_GENERATE_REPORT +
            "?reportName=" + options.reportName + "&reportExportType=" + options.reportExportType;
        //convert filter to array
        const reportParams = this.mapReportParams(options.filter);
        //generate report
        const generateReportPromise = this.$http.post(generateReportUrl, reportParams);

        return generateReportPromise.then(() => {
            const getReportUrl = this.common.appendAccessTokenToUrl(
                `${this.config.reportControllerUrl}/${this.constants.server.ACTION_NAME_GET_REPORT}?displayReportName=${
                options.displayReportName}&reportDispositonType=${options.reportDispositonType}`);

            switch (options.reportDispositonType) {
                case ReportDispositonTypes.Attachment:
                    window.location.replace(getReportUrl);
                    break;
                case ReportDispositonTypes.Inline:
                    window.open(getReportUrl, null, 'height=950, width=950, status=yes, resizable=yes, scrollbars=yes,' +
                        ' toolbar=no, location=no, menubar=no left=0, top=10');
                    break;
            }
            this.logger.console.log({ message: options.reportName + ' report downloaded/viewed' });
        });
    }
    /**
     * Show ReportViewer
     * @param reportName Actual SSRS Report Name
     * @param options Report Options
     */
    showReport<TReportFilter extends IBaseReportFilter>(options: IReportViewerOptions<TReportFilter>): ng.IPromise<any> {
        let paramResponsePromise;

        if (!_.isEmpty(options.filter)) {
            //convert filter to array params
            const reportParams = this.mapReportParams(options.filter);
            paramResponsePromise = this.$http.post(this.config.reportControllerUrl + "/" +
                this.constants.server.ACTION_NAME_SET_REPORT_FILTERS, reportParams);
        }

        return this.common.makePromise(paramResponsePromise).then(() => {
            this.logger.console.log({ message: options.reportName + ' report opened in reportviewer' });
            return this.dialogs.showReport({
                message: options.message,
                title: options.title,
                okText: options.okText,
                windowClass: options.windowClass,
                reportName: options.reportName,
                reportViewerUrl: this.config.reportViewerUrl
            });
        });
    }
}

//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.reporting', []);
module.service(Reporting.injectionName, Reporting);
//#endregion

export { Reporting }