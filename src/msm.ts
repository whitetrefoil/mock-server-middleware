// region - Imports

// tslint:disable-next-line:no-implicit-dependencies
import { NextHandleFunction }                                              from 'connect';
import { IncomingHttpHeaders, IncomingMessage, ServerResponse }            from 'http';
// tslint:disable-next-line:no-implicit-dependencies
import { Middleware }                                                      from 'koa';
import * as _                                                              from 'lodash';
import { parse as parseUrl }                                               from 'url';
import { IMockServerConfig, IParsedServerConfig, setOptions }              from './config';
import Logger, { LogLevel }                                                from './logger';
import MSMServer                                                           from './server';
import { composeModulePath, delay, load404Module, loadModule, saveModule } from './utils';

// endregion

// region - Interfaces

export interface IHttpRequestHeaders {
  [name: string]: string|string[]|undefined;
}

export interface IJsonApiDefinition {
  /** HTTP response status code. */
  code?: number;
  /** Custom HTTP response headers. */
  headers?: IncomingHttpHeaders;
  /** Response body.  Any valid JSON format can be used. */
  body: any;
}

interface IRequestWithOptionalBody extends IncomingMessage {
  body?: any;
}

export { IRequestWithOptionalBody as IRequest, ServerResponse as IResponse, NextHandleFunction as INextFn };

// endregion

// region - Main exports

export default class MSM implements IParsedServerConfig {
  readonly apiPrefixes: string[] = ['/api/'];
  readonly apiDir: string = 'stubapi';
  readonly nonChar: string = '-';
  readonly logLevel: LogLevel = LogLevel.NONE;
  readonly lowerCase: boolean = false;
  readonly overwriteMode: boolean = false;
  readonly saveHeaders: string[] = [];
  readonly ping: number = 0;
  readonly logger: Logger;
  readonly server: MSMServer;

  constructor(options?: IMockServerConfig) {
    setOptions(this, options);
    this.logger = new Logger(this.logLevel);
    this.server = new MSMServer(this);
    this.logger.warn('MSM initialized');
  }

  middleware(): Middleware {
    this.logger.warn('MSM middleware initialized with:');
    this.logger.log(`apiPrefixes: ${this.apiPrefixes}`);
    this.logger.log(`apiDir: ${this.apiDir}`);
    this.logger.log(`nonChar: ${this.nonChar}`);
    this.logger.log(`logLevel: ${this.logLevel}`);
    this.logger.log(`lowerCase: ${this.lowerCase}`);
    this.logger.log(`overwriteMode: ${this.overwriteMode}`);
    this.logger.log(`saveHeaders: ${this.saveHeaders}`);
    this.logger.log(`ping: ${this.ping}`);

    return async(ctx, next) => {

      const { method, url } = ctx.request;

      if (_.every(this.apiPrefixes, prefix =>
        url.indexOf(prefix) !== 0,
      )) {
        this.logger.debug(`NOT HIT: ${method} ${url}`);
        return;
      }

      this.logger.info(`${method} ${url}`);

      this.server.logCall(
        method.toLocaleLowerCase(),
        parseUrl(url, true),
        ctx.request.body != null ? ctx.body : void 0,
      );

      const handler = loadModule(composeModulePath(ctx.request, this, true), this.server.overrides, this.logger)
                      || loadModule(composeModulePath(ctx.request, this), this.server.overrides, this.logger)
                      || load404Module();

      await delay(this.ping);

      await handler(ctx, next);

      ctx.set('x-mock-server-middleware', 'stubapi');
    };
  }

  recorder(): Middleware {
    this.logger.warn('MSM recorder initialized with:');
    this.logger.log(`apiPrefixes: ${this.apiPrefixes}`);
    this.logger.log(`apiDir: ${this.apiDir}`);
    this.logger.log(`nonChar: ${this.nonChar}`);
    this.logger.log(`lowerCase: ${this.lowerCase}`);
    this.logger.log(`overwriteMode: ${this.overwriteMode}`);
    this.logger.log(`logLevel: ${this.logLevel}`);

    return async(ctx, next) => {

      const { method, url } = ctx.request;

      await next();

      if (_.every(this.apiPrefixes, prefix =>
        url.indexOf(prefix) !== 0,
      )) {
        this.logger.debug(`NOT HIT: ${method} ${url}`);
        return;
      }

      ctx.set('x-mock-server-middleware', 'recorder');
      await saveModule(ctx, this, this.logger);
    };
  }
}

// endregion
