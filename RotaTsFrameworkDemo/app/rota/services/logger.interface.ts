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

//#region Interfaces
/**
 * Exception Server log 
 */
interface IException extends Error {
    userName?: string;
}
/**
 * Log service config
 */
interface ILoggerConfig {
    /**
     * Timeouts for toastr notifications
     */
    timeOuts?: { [index: number]: number };
    /**
     * Default titles for all types
     */
    defaultTitles?: { [index: number]: string };
}
/**
 * Generic log interface
 */
interface ILog {
    /**
     * Log message
     */
    message: string;
    /**
     * Log title
     */
    title?: string;
    /**
     * Optional data for console logger
     */
    data?: any;
    /**
     * Optional sticky flag available for toasts and notifications only
     */
    isSticky?: boolean;
}
/**
 * Log interface for notification logger
 */
interface INotifyLog extends ILog {
    /**
     * Enum that whether notification will be displayed in top or content
     */
    notificationLayout?: NotificationLayout;
    /**
     * Notification will close if provided hideDelay in ms passed
     */
    autoHideDelay?: number;
}

type IAlertStyle = 'warning' | 'danger' | 'success' | 'info';
/**
 * Log object for notification
 */
interface INotify extends INotifyLog {
    /**
     * Notifictaion icon
     */
    icon: string;
    /**
     * Notifictaion style
     * @description It should be bootstrap styles warning,danger,success,info
     */
    style: IAlertStyle;
}
/**
 * Logger remove function
 */
interface IRemoveLog {
    (): void;
}
/**
 * Generic log call method
 */
interface ILogCall<TLog> {
    (log: TLog): IRemoveLog | void;
}
/**
 * Base logger
 */
interface IBaseLogger<TLog extends ILog> {
    log: ILogCall<TLog>;
    info: ILogCall<TLog>;
    error: ILogCall<TLog>;
    warn: ILogCall<TLog>;
    success: ILogCall<TLog>;
    clearAll: () => void;
}
/**
 * Dialog logger
 */
interface IDialogLogger extends IBaseLogger<ILog> {
}
/**
 * Toastr service
 */
interface IToastr extends IBaseLogger<ILog> {
}
/**
 * Notifiction service
 */
interface INotification extends IBaseLogger<INotifyLog> {
    /**
     * Get active notfifictaions both current and sticky
     */
    notifications: INotify[];
    /**
     * Remove notification
     * @param notify Notify
     */
    removeNotification(notify: INotify): void;
    /**
     * Remove all
     * @param includeSticky 
     */
    removeAll(includeSticky?: boolean): void;
}
/**
 * Console logger
 */
interface IConsole extends IBaseLogger<ILog> {
    important(message: string): void;
    /**
     * Starts a timer with the given name for timer
     * @param message Starting message
     * @param timerName Timer name
     */
    startTime(message: string, timerName: string): void;
    /**
     * Stops the timer of which name is given
     * @param message Ends message
     * @param timerName Timer name
     */
    endTime(message: string, timerName: string): void;
}
/**
 * Main Logger service
 */
interface ILogger extends IBaseService {
    notification: INotification;
    console: IConsole;
    toastr: IToastr;
}
//#endregion

//#region Enums
/**
 * Log Types
 */
const enum LogType {
    Info,
    Error,
    Warn,
    Success,
    Debug
}
/**
 * Log service types
 */
const enum LogServices {
    Console = 1,
    Toastr = 2,
    Notification = 4
}
/**
 * Notification types
 */
const enum NotifyType {
    Sticky,
    RouteCurrent,
    RouteNext
}
/**
 * Notifictiaon logger layout 
 */
const enum NotificationLayout {
    Content,
    Top,
    Modal
}
//#endregion
