/// <reference types="node" />
import * as url from 'url';
import { IMockServerConfig } from '../lib/msm';
export interface IOverride {
    definition: any;
    once: boolean;
}
export interface IOverrideStore {
    [path: string]: IOverride;
}
export interface ICallLog {
    method: string;
    href: string;
    search: string;
    query: object;
    pathname: string;
    body?: object;
}
export default class MSMServer {
    readonly config: IMockServerConfig;
    readonly overrides: IOverrideStore;
    readonly callLogs: ICallLog[];
    isRecording: boolean;
    constructor(config: IMockServerConfig);
    logCall(method: string, calledUrl: url.Url, body?: object): void;
    once(method: string, calledUrl: string, definition: any): void;
    on(method: string, calledUrl: string, definition: any): void;
    off(method?: string, calledUrl?: string): void;
    /**
     * Return a list of all previous requests.
     * @param pathname - Only return requests with pathname **starts** with this.
     *                   Use RegExp if you want to match in middle.
     * @param method - Filter by request method.
     */
    called(pathname?: string | RegExp, method?: string): ICallLog[];
    /**
     * Start recording requests.
     * If recording is already started or previous logs haven't been flushed
     * it will throw an Error to help prevent potential error in tests.
     *
     * You can explicitly pass the log-flush check via the arguments,
     * but the already-started check is mandatory.
     *
     * @param isFlushedCheckBypassed - Bypass log-flush check.
     * @throws {Error}
     */
    record(isLogFlushCheckBypassed?: boolean): void;
    /**
     * Stop recording requests but not to flush the logs.
     */
    stopRecording(): void;
    /**
     * Stop recording & flush all logs of requests.
     */
    flush(): void;
}
