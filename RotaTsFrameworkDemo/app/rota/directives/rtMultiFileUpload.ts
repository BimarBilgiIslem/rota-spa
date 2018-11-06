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

import ObserableModel from "../base/obserablemodel";
//#region Interfaces
interface IMultiFileUploadAttributes extends ng.IAttributes {
    fileidProp?: string;
}

interface IMultiFileUploadScope extends ng.IScope {
    accept?: string;
    maxUploadSize: string;
    downloadLink?: string;
    uploadFiles: (files: IFileInfo[]) => void;
    onUploaded: (file: { file: IFileInfo }) => ng.IPromise<IFileUploadResponseData>;
    remove: (file: IMultiFileUploadItem) => void;
    download: (link: string) => void;
}

interface IMultiFileUploadItem {
    $model: IFileModel;
    $uploadedFile: IUploadedFile;
}
//#endregion

//#region Directive
function multiFileUploadDirective($parse: ng.IParseService, $q: ng.IQService,
    localization: ILocalization, logger: ILogger, common: ICommon, constants: IConstants, config: IMainConfig) {
    //link fn
    function link(scope: IMultiFileUploadScope, element: ng.IAugmentedJQuery, attrs: IMultiFileUploadAttributes, modelCtrl: ng.INgModelController): void {

        let files: IMultiFileUploadItem[] = [];
        let models: IBaseListModel<IFileModel>;
        const fileIdPropGetter = $parse(attrs.fileidProp);
        scope.maxUploadSize = config.maxFileUploadSize;
        //#region Methods
        /**
         * Check extension
         * @param name File Name
         */
        const checkExt = name => {
            if (!scope.accept) {
                return true;
            }
            var extensions = scope.accept.replace(/\./g, '').split(',');
            var ext = name.split('.').pop().toLowerCase();

            if (extensions.indexOf(ext) === -1) {
                logger.toastr.warn({ message: localization.getLocal('rota.invalidfiletypemessage', scope.accept, name) });
                return false;
            }
            return true;
        };
        /**
         * Upload files
         * @param files
         */
        const uploadFiles = (addedFiles: IFileInfo[]): ng.IPromise<any> => {
            const pArray = [];
            addedFiles.forEach((file: IFileInfo): void => {
                //check ext
                if (!checkExt(file.name)) return;
                //set file model
                const fileModel = new ObserableModel<IFileModel>({ name: file.name });
                const uploadedFile: IUploadedFile = {
                    name: file.name,
                    downloadLink: '',
                    icon: common.getFaIcon(file.name.split('.').pop()),
                    isLoaded: false
                }
                //add model to list
                models.add(fileModel);
                files.unshift({
                    $model: fileModel,
                    $uploadedFile: uploadedFile
                });
                //call uploaded event
                const updateResult = scope.onUploaded({ file: file });
                //result
                updateResult.then((result: IFileUploadResponseData): void => {
                    uploadedFile.isLoaded = true;
                    (fileModel as IFileModel).cacheKey = result.newUid;
                }, (): void => {
                    //fail
                }, (args: angular.angularFileUpload.IFileProgressEvent): void => {
                    uploadedFile.total = args.total;
                    uploadedFile.loaded = args.loaded;
                });

                pArray.push(updateResult);
            });
            return $q.all(pArray);
        };
        /**
         * Refresh ngModel
         */
        const refreshModel = (): void => {
            const model = files.map((file: IMultiFileUploadItem): IFileModel => {
                return file.$model;
            });
            modelCtrl.$setViewValue(model);
        }
        //#endregion

        //#region Scope Methods
        /**
        * Watch ngModel and update list
        */
        modelCtrl.$formatters.push((modelFiles: IBaseListModel<IFileModel>) => {
            if (!common.isAssigned(modelFiles)) return;
            if (!common.isArray(modelFiles)) throw new Error(constants.errors.MODEL_EXPECTED_AS_ARRAY);
            models = modelFiles;
            files = modelFiles.map<IMultiFileUploadItem>((file: IFileModel): IMultiFileUploadItem => {
                return {
                    $model: file,
                    $uploadedFile: {
                        name: file.name,
                        icon: common.getFaIcon(file.name.split('.').pop()),
                        downloadLink: scope.downloadLink && (common.updateQueryStringParameter(scope.downloadLink, "fileId", fileIdPropGetter(file))),
                        isLoaded: true
                    }
                }
            });
            return modelFiles;
        });
        /**
         * Upload files
         * @param files Selected files
         */
        scope.uploadFiles = (files: IFileInfo[]): void => {
            if (!files || !files.length) return;
            //show immidiately loading spinner so it prevents user from saving the form 
            const originalDelayValue = constants.server.AJAX_TIMER_DELAY;
            constants.server.AJAX_TIMER_DELAY = 0;
            //upload 
            uploadFiles(files).finally((): void => {
                refreshModel();
                //set back original delay
                constants.server.AJAX_TIMER_DELAY = originalDelayValue; 
            });
        }
        /**
         * Remove file model
         * @param file IFileModel
         */
        scope.remove = (file: IMultiFileUploadItem): void => {
            try {
                (file.$model as IObserableModel<IBaseCrudModel>).remove();
            } finally {
                refreshModel();
            }
        }
        /**
         * Internal files
         */
        files = [];
        /**
         * Visible items
         */
        Object.defineProperty(scope, 'visibleItems', {
            configurable: false,
            get() {
                return _.filter(files, item => item.$model.modelState !== ModelStates.Deleted &&
                    item.$model.modelState !== ModelStates.Detached);
            }
        });
        //#endregion
    }
    //#region Directive definition
    //Directive definition
    const directive = <ng.IDirective>{
        restrict: 'E',
        require: 'ngModel',
        link: link,
        scope: {
            onUploaded: '&?',
            ngDisabled: '=?',
            downloadLink: '@',
            accept: '@'
        },
        template: '<ul class="list-group rt-multi-file-upload">' +
        '<li class="list-group-item text-center" ng-hide=ngDisabled>' +
        '<a uib-tooltip="{{::\'rota.dosyaekleaciklama\' | i18n}}" ngf-drag-over-class="bold" href ngf-drop="uploadFiles($files)" class="badge alert-info selector" ' +
        'ngf-select-disabled=ngDisabled ngf-select="uploadFiles($files)" ngf-multiple="true" ngf-accept=accept ngf-max-size=maxUploadSize>' +
        '<i class="fa fa-paperclip"></i>&nbsp;{{::\'rota.yenidosyaekle\' | i18n}}</a></li>' +
        '<li class="list-group-item rota-animate-rt-multiselect" ng-repeat="file in visibleItems">' +
        '<a href ng-if="file.$uploadedFile.downloadLink" rt-download="{{file.$uploadedFile.downloadLink}}"><i ng-class="[\'fa\', \'fa-fw\', \'fa-\' + file.$uploadedFile.icon]"></i>&nbsp;{{file.$uploadedFile.name}}</a>' +
        '<a href ng-if="!file.$uploadedFile.downloadLink"><i ng-class="[\'fa\', \'fa-fw\', \'fa-\' + file.$uploadedFile.icon]"></i>&nbsp;{{file.$uploadedFile.name}}</a>' +
        '<a ng-hide="ngDisabled || !file.$uploadedFile.isLoaded" uib-tooltip="{{::\'rota.tt_sil\' | i18n}}" tooltip-append-to-body="true" href class="pull-right" ng-click="remove(file)"><i class="fa fa-minus-circle text-danger"></i></a>' +
        '<div ng-hide="file.$uploadedFile.isLoaded" class="pull-right"><round-progress color="#45ccce" max="file.$uploadedFile.total" ' +
        'current="file.$uploadedFile.loaded" radius="9" stroke="3"></round-progress></div>' +
        '</li></ul>'
    };
    //#endregion

    return directive;
}
multiFileUploadDirective.$inject = ['$parse', '$q', 'Localization', 'Logger', 'Common', 'Constants', 'Config'];
//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.directives.rtmultifileupload', ['ngFileUpload']);
module.directive('rtMultiFileUpload', multiFileUploadDirective);
//#endregion

export { multiFileUploadDirective }