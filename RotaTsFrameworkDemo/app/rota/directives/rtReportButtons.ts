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

interface IReportButtonsScope extends ng.IScope {
    onClick: (type: string) => void;
    reportName: string;
    filters: IBaseReportFilter;
}

//#region Directive
function reportButtonsDirective(reporting: IReporting) {
    const directive = <ng.IDirective>{
        restrict: 'E',
        replace: true,
        scope: {
            reportName: '@',
            filters: '='
        },
        link: function (scope: IReportButtonsScope, elem: ng.IAugmentedJQuery, attrs: ng.IAttributes) {
            scope.onClick = (type: string) => {
                switch (type) {
                    case "indirpdf":
                        reporting.downloadReport({
                            reportName: scope.reportName, displayReportName: scope.reportName + ".pdf",
                            filter: scope.filters, reportExportType: ReportExportTypes.Pdf
                        });
                        break;
                    case "indirxls":
                        reporting.downloadReport({
                            reportName: scope.reportName, displayReportName: scope.reportName + ".xls",
                            filter: scope.filters, reportExportType: ReportExportTypes.Excel
                        });
                        break;
                    case "indirword":
                        reporting.downloadReport({
                            reportName: scope.reportName, displayReportName: scope.reportName + ".doc",
                            filter: scope.filters, reportExportType: ReportExportTypes.Word
                        });
                        break;
                    case "indirhtml":
                        reporting.downloadReport({
                            reportName: scope.reportName, displayReportName: scope.reportName + ".html",
                            filter: scope.filters, reportExportType: ReportExportTypes.Html
                        });
                        break;
                    case "gosterpdf":
                        reporting.downloadReport({
                            reportName: scope.reportName, displayReportName: scope.reportName + ".pdf",
                            filter: scope.filters, reportExportType: ReportExportTypes.Pdf,
                            reportDispositonType: ReportDispositonTypes.Inline
                        });
                        break;
                    case "gosterxls":
                        reporting.downloadReport({
                            reportName: scope.reportName, displayReportName: scope.reportName + ".xls",
                            filter: scope.filters, reportExportType: ReportExportTypes.Excel,
                            reportDispositonType: ReportDispositonTypes.Inline
                        });
                        break;
                    default:
                }
            }
        },
        template:
        '<div class="btn-group" uib-dropdown>' +
        '<rt-button size="sm" color="info" icon="external-link" click="onClick(\'reportviewer\')" text-i18n="rota.raporgoster"></rt-button>' +
        '<button uib-dropdown-toggle type="button" class="btn btn-info btn-sm dropdown-toggle" data-toggle="dropdown">' +
        '<span class="caret"></span><span class="sr-only">Toggle Dropdown</span></button>' +
        '<ul class="dropdown-menu" uib-dropdown-menu>' +
        '<li class="dropdown-header" i18n="rota.indir"></li>' +
        '<li><a href ng-click="onClick(\'indirpdf\')">' +
        '<i class="fa fa-file-pdf-o fa-fw"></i>&nbsp;{{::"rota.indirpdf" | i18n}}' +
        '</a></li>' +
        '<li><a href ng-click="onClick(\'indirxls\')">' +
        '<i class="fa fa-file-excel-o fa-fw"></i>&nbsp;{{::"rota.indirxls" | i18n}}' +
        '</a></li>' +
        '<li><a href ng-click="onClick(\'indirword\')">' +
        '<i class="fa fa-file-word-o fa-fw"></i>&nbsp;{{::"rota.indirword" | i18n}}' +
        '</a></li>' +
        '<li><a href ng-click="onClick(\'indirhtml\')">' +
        '<i class="fa fa-file-code-o fa-fw"></i>&nbsp;{{::"rota.indirhtml" | i18n}}' +
        '</a></li>' +
        '<li class="dropdown-header" i18n="rota.goster"></li>' +
        '</ul></div>'
    };
    return directive;
}

reportButtonsDirective.$inject = ['Reporting'];
//#endregion

//#region Register
angular.module('rota.directives.rtreportbuttons', [])
    .directive('rtReportButtons', reportButtonsDirective);
//#endregion

export { reportButtonsDirective }