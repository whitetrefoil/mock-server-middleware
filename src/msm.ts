// region - Imports

import { NextHandleFunction } from 'connect'
import { IncomingMessage, ServerResponse } from 'http'
import * as _ from 'lodash'
import * as url from 'url'
import Logger, { ILogLevel } from './logger'
import MSMServer from './server'
import { composeModulePath, loadModule } from './utils'

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
  /** Replace `/[^\w\d-]/g` to this when looking for API definition files. */
  nonChar?: string
  /** Whether to unify all cases to lower case. */
  lowerCase?: boolean
  /** Delay before response, in ms. */
  ping?: number
  /** Do not strip query in URL (instead replace '?' with nonChar). */
  preserveQuery?: boolean
  /**
   * Log level. 'INFO' & 'LOG' is the same. Default is 'NONE'.
   */
  logLevel?: ILogLevel
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

export default class MSM implements IMockServerConfig {
  readonly apiPrefixes: string[] = ['/api/']
  readonly apiDir: string = 'stubapi'
  readonly nonChar: string = '-'
  readonly lowerCase: boolean = false
  readonly ping: number = 0
  readonly preserveQuery: boolean = false
  readonly logLevel: ILogLevel = 'NONE'
  readonly logger: Logger = null
  readonly server: MSMServer = null

  constructor(options?: IMockServerConfig) {
    if (options != null) {
      if (!_.isEmpty(options.apiPrefixes)) { this.apiPrefixes = options.apiPrefixes }
      if (_.isString(options.apiDir)) { this.apiDir = options.apiDir }
      if (_.isString(options.nonChar)) { this.nonChar = options.nonChar }
      if (_.isBoolean(options.lowerCase)) { this.lowerCase = options.lowerCase }
      if (_.isFinite(options.ping)) { this.ping = options.ping }
      if (_.isBoolean(options.preserveQuery)) { this.preserveQuery = options.preserveQuery }
      if (_.isString(options.logLevel)) { this.logLevel = options.logLevel }
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
      if (_.every(this.apiPrefixes, (prefix) => req.url.indexOf(prefix) !== 0)) {
        this.logger.debug(`NOT HIT: ${req.method} ${req.url}`)
        next()
        return
      }

      this.logger.info(`${req.method} ${req.url}`)

      this.server.logCall(
        req.method.toLocaleLowerCase(),
        url.parse(req.url, true),
        req.body != null ? req.body : void 0,
      )

      const modulePath = composeModulePath(req, this)
      const handler = loadModule(modulePath, this.server.overrides, this.logger)

      setTimeout(() => {
        handler(req, res, next)
      }, this.ping)
    }
  }
}
// endregion
