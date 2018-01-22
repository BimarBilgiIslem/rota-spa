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
import { Localization } from './localization.service';
import "./logger.config";
import '../config/config';
import * as toastr from "toastr";
import * as moment from "moment";
import * as angular from "angular";

//#endregion

//#region Log Services
/**
 * Toast notification based on //John Papa toastr - https://github.com/CodeSeven/toastr
 */
class Toastr implements IToastr {
    constructor(private loggerconfig: ILoggerConfig) {
    }
    /**
     * Toast log message
     * @param toast Log
     */
    log(toast: ILog): IRemoveLog {
        toastr.options.timeOut = toast.isSticky ? 0 : this.loggerconfig.timeOuts[LogType.Debug];
        return this.info(toast);
    }
    /**
     * Toast error message
     * @param toast Log
     */
    error(toast: ILog): IRemoveLog {
        toastr.options.timeOut = toast.isSticky ? 0 : this.loggerconfig.timeOuts[LogType.Error];
        const elem = toastr.error(toast.message, toast.title || this.loggerconfig.defaultTitles[LogType.Error]);
        return () => { toastr.clear(elem); }
    }
    /**
     * Toast warn message
     * @param toast Log
     */
    warn(toast: ILog): IRemoveLog {
        toastr.options.timeOut = toast.isSticky ? 0 : this.loggerconfig.timeOuts[LogType.Warn];
        const elem = toastr.warning(toast.message, toast.title || this.loggerconfig.defaultTitles[LogType.Warn]);
        return () => { toastr.clear(elem); }
    }
    /**
     * Toast success message
     * @param toast Log
     */
    success(toast: ILog): IRemoveLog {
        toastr.options.timeOut = toast.isSticky ? 0 : this.loggerconfig.timeOuts[LogType.Success];
        const elem = toastr.success(toast.message, toast.title || this.loggerconfig.defaultTitles[LogType.Success]);
        return () => { toastr.clear(elem); }
    }
    /**
     * Toast info message
     * @param toast Log
     */
    info(toast: ILog): IRemoveLog {
        toastr.options.timeOut = toast.isSticky ? 0 : this.loggerconfig.timeOuts[LogType.Info];
        const elem = toastr.info(toast.message, toast.title || this.loggerconfig.defaultTitles[LogType.Info]);
        return () => { toastr.clear(elem); }
    }
    /**
     * Clear all toasts
     */
    clearAll(): void {
        toastr.clear();
    }
}
/**
 * Notification service works with notification.html in shell folder
 */
class Notification implements INotification {
    /**
     * All notifications
     */
    notifications: INotify[];

    constructor(private loggerconfig: ILoggerConfig,
        private $document: duScroll.IDocumentService,
        private $timeout: ng.ITimeoutService) {
        this.notifications = [];
    }
    /**
     * Notify log message
     * @param notify Notify message
     */
    log(notify: INotifyLog): IRemoveLog {
        return this.info(notify);
    }
    /**
     * Notify info message
     * @param notify Notify message
     */
    info(notify: INotifyLog): IRemoveLog {
        const result = this.addNotification({
            title: notify.title || this.loggerconfig.defaultTitles[LogType.Info],
            message: notify.message,
            icon: 'info-circle',
            style: 'info',
            isSticky: notify.isSticky,
            notificationLayout: notify.notificationLayout || NotificationLayout.Content,
            autoHideDelay: notify.autoHideDelay
        });
        return () => { this.removeNotification(result); }
    }
    /**
     * Notify error message
     * @param notify Notify message
     */
    error(notify: INotifyLog): IRemoveLog {
        const result = this.addNotification({
            title: notify.title || this.loggerconfig.defaultTitles[LogType.Error],
            message: notify.message,
            icon: 'times',
            style: 'danger',
            isSticky: notify.isSticky,
            notificationLayout: notify.notificationLayout || NotificationLayout.Content,
            autoHideDelay: notify.autoHideDelay
        });
        return () => { this.removeNotification(result); }
    }
    /**
     * Notify warn message
     * @param notify Notify message
     */
    warn(notify: INotifyLog): IRemoveLog {
        const result = this.addNotification({
            title: notify.title || this.loggerconfig.defaultTitles[LogType.Warn],
            message: notify.message,
            icon: 'warning',
            style: 'warning',
            isSticky: notify.isSticky,
            notificationLayout: notify.notificationLayout || NotificationLayout.Content,
            autoHideDelay: notify.autoHideDelay
        });
        return () => { this.removeNotification(result); }
    }
    /**
     * Notify success message
     * @param notify Notify message
     */
    success(notify: INotifyLog): IRemoveLog {
        const result = this.addNotification({
            title: notify.title || this.loggerconfig.defaultTitles[LogType.Success],
            message: notify.message,
            icon: 'check-square-o',
            style: 'success',
            isSticky: notify.isSticky,
            notificationLayout: notify.notificationLayout || NotificationLayout.Content,
            autoHideDelay: notify.autoHideDelay
        });
        return () => { this.removeNotification(result); }
    }
    /**
     * Add notification
     * @param notify Notify object
     * @param notifyType Notify Type
     */
    private addNotification(notify: INotify): INotify {
        //TODO:sce sanitize message and text ?
        this.notifications.push(notify);
        //autohide 
        if (notify.autoHideDelay) {
            this.$timeout(() => this.removeNotification(notify), notify.autoHideDelay);
        }
        //Scroll up to top to make notifications visible
        this.$document.duScrollTop && this.$document.duScrollTop(0, 500);
        return notify;
    }
    /**
     * Remove notification
     * @param notify Notify
     */
    removeNotification(notify: INotify): void {
        this.notifications.delete(notify);
    }
    /**
     * Remove all registered notifications
     * @param includeSticky Include sticky flag
     */
    removeAll(includeSticky?: boolean): void {
        this.notifications.delete((item) => {
            return includeSticky || !item.isSticky;
        });
    }
    /**
    * Clear all notifications
    */
    clearAll(): void {
        this.removeAll(true);
    }
}
/**
 * Console logger for either debugging and exceptions
 */
