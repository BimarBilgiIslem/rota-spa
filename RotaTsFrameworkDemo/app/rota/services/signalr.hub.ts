//#region Imports
import "signalr.hubs"
//#endregion
/**
 * SignalR helper hub class in conjuction with server hub
 */
class Hub<TMethods> implements IHub<TMethods> {
    //#region Static Methods
    private static globalConnections: SignalR.Connection[] = [];
    /**
     * Create new connnection for negotition
     * @param options Hub Options
     */
    private static initNewConnection(options: IHubOptions): SignalR.Hub.Connection {
        let connection = null;
        if (options && options.rootPath) {
            connection = $.hubConnection(options.rootPath, { useDefaultPath: false });
        } else {
            connection = $.hubConnection();
        }
        connection.logging = (options && options.logging);
        return connection;
    }
    /**
     * Get connection
     * @param options
     */
    private static getConnection(options: IHubOptions): SignalR.Hub.Connection {
        const useSharedConnection = !(options && options.useSharedConnection === false);
        if (useSharedConnection) {
            return typeof Hub.globalConnections[options.rootPath] === 'undefined' ?
                Hub.globalConnections[options.rootPath] = Hub.initNewConnection(options) :
                Hub.globalConnections[options.rootPath];
        }
        else {
            return Hub.initNewConnection(options);
        }
    }
    //#endregion

    //#region Props
    private connection: SignalR.Hub.Connection;
    private proxy: SignalR.Hub.Proxy;
    promise: JQueryPromise<any>;
    methods: TMethods;
    //#endregion

    //#region Init
    constructor(hubName: string, private options: IHubOptions) {
        this.connection = Hub.getConnection(options);
        this.proxy = this.connection.createHubProxy(hubName);
        this.methods = {} as TMethods;

        this.registerMethods();

        if (options && options.queryParams) {
            this.connection.qs = options.queryParams;
        }
        if (options && options.errorHandler) {
            this.connection.error(options.errorHandler);
        }
        if (options && options.stateChanged) {
            this.connection.stateChanged(options.stateChanged);
        }

        //Adding additional property of promise allows to access it in rest of the application.
        if (options.autoConnect === undefined || options.autoConnect) {
            this.promise = this.connect();
        }
    }
    /**
     * Register initial server methods
     */
    private registerMethods(): void {
        //register server methods for listening
        if (this.options && this.options.listeners) {
            Object.getOwnPropertyNames(this.options.listeners)
                .filter(propName => (typeof this.options.listeners[propName] === 'function'))
                .forEach(propName => {
                    this.on(propName, this.options.listeners[propName]);
                });
        }
        //register server methods for triggering
        if (this.options && this.options.methods) {
            angular.forEach(this.options.methods, method => {
                this.methods[method] = (...args: any[]) => {
                    args.unshift(method);
                    return this.invoke.apply(this, args);
                };
            });
        }
    }
    //#endregion

    //#region Methods
    /**
     * Register server method for listening
     * @param eventName
     * @param callback
     */
    on(eventName: string, callback: (...msg: any[]) => void): void {
        this.proxy.on(eventName, callback);
    }
    /**
     * Call server method
     * @param method Method name
     * @param args Optional params
     */
    invoke(method: string, args: any): JQueryPromise<any> {
        return this.proxy.invoke.apply(this.proxy, arguments);
    }
    /**
     * Disconnects pipeline
     */
    disconnect(): void {
        this.connection.stop();
    }
    /**
     * Connect
     * @param queryParams
     */
    connect(queryParams?: string | Object): JQueryPromise<any> {
        const startOptions: SignalR.ConnectionOptions = {};
        if (this.options.transport) startOptions.transport = this.options.transport;
        if (this.options.jsonp) startOptions.jsonp = this.options.jsonp;
        if (this.options.pingInterval !== undefined) startOptions.pingInterval = this.options.pingInterval;

        if (angular.isDefined(this.options.withCredentials)) startOptions.withCredentials = this.options.withCredentials;
        if (queryParams) this.connection.qs = queryParams;
        return this.connection.start(startOptions);
    };
    //#endregion
}

export { Hub }