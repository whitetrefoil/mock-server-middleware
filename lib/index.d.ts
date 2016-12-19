/// <reference types="node" />
/// <reference types="connect" />
import { NextHandleFunction } from 'connect';
import { IncomingMessage } from 'http';
export interface IMockServerConfig {
    /**
     * If a request path starts like one of below,
     * it will be handled by the mock server,
     * otherwise it will call `next()` to pass the request to the next middleware.
     */
    apiPrefixes?: string[];
    /** Where the API definition files locate.  Related to PWD. */
    apiDir?: string;
    /** Replace /[^\w\d]/g to this when looking for API definition files. */
    nonChar?: string;
    /** Unify all cases to lower case */
    lowerCase?: boolean;
    /** Delay before response, in ms */
    ping?: number;
    /** Do not strip query in URL (instead replace '?' with nonChar). */
    preserveQuery?: boolean;
}
export interface IJsonApiDefinition {
    /** HTTP response status code */
    code?: number;
    /** Custom HTTP response headers */
    headers?: Object;
    /**  */
    body: Object | Object[] | string | string[];
}
export interface IException {
    definition: any;
    once: boolean;
}
export interface IExceptionStore {
    [path: string]: IException;
}
export declare function initialize(options: IMockServerConfig): void;
export declare function composeModulePath({url, method}: IncomingMessage): string;
export declare function convertJsonToHandler(json: IJsonApiDefinition): NextHandleFunction;
export declare function loadModule(modulePath: string): NextHandleFunction;
export declare const middleware: NextHandleFunction;
export declare const server: {
    once(method: string, url: string, definition: any): void;
    on(method: string, url: string, definition: any): void;
    off(method?: string, url?: string): void;
};
