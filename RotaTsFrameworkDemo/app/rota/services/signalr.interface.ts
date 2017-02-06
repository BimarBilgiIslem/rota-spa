
interface IHub<TMethods> {
    promise: JQueryPromise<any>;
    methods: TMethods;
    on(eventName: string, callback: (...msg: any[]) => void): void;
    invoke(method: string, args: any): JQueryPromise<any>;
    disconnect(): void;
    connect(queryParams?: string | Object): JQueryPromise<any>;
}

interface IHubOptions {
    /**
     * Collection of client side callbacks
     */
    listeners?: IListeners;
    /**
     * String array of server side methods which the client can call
     */
    methods?: Array<string>;
    /**
     * Sets the root path for the SignalR web service
     */
    rootPath?: string;

    /**
     * Object representing additional query params to be sent on connection
     */
    queryParams?: { [index: string]: string };

    /**
     * Function to handle hub connection errors
     */
    errorHandler?: (error: SignalR.ConnectionError) => void;

    /**
     * Enable/disable logging
     */
    logging?: boolean;

    /**
     * Use a shared global connection or create a new one just for this hub, defaults to true
     */
    useSharedConnection?: boolean;

    /**
     * Sets transport method (e.g    'longPolling'    or    ['webSockets', 'longPolling'] )
     */
    transport?: any;

    /**
     * Function to handle hub connection state changed event
     */
    stateChanged?: (state: SignalR.StateChanged) => void;
    //Other stuffs (not used)
    jsonp?: boolean;
    pingInterval?: number;
    withCredentials?: boolean;
    autoConnect?: boolean;
}

interface IPushService extends IBaseService {
    connectToHub(hubName: string, options: IHubOptions): IHub<{}>;
    connectToHub<TMethods>(hubName: string, options: IHubOptions): IHub<TMethods>;
}

interface IListeners {
    [index: string]: (...msg: any[]) => void;
}