interface IReportParameter {
    name: string;
    value: any;
}

interface IReportViewerOptions<TFilter> extends IDialogOptions {
    /**
    * Actual SSRS Report Name
    */
    reportName: string;
    /**
    * Report Filter
    */
    filter?: TFilter;
}
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
    * Show ReportViewer
    * @param reportName Actual SSRS Report Name
    * @param options Report Options
    */
    showReport<TReportFilter extends IBaseReportFilter>(options: IReportViewerOptions<TReportFilter>): ng.IPromise<any>;
    /**
      * Export/Downlaod report as specified mimetype
      * @param options Report generate options
      */
    downloadReport<TReportFilter extends IBaseReportFilter>(options: IReportDownloadOptions<TReportFilter>): ng.IPromise<any>;
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