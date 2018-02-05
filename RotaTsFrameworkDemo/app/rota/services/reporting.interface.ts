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
type IReportParameter = INameValueStructure;
/**
 * Report download options
 */
interface IReportDownloadOptions<TFilter> {
    /**
     * Actual SSRS Report Name
     */
    reportName: string;
    /**
     * Downloaded report name with extension
     */
    displayReportName: string;
    /**
     * Report Filter
     */
    filter?: TFilter;
    /**
     * Export Type
     */
    reportExportType?: ReportExportTypes;
    /**
     * Report Dsipositon Type
     */
    reportDispositonType?: ReportDispositonTypes;
}

/**
 * Reporting Service
 */
interface IReporting extends IBaseService {
    /**
    * Export/Downlaod report as specified mimetype
    * @param options Report generate options
    */
    downloadReport<TReportFilter extends IBaseReportFilter>(options: IReportDownloadOptions<TReportFilter>): void;
}
/**
 * Report Export Types
 */
const enum ReportExportTypes {
    None, Excel, Pdf, Html, Word, Excelopenxml
}
/**
 * Report Dispotion Types
 */
const enum ReportDispositonTypes {
    Inline, Attachment
}