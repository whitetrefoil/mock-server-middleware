// region - Imports

import { NextHandleFunction } from 'connect'
import { IncomingMessage, ServerResponse } from 'http'
import * as _ from 'lodash'
import * as url from 'url'
import Logger, { LogLevel } from './logger'
import MSMServer from './server'
import { composeModulePath, ensureMethod, ensureUrl, loadModule } from './utils'

// endregion

// region - Interfaces

export interface IMockServerConfig {
  /**
   * If a request path starts like one of this,
   * it will be handled by the mock server,
   * otherwise it will call `next()` to pass the request to the next middleware.
   */
  apiPrefixes?: string[]
  /** Where the API definition files locate.  Related to PWD. */
  apiDir?: string
  /** Whether to unify all cases to lower case. */
  lowerCase?: boolean
  /** Replace `/[^\w\d-]/g` to this when looking for API definition files. */
  nonChar?: string
  /** Delay before response, in ms. */
  ping?: number
  /** Do not strip query in URL (instead replace '?' with nonChar). */
  preserveQuery?: boolean
  /**
   * Log level. 'INFO' & 'LOG' is the same. Default is 'NONE'.
   */
  logLevel?: LogLevel
}

export interface IJsonApiDefinition {
  /** HTTP response status code. */
  code?: number
  /** Custom HTTP response headers. */
  headers?: object
  /** Response body.  Any valid JSON format can be used. */
  body: any
}

interface IRequestWithOptionalBody extends IncomingMessage {
  body?: any
}

export { IRequestWithOptionalBody as IRequest, ServerResponse as IResponse, NextHandleFunction as INextFn }

export type IMSMMiddleware
  = (request: IRequestWithOptionalBody, response: ServerResponse, next: () => any) => void

// endregion

// region - Main exports

export default class MSM implements Required<IMockServerConfig> {
  readonly apiPrefixes: string[]  = ['/api/']
  readonly apiDir: string         = 'stubapi'
  readonly nonChar: string        = '-'
  readonly lowerCase: boolean     = false
  readonly ping: number           = 0
  readonly preserveQuery: boolean = false
  readonly logLevel: LogLevel     = LogLevel.NONE
  readonly logger: Logger
  readonly server: MSMServer

  constructor(options?: IMockServerConfig) {
    if (options != null) {
      if (!_.isEmpty(options.apiPrefixes)) {
        this.apiPrefixes = options.apiPrefixes as string[]
      }
      if (_.isString(options.apiDir)) {
        this.apiDir = options.apiDir
      }
      if (_.isString(options.nonChar)) {
        this.nonChar = options.nonChar
      }
      if (_.isBoolean(options.lowerCase)) {
        this.lowerCase = options.lowerCase
      }
      if (_.isFinite(options.ping)) {
        this.ping = options.ping as number
      }
      if (_.isBoolean(options.preserveQuery)) {
        this.preserveQuery = options.preserveQuery
      }
      if (options.logLevel != null && options.logLevel in LogLevel) {
        this.logLevel = options.logLevel
      }
    }
    this.logger = new Logger(this.logLevel)
    this.server = new MSMServer(this)
    this.logger.warn('MSM initialized')
    this.logger.log(`apiPrefixes: ${this.apiPrefixes}`)
    this.logger.log(`apiDir: ${this.apiDir}`)
    this.logger.log(`nonChar: ${this.nonChar}`)
    this.logger.log(`lowerCase: ${this.lowerCase}`)
    this.logger.log(`ping: ${this.ping}`)
    this.logger.log(`preserveQuery: ${this.preserveQuery}`)
    this.logger.log(`logLevel: ${this.logLevel}`)
  }

  middleware(): IMSMMiddleware {
    return (req: IRequestWithOptionalBody, res: ServerResponse, next: () => any) => {
      const ensuredReq = ensureMethod(ensureUrl(req))

      if (_.every(this.apiPrefixes, (prefix) =>
        ensuredReq.url.indexOf(prefix) !== 0,
      )) {
        this.logger.debug(`NOT HIT: ${req.method} ${req.url}`)
        next()
        return
      }

      const method = req.method

      this.logger.info(`${req.method} ${req.url}`)

      this.server.logCall(
        ensuredReq.method.toLocaleLowerCase(),
        url.parse(ensureUrl(req).url, true),
        req.body != null ? req.body : void 0,
      )

      const modulePath = composeModulePath(ensuredReq, this)
      const handler    = loadModule(modulePath, this.server.overrides, this.logger)

      setTimeout(() => {
        handler(req, res, next)
      }, this.ping)
    }
  }
}

// endregion
