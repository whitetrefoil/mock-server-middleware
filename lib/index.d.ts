/// <reference types="node" />
/// <reference types="connect" />
import { NextHandleFunction } from 'connect';
import { IncomingMessage } from 'http';
import Logger from './logger';
export interface IMockServerConfig {
    /**
     * If a request path starts like one of this,
     * it will be handled by the mock server,
     * otherwise it will call `next()` to pass the request to the next middleware.
     */
    apiPrefixes?: string[];
    /** Where the API definition files locate.  Related to PWD. */
    apiDir?: string;
    /** Replace `/[^\w\d-]/g` to this when looking for API definition files. */
    nonChar?: string;
    /** Whether to unify all cases to lower case. */
    lowerCase?: boolean;
    /** Delay before response, in ms. */
    ping?: number;
    /** Do not strip query in URL (instead replace '?' with nonChar). */
    preserveQuery?: boolean;
}
export interface IJsonApiDefinition {
    /** HTTP response status code. */
    code?: number;
    /** Custom HTTP response headers. */
    headers?: object;
    /** Response body.  Any valid JSON format can be used. */
    body: any;
}
export interface IOverride {
    definition: any;
    once: boolean;
}
export declare function composeModulePath({url, method}: IncomingMessage): string;
export declare function convertJsonToHandler(json: IJsonApiDefinition): NextHandleFunction;
export declare function loadModule(modulePath: string): NextHandleFunction;
export interface ICallLog {
    method: string;
    body?: object;
    href?: string;
    search?: string;
    query?: object;
    pathname?: string;
}
export declare function initialize(options: IMockServerConfig): void;
export declare const middleware: NextHandleFunction;
export declare const server: {
    once(method: string, url: string, definition: any): void;
    on(method: string, url: string, definition: any): void;
    off(method?: string, url?: string): void;
    called(pathname?: string | RegExp, method?: string): ICallLog[];
    record(): void;
    stopRecording(): void;
    flush(): void;
};
export { Logger };
