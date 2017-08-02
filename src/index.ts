// region Imports

import { green, yellow, red }              from 'chalk'
import { NextHandleFunction }              from 'connect'
import { IncomingMessage, ServerResponse } from 'http'
import Logger, { ILogLevel, setLogLevel }  from './logger'
import every                             = require('lodash/every')
import filter                            = require('lodash/filter')
import forEach                           = require('lodash/forEach')
import isFunction                        = require('lodash/isFunction')
import isString                          = require('lodash/isString')
import path                              = require('path')
import url                               = require('url')
const requireNew                         = require('require-uncached')

// endregion

// region Constants

const HTTP_NOT_FOUND             = 404
const HTTP_INTERNAL_SERVER_ERROR = 500

// endregion

// region Interfaces

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

export interface IOverride {
  definition: any
  once: boolean
}

interface IOverrideStore {
  [path: string]: IOverride
}

// endregion

// region Variables / constants initialize

const overrides: IOverrideStore = {}

const config: IMockServerConfig = {
  apiPrefixes  : ['/api/'],
  apiDir       : 'stubapi',
  nonChar      : '-',
  lowerCase    : true,
  ping         : 0,
  preserveQuery: false,
  logLevel     : 'NONE',
}

// endregion

// region Helper functions

export function composeModulePath({ url, method }: IncomingMessage): string {
  let modulePath = url

  if (config.preserveQuery !== true) { modulePath = modulePath.split('?')[0] }
  if (config.lowerCase) { modulePath = modulePath.toLowerCase() }
  modulePath = modulePath.replace(/[^\d\w/]/g, config.nonChar)

  const fullModulePath = path.join(
    process.cwd(),
    config.apiDir,
    method.toLowerCase(),
    modulePath,
  )

  return fullModulePath
}

export function convertJsonToHandler(json: IJsonApiDefinition): NextHandleFunction {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    res.statusCode = json.code || 200
    forEach(json.headers, (val, name) => {
      res.setHeader(name, val)
    })
    res.end(JSON.stringify(json.body, null, 2))
  }
}

export function loadModule(modulePath: string): NextHandleFunction {
  try {
    let handler
    if (overrides[modulePath] != null) {
      handler = overrides[modulePath].definition
      if (overrides[modulePath].once) { delete overrides[modulePath] }
      Logger.log(green('Using Manual Override: ') + modulePath)
    } else {
      handler = requireNew(modulePath)
      Logger.log(green('Using API definition: ') + modulePath)
    }
    if (isFunction(handler)) { return handler }
    return convertJsonToHandler(handler)
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      Logger.warn(yellow('StubAPI not found: ') + modulePath)
      return convertJsonToHandler({ code: HTTP_NOT_FOUND, body: e })
    }
    Logger.error(red('Errors in StubAPI: ') + modulePath)
    Logger.error(e)
    return convertJsonToHandler({ code: HTTP_INTERNAL_SERVER_ERROR, body: e })
  }
}

// endregion

// region Call logging (for testing)

interface IRequestWithOptionalBody extends IncomingMessage {
  body?: object
}

export interface ICallLog {
  method: string
  body?: object
  href?: string
  search?: string
  query?: object
  pathname?: string
}

let callLog: ICallLog[]  = []
let isRecording: boolean = false

// endregion

// region Main exports

export function initialize(options: IMockServerConfig): void {
  Object.assign(config, options)
  setLogLevel(config.logLevel)
}

export const middleware: NextHandleFunction = (req: IRequestWithOptionalBody, res, next) => {
  if (every(config.apiPrefixes, (prefix) => req.url.indexOf(prefix) !== 0)) {
    next()
    return
  }

  if (isRecording === true) {
    const log: ICallLog = {
      method: req.method.toLowerCase(),
    }

    if (req.body != null) {
      log.body = req.body
    }

    Object.assign(log, url.parse(req.url, true))

    callLog.push(log)
  }

  const modulePath = composeModulePath(req)
  const handler    = loadModule(modulePath)

  setTimeout(() => {
    handler(req, res, next)
  }, config.ping)
}

export const server = {
  once(method: string, url: string, definition: any) {
    const req = { url, method } as IncomingMessage

    overrides[composeModulePath(req)] = {
      definition,
      once: true,
    }
  },

  on(method: string, url: string, definition: any) {
    const req = { url, method } as IncomingMessage

    overrides[composeModulePath(req)] = {
      definition,
      once: false,
    }
  },

  off(method?: string, url?: string) {
    if (method != null && url != null) {
      const req = { url, method } as IncomingMessage
      delete overrides[composeModulePath(req)]
      return
    }

    if (method == null && url == null) {
      for (const key in overrides) {
        if (overrides.hasOwnProperty(key)) { delete overrides[key] }
      }
      return
    }

    throw new Error('Params of msm.server.off() should either be both given or be neither given. '
      + 'But now only one is given.  This usually indicates a problem in code.')
  },

  /**
   * Return a list of all previous requests.
   * @param pathname - Only return requests with pathname **starts** with this.
   *                   Use RegExp if you want to match in middle.
   * @param method - Filter by request method.
   */
    called(pathname?: string | RegExp, method?: string): ICallLog[] {
    return filter(callLog, (log) => {
      if (isString(method) && method.toLowerCase() !== log.method) {
        return false
      }
      if (pathname != null && log.pathname.search(pathname as any) !== 0) {
        return false
      }
      return true
    })
  },

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
    record(isLogFlushCheckBypassed: boolean = false): void {
    if (isRecording === true) {
      throw new Error('MSM is already recording! Check your test code!')
    }
    if (!isLogFlushCheckBypassed && callLog.length > 0) {
      throw new Error('Previous request logs haven\'t been flushed yet!'
        + '  If you really want to bypass this check, use `msm.server.record(true)`.')
    }
    isRecording = true
  },

  /**
   * Stop recording requests but not to flush the logs.
   */
    stopRecording(): void {
    isRecording = false
  },

  /**
   * Stop recording & flush all logs of requests.
   */
    flush(): void {
    isRecording = false
    callLog     = []
  },
}

export { Logger }
// endregion