// region - Imports

import type { NextHandleFunction }                                         from 'connect'
import { IncomingHttpHeaders, IncomingMessage, ServerResponse }            from 'http'
import type { Middleware }                                                 from 'koa'
import parseUrl                                                            from 'parseurl'
import type { IMockServerConfig, IParsedServerConfig }                     from './config'
import Logger, { LogLevel }                                                from './logger'
import MSMServer                                                           from './server'
import { composeModulePath, delay, load404Module, loadModule, saveModule } from './utils'

// endregion

// region - Interfaces

export interface IHttpRequestHeaders {
  [name: string]: string|string[]|undefined
}

export interface IJsonApiDefinition {
  /** HTTP response status code. */
  code?: number
  /** Custom HTTP response headers. */
  headers?: IncomingHttpHeaders
  /** Response body.  Any valid JSON format can be used. */
  body: unknown
}

interface IRequestWithOptionalBody extends IncomingMessage {
  body?: unknown
}

export { IRequestWithOptionalBody as IRequest, ServerResponse as IResponse, NextHandleFunction as INextFn }

// endregion

// region - Main exports

export default class MSM implements IParsedServerConfig {
  readonly apiPrefixes: string[] = ['/api/']
  readonly apiDir: string = 'stubapi'
  readonly nonChar: string = '-'
  readonly logLevel: LogLevel = LogLevel.NONE
  readonly lowerCase: boolean = false
  readonly overwriteMode: boolean = false
  readonly saveHeaders: string[] = []
  readonly ping: number = 0
  readonly logger: Logger
  readonly server: MSMServer

  constructor(options?: IMockServerConfig) {
    if (options != null) {
      if (options.apiPrefixes != null) {
        this.apiPrefixes = options.apiPrefixes
      }
      if (typeof options.apiDir === 'string') {
        this.apiDir = options.apiDir
      }
      if (typeof options.nonChar === 'string') {
        this.nonChar = options.nonChar
      }
      if (options.logLevel != null && options.logLevel in LogLevel) {
        this.logLevel = options.logLevel
      }
      if (options.lowerCase === true) {
        this.lowerCase = options.lowerCase
      }
      if (options.overwriteMode === true) {
        this.overwriteMode = options.overwriteMode
      }
      if (options.saveHeaders?.length != null) {
        this.saveHeaders = options.saveHeaders
      }
      if (Number.isFinite(options.ping as number)) {
        this.ping = options.ping as number
      }
    }
    this.logger = new Logger(this.logLevel)
    this.server = new MSMServer(this)
    this.logger.warn('MSM initialized')
  }

  middleware(): Middleware {
    this.logger.warn('MSM middleware initialized with:')
    this.logger.log(`apiPrefixes: ${this.apiPrefixes.toString()}`)
    this.logger.log(`apiDir: ${this.apiDir}`)
    this.logger.log(`nonChar: ${this.nonChar}`)
    this.logger.log(`logLevel: ${this.logLevel}`)
    this.logger.log(`lowerCase: ${this.lowerCase.toString()}`)
    this.logger.log(`overwriteMode: ${this.overwriteMode.toString()}`)
    this.logger.log(`saveHeaders: ${this.saveHeaders.toString()}`)
    this.logger.log(`ping: ${this.ping}`)

    return async(ctx, next) => {

      const { method, url } = ctx.request
      const parsedUrl = parseUrl({ url } as IncomingMessage)
      if (parsedUrl == null) {
        this.logger.error('cannot parse the requested URL')
        return
      }

      if (this.apiPrefixes.every(prefix => !url.startsWith(prefix))) {
        this.logger.debug(`NOT HIT: ${method} ${url}`)
        return
      }

      this.logger.info(`${method} ${url}`)

      this.server.logCall(
        method.toLocaleLowerCase(),
        parsedUrl,
        ctx.request.body != null ? ctx.body : void 0,
      )

      const handler = loadModule(composeModulePath(ctx.request, this, true), this.server.overrides, this.logger)
                      ?? loadModule(composeModulePath(ctx.request, this), this.server.overrides, this.logger)
                      ?? load404Module()

      await delay(this.ping)

      await handler(ctx, next)

      ctx.set('x-mock-server-middleware', 'stubapi')
    }
  }

  recorder(): Middleware {
    this.logger.warn('MSM recorder initialized with:')
    this.logger.log(`apiPrefixes: ${this.apiPrefixes.toString()}`)
    this.logger.log(`apiDir: ${this.apiDir}`)
    this.logger.log(`nonChar: ${this.nonChar}`)
    this.logger.log(`lowerCase: ${this.lowerCase.toString()}`)
    this.logger.log(`overwriteMode: ${this.overwriteMode.toString()}`)
    this.logger.log(`logLevel: ${this.logLevel}`)

    return async(ctx, next) => {

      const { method, url } = ctx.request

      await next()

      if (this.apiPrefixes.every(prefix => !url.startsWith(prefix))) {
        this.logger.debug(`NOT HIT: ${method} ${url}`)
        return
      }

      ctx.set('x-mock-server-middleware', 'recorder')
      await saveModule(ctx, this, this.logger)
    }
  }
}

// endregion
