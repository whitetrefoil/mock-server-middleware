/// <reference types="node" />
import { NextHandleFunction } from 'connect';
import { IncomingMessage, ServerResponse } from 'http';
import Logger, { ILogLevel } from './logger';
import MSMServer from './server';
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
    /**
     * Log level. 'INFO' & 'LOG' is the same. Default is 'NONE'.
     */
    logLevel?: ILogLevel;
}
export interface IJsonApiDefinition {
    /** HTTP response status code. */
    code?: number;
    /** Custom HTTP response headers. */
    headers?: object;
    /** Response body.  Any valid JSON format can be used. */
    body: any;
}
interface IRequestWithOptionalBody extends IncomingMessage {
    body?: any;
}
export { IRequestWithOptionalBody as IRequest, ServerResponse as IResponse, NextHandleFunction as INextFn };
export declare type IMSMMiddleware = (request: IRequestWithOptionalBody, response: ServerResponse, next: () => any) => void;
export default class MSM implements IMockServerConfig {
    readonly apiPrefixes: string[];
    readonly apiDir: string;
    readonly nonChar: string;
    readonly lowerCase: boolean;
    readonly ping: number;
    readonly preserveQuery: boolean;
    readonly logLevel: ILogLevel;
    readonly logger: Logger;
    readonly server: MSMServer;
    constructor(options?: IMockServerConfig);
    middleware(): IMSMMiddleware;
}
