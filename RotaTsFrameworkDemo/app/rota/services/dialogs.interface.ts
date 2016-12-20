﻿//#region Dialog Interfaces
/**
 * Dialog window options
 */
interface IDialogOptions {
    message?: string,
    title?: string,
    okText?: string;
    windowClass?: string;
}
/**
 * Dialog window scope
 */
interface IDialogScope extends ng.IScope, IDialogOptions {
    ok(): void
}
/**
 * COnfirm window options
 */
interface IConfirmOptions extends IDialogOptions {
    cancelText?: string;
}
/**
 * Confirm window scope
 */
interface IConfirmScope extends IDialogScope, IConfirmOptions {
    cancel(): void;
}

interface IReportOptions extends IDialogOptions {
    reportName: string;
    reportViewerUrl?: string;
}

interface IReportScope extends IDialogScope {
    reportViewerUrl: string;
    reportName: string;
    cancel(): void;
}
/**
 * Progress options
 */
interface IProgressOptions {
    title?: string;
    percent: number;
}
/**
 * Progress scope
 */
interface IProgressScope extends ng.IScope, IProgressOptions {
}
/**
 * Progress modal instance
 */
interface IProgressModalInstance extends ng.ui.bootstrap.IModalServiceInstance {
    percent: number;
}
/**
 * Prompt window options
 */
interface IPromptOptions {
    title: string;
    subTitle: string;
    initValue?: string;
    okText?: string;
    cancelText?: string;
}
/**
 * Prompt window scope
 */
interface IPromptScope extends ng.IScope, IPromptOptions {
    value: any;
    ok(): void;
    cancel(): void;
}
/**
 * File Info
 */
interface IFileInfo {
    lastModified?: Date;
    name?: string;
    size?: number;
    type?: string;
}
/**
 * Used for caching file and model implemetations
 */
interface IFileModel extends IBaseCrudModel {
    name?: string;
    cacheKey?: string;
}
/**
 * Cropped image result of file upload
 */
interface ICroppedImageUploadResult {
    image?: Blob;
    croppedDataUrl?: string;
}
/**
 * File updaload options
 */
interface IFileUploadOptions {
    /**
     * Modal title
     */
    title?: string;
    /**
     * File extensions which will be granted to upload such .xml,.edi
     * @example .xml,.edi
     */
    allowedExtensions?: string;
    /**
     * Send button text
     */
    sendText?: string;
    /**
     * Show cropping are if imageCroppingOptions assigned
     */
    showImageCroppingArea?: boolean;
}
/**
 * File Upload Scope
 */
interface IFileUploadScope extends ng.IScope, IFileUploadOptions {
    model: { file?: IFileInfo, croppedDataUrl?: string };
    croppedDataUrl?: string;
    sendFile(): void;
    dismiss(): void;
}
/**
 * Options used in modal instance
 */
interface IModalInstanceOptions {
    /**
     * Your custom modal model transferred to modal instance
     */
    model?: any;
    /**
     * Any custom additional data transferred to modal instance
     */
    params?: any;
    /**
     * Optional services to be injected 
     */
    services?: string[];
}
/**
 * Modal options
 */
interface IModalOptions extends ng.ui.bootstrap.IModalSettings {
    /**
     * Modal template url
     */
    templateUrl: string;
    /**
     * Controller url
     */
    controllerUrl?: string;
    /**
     * Modal instance options 
     */
    instanceOptions?: IModalInstanceOptions;
    /**
     * Modal controller name.
     * @description Controller should be string or left undefined.In case of undefined,default modal controller assigned to modal (BaseModalController)
     */
    controller?: any;
}

/**
 * Image Cropping Scope
 */
interface IImageCroppingScope extends ng.IScope, IImageCroppingOptions {
    imageFile: IFileInfo;
    croppedDataUrl?: string;
    cropActionText?: string;
    crop(): void;
    dismiss(): void;
}
/**
 * Image cropping modal options
 */
interface IImageCroppingOptions {
    /**
     * Image to be cropped
     */
    imageFile: IFileInfo;
    cropActionText?: string;
    areaType?: "circle" | "square";
}

//#endregion

//#region Dialog Service Interface

/**
 * Modal dialog service
 */
interface IDialogs extends IBaseService {
    /**
     * Show SSRS reports viewer
     * @param options Report params
     */
    showReport(options: IReportOptions): ng.IPromise<any>;
    /**
    * Show simple dialog with ok button
    * @param options Dialog options
    */
    showDialog(options: IDialogOptions): ng.IPromise<any>;
    /**
    * Show confirm dialog with ok,cancel buttons
    * @param options Confirm options
    */
    showConfirm(options: IConfirmOptions): ng.IPromise<any>;
    /**
    * Show progress based on percent value
    * @param options Progress dialog options
    */
    showProgress(options: IProgressOptions): IProgressModalInstance;
    /**
    * Show prompt dialog
    * @param options Prompt options
    */
    showPrompt(options: IPromptOptions): ng.IPromise<any>;
    /**
    * Show file upload dialog
    * @param options FileUpload options
    */
    showFileUpload(options?: IFileUploadOptions): ng.IPromise<ICroppedImageUploadResult | IFileInfo>;
    /**
     * Show image cropping modal
     * @param options Crpoping Options
     * @returns {ng.IPromise<any>} 
     */
    showImageCropping(options?: IImageCroppingOptions): ng.IPromise<ICroppedImageUploadResult>;
    /**
   * Show modal window
     * @description if controller not provided,BaseModalController will be used.
     * if ControllerUrl not defined,it will be looked in templateUrl path
     * @param options Modal options
   */
    showModal<TResult extends IBaseModel>(options: IModalOptions): ng.IPromise<TResult>;
}
//#endregion
