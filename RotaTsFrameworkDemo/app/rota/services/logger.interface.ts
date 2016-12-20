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
     * Optional data
     */
    data?: any;
    /**
     * Optional sticky flag available for toasts and notifications only
     */
    isSticky?: boolean;
}

type IAlertStyle = 'warning' | 'danger' | 'success' | 'info';
/**
 * Log object for notification
 */
interface INotify extends ILog {
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
 * Generic log call method
 */
interface ILogCall {
    (log: ILog): void
}
/**
 * Base logger
 */
interface IBaseLogger {
    log: ILogCall;
    info: ILogCall;
    error: ILogCall;
    warn: ILogCall;
    success: ILogCall;
}
/**
 * Toastr service
 */
interface IToastr extends IBaseLogger {
}
/**
 * Notifiction service
 */
interface INotification extends IBaseLogger {
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
interface IConsole extends IBaseLogger {
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
    notification: IBaseLogger;
    console: IBaseLogger;
    toastr: IBaseLogger;
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
//#endregion
