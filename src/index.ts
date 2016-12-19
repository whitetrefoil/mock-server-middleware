// region Imports

import { green, yellow, red }              from 'chalk'
import { NextHandleFunction }              from 'connect'
import { IncomingMessage, ServerResponse } from 'http'
import every                             = require('lodash/every')
import forEach                           = require('lodash/forEach')
import isFunction                        = require('lodash/isFunction')
import path                              = require('path')
const requireNew                         = require('require-uncached')

// endregion

// region Constants

const HTTP_NOT_FOUND             = 404
const HTTP_INTERNAL_SERVER_ERROR = 500

// endregion

// region Interfaces

export interface IMockServerConfig {
  /**
   * If a request path starts like one of below,
   * it will be handled by the mock server,
   * otherwise it will call `next()` to pass the request to the next middleware.
   */
  apiPrefixes?: string[]
  /** Where the API definition files locate.  Related to PWD. */
  apiDir?: string
  /** Replace /[^\w\d]/g to this when looking for API definition files. */
  nonChar?: string
  /** Unify all cases to lower case */
  lowerCase?: boolean
  /** Delay before response, in ms */
  ping?: number
  /** Do not strip query in URL (instead replace '?' with nonChar). */
  preserveQuery?: boolean
}

export interface IJsonApiDefinition {
  /** HTTP response status code */
  code?: number
  /** Custom HTTP response headers */
  headers?: Object
  /**  */
  body: Object | Object[] | string | string[]
}

export interface IException {
  definition: any
  once: boolean
}
export interface IExceptionStore {
  [path: string]: IException
}

// endregion

// region Variables / constants initialize

const overrides: IExceptionStore = {}

const config: IMockServerConfig = {
  apiPrefixes  : ['/api/'],
  apiDir       : 'stubapi',
  nonChar      : '-',
  lowerCase    : true,
  ping         : 0,
  preserveQuery: false,
}

// endregion

// region Helper functions

function log(message: any, ...optionalParams: any[]): void {
  if (process.env.NODE_ENV === 'test') { return }
  // tslint:disable-next-line:no-console
  console.log(message, ...optionalParams)
}

export function initialize(options: IMockServerConfig): void {
  Object.assign(config, options)
}

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
  return (req: IncomingMessage, res: ServerResponse, next: Function) => {
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
      log(green('Using Manual Override: ') + modulePath)
    } else {
      handler = requireNew(modulePath)
      log(green('Using API definition: ') + modulePath)
    }
    if (isFunction(handler)) { return handler }
    return convertJsonToHandler(handler)
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      log(yellow('StubAPI not found: ') + modulePath)
      return convertJsonToHandler({ code: HTTP_NOT_FOUND, body: e })
    }
    log(red('Errors in StubAPI: ') + modulePath)
    log(e)
    return convertJsonToHandler({ code: HTTP_INTERNAL_SERVER_ERROR, body: e })
  }
}

// endregion

// region Main exports

export const middleware: NextHandleFunction = function(req, res, next): void {
  if (every(config.apiPrefixes, (prefix) => req.url.indexOf(prefix) !== 0)) {
    next()
    return
  }
  const modulePath = composeModulePath(req)
  const handler = loadModule(modulePath)

  setTimeout(() => {
    handler(req, res, next)
  }, config.ping)
}

export const server = {
  once(method: string, url: string, definition: any) {
    const req = <IncomingMessage> { url, method }
    overrides[composeModulePath(req)] = {
      definition,
      once: true,
    }
  },

  on(method: string, url: string, definition: any) {
    const req = <IncomingMessage> { url, method }
    overrides[composeModulePath(req)] = {
      definition,
      once: false,
    }
  },

  off(method?: string, url?: string) {
    if (method != null && url != null) {
      const req = <IncomingMessage> { url, method }
      delete overrides[composeModulePath(req)]
      return
    }
    for (const key in overrides) {
      if (overrides.hasOwnProperty(key)) { delete overrides[key] }
    }
  },
}
// endregion
