/// <reference types="node" />
/// <reference types="connect" />
import { NextHandleFunction } from 'connect';
import { IncomingMessage } from 'http';
import Logger from './logger';
import { IMockServerConfig, IJsonApiDefinition } from './msm';
import { IOverrideStore } from './server';
export declare function composeModulePath({url, method}: IncomingMessage, config: IMockServerConfig): string;
export declare function convertJsonToHandler(json: IJsonApiDefinition): NextHandleFunction;
export declare function loadModule(modulePath: string, overrides: IOverrideStore, logger: Logger): NextHandleFunction;
