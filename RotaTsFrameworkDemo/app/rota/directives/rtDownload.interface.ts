/**
 * Generic download options interface
 */
interface IDownloadOptions {
    /**
     * Filter props to query 
     */
    filter?: IDictionary<any>;
    /**
     * Download endpoint
     */
    url: string;
    /**
     * Indicator that download will be processed within IFrame or new window (window.open())
     */
    inline?: boolean;
}