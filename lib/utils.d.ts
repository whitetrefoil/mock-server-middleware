/// <reference types="node" />
/// <reference types="connect" />
import { NextHandleFunction } from 'connect';
import { IncomingMessage } from 'http';
import Logger from './logger';
import { IMockServerConfig, IJsonApiDefinition } from './msm';
import { IOverrideStore } from './server';
export declare function composeModulePath({url, method}: IncomingMessage, config: IMockServerConfig): string;
export declare function convertJsonToHandler(json: IJsonApiDefinition): NextHandleFunction;
/**
 * @param filePath - path to load file, with ".json" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export declare function readJsonDefFromFs(filePath: string, logger: Logger): NextHandleFunction;
/**
 * @param filePath - path to load file, with ".js" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export declare function readJsDefFromFs(filePath: string, logger: Logger): NextHandleFunction;
/**
 * @param modulePath - path to load file, with ".js" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export declare function loadModuleFromFs(modulePath: string, logger: Logger): any;
export declare function loadModuleFromOverrides(modulePath: string, overrides: IOverrideStore, logger: Logger): NextHandleFunction;
export declare function loadModule(modulePath: string, overrides: IOverrideStore, logger: Logger): NextHandleFunction;