class Console implements IConsole {
    constructor(private $log: ng.ILogService, private config: IMainConfig) {
    }
    /**
     * Format log with timestamp
     * @param log Log
     */
    private formatLog(log: ILog): string {
        return `${moment().format('H:mm:ss SSS')} - ${log.message}`;
    }
    /**
     * Log generic method only works on debug mode
     * @param type Log type
     * @param args Args
     */
    private logit(type: string, ...args: any[]): void {
        if (this.config.debugMode) {
            this.$log[type](...args);
        }
    }
    /**
     * Log 
     * @param log Log
     */
    log(log: ILog): void {
        this.logit('log', this.formatLog(log), log.data);

    }
    /**
     * Info
     * @param log Log
     */
    info(log: ILog): void {
        this.logit('info', this.formatLog(log), log.data);
    }
    /**
     * Error
     * @param log Log
     */
    error(log: ILog): void {
        this.logit('error', this.formatLog(log), log.data);
    }
    /**
     * Warning
     * @param log Log
     */
    warn(log: ILog): void {
        this.logit('warn', this.formatLog(log), log.data);
    }
    /**
     * Success
     * @param log Log
     */
    success(log: ILog): void {
        this.logit('info', this.formatLog(log), log.data);
    }
    /**
     * Used for logs u think its important 
     * @param message Message
     */
    important(message: string): void {
        this.logit('log', '%c %s %s %s ', 'color: white; background-color: #57889c;', '--', message, '--');
    }
    /**
     * Used for timing measurements,starts times
     * @param message Message
     * @param timerName Timer name
     */
    startTime(message: string, timerName: string): void {
        if (!this.config.debugMode) return;
        this.logit('log', '%c%s %s %s', 'color: brown; font-weight: bold; text-decoration: underline;', '--', message, '--');
        //Start timer
        if (console.time) {
            console.time(timerName);
        } else {
            this.logit('error', 'console.time not supported');
        }
    }
    /**
     * Used for timing measurements,ends times
     * @param message Message
     * @param timerName Timer name
     */
    endTime(message: string, timerName: string): void {
        if (!this.config.debugMode) return;
        this.logit('log', '%c%s %s %s', 'color: brown; font-weight: bold; text-decoration: underline;', '--', message, '--');
        //Start timer
        if (console.timeEnd) {
            console.timeEnd(timerName);
        } else {
            this.logit('error', 'console.timeEnd not supported');
        }
    }
    /**
    * Clear console
    */
    clearAll(): void {
        console.clear();
    }
}
//#endregion

//#region Logger Service
/**
 * Logger Service
 */
class Logger implements ILogger {
    //#region Props
    serviceName = "Logger Service";
    static injectionName = "Logger";

    private logServices: { [index: number]: IBaseLogger<ILog> };
    //Services
    /**
     * Console Service
     * @returns {} Console Service
     */
    get console(): IConsole { return this.logServices[LogServices.Console] as IConsole; }
    /**
     * Notification Service
     * @returns {} Notification Service
     */
    get notification(): INotification { return this.logServices[LogServices.Notification] as INotification; }
    /**
     * Toastr service
     * @returns {} Toastr service
     */
    get toastr(): IToastr { return this.logServices[LogServices.Toastr] as IToastr; }
    //#endregion
    static $inject = ['$rootScope', '$log', '$document', '$timeout', 'Config', 'LoggerConfig', 'Localization', 'Constants'];
    constructor(private $rootScope: ng.IRootScopeService,
        private $log: ng.ILogService,
        private $document: duScroll.IDocumentService,
        private $timeout: ng.ITimeoutService,
        private config: IMainConfig,
        private loggerconfig: ILoggerConfig,
        private localization: ILocalization,
        private constants: IConstants) {
        loggerconfig.defaultTitles[LogType.Info] = localization.getLocal('rota.titleinfo');
        loggerconfig.defaultTitles[LogType.Warn] = localization.getLocal('rota.titlewarn');
        loggerconfig.defaultTitles[LogType.Success] = localization.getLocal('rota.titlesuccess');
        loggerconfig.defaultTitles[LogType.Error] = localization.getLocal('rota.titleerror');
        loggerconfig.defaultTitles[LogType.Debug] = localization.getLocal('rota.titledebug');
        //register services
        this.logServices = {};
        this.logServices[LogServices.Console] = new Console($log, config);
        this.logServices[LogServices.Notification] = new Notification(loggerconfig, $document, $timeout);
        //clear notifications when state changes for only menu states
        $rootScope.$on(constants.events.EVENT_STATE_CHANGE_SUCCESS,
            (event: ng.IAngularEvent, toState: IRotaState, toParams: ng.ui.IStateParamsService, fromState: IRotaState) => {
                //remove all notifications on condition that state is not nested or reload in process
                if (!toState.isNestedState || toState.name === fromState.name) {
                    (this.logServices[LogServices.Notification] as INotification).removeAll();
                }
            });

        this.logServices[LogServices.Toastr] = new Toastr(loggerconfig);
    }
}

//#endregion

//#region Register
var module: ng.IModule = angular.module('rota.services.log', ['rota.services.log.config', 'rota.config']);
module.service(Logger.injectionName, Logger);
//Config 
module.config([
    '$logProvider', 'ConfigProvider',
    ($logProvider: ng.ILogProvider, configProvider: IMainConfigProvider) => {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(configProvider.config.debugMode);
        }
    }
]);
//#endregion

export { Logger }