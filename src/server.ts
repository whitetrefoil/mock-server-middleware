import { Middleware } from 'koa'
import * as _ from 'lodash'
import qs, { ParsedUrlQuery } from 'querystring'
import stripJsonComments from 'strip-json-comments'
import * as url from 'url'
import { IParsedServerConfig } from './config'
import { IJsonApiDefinition } from './msm'
import { composeModulePath, convertJsonToHandler, isJsonApiDefinition } from './utils'


export interface IOverride {
  definition: Middleware
  once: boolean
}

export interface IOverrideStore {
  [path: string]: IOverride
}

export interface ICallLog {
  method: string
  href: string
  search: string|null
  query: ParsedUrlQuery|null
  pathname: string
  body: object|null
}

export type IDefinition = string|IJsonApiDefinition|Middleware


export default class MSMServer {
  readonly config: IParsedServerConfig
  readonly overrides: IOverrideStore = {}
  readonly callLogs: ICallLog[]      = []
           isRecording: boolean      = false

  constructor(config: IParsedServerConfig) {
    this.config = config
  }

  logCall(method: string, calledUrl: url.Url, body?: object) {
    if (this.isRecording === false) { return }
    const query = typeof calledUrl.query === 'string' ? qs.parse(calledUrl.query) : calledUrl.query || null
    this.callLogs.push({
      method,
      href    : calledUrl.href || '<unknown url>',
      search  : calledUrl.search || null,
      query,
      pathname: calledUrl.pathname || '<unknown pathname>',
      body    : body || null,
    })
  }

  once(method: string, calledUrl: string, override: IDefinition) {
    const req = { url: calledUrl, method }

    let definition = override

    if (typeof definition === 'string') {
      definition = JSON.parse(stripJsonComments(definition)) as IJsonApiDefinition
    }

    if (isJsonApiDefinition(definition)) {
      definition = convertJsonToHandler(definition)
    }

    this.overrides[composeModulePath(req, this.config)] = {
      definition,
      once: true,
    }
  }

  on(method: string, calledUrl: string, override: IDefinition) {
    const req = { url: calledUrl, method }

    let definition = override

    if (typeof definition === 'string') {
      definition = JSON.parse(stripJsonComments(definition)) as IJsonApiDefinition
    }

    if (isJsonApiDefinition(definition)) {
      definition = convertJsonToHandler(definition)
    }

    this.overrides[composeModulePath(req, this.config)] = {
      definition,
      once: false,
    }
  }

  off(method?: string, calledUrl?: string) {
    if (method != null && calledUrl != null) {
      const req = { url: calledUrl, method }
      delete this.overrides[composeModulePath(req, this.config)]
      return
    }

    if (method == null && calledUrl == null) {
      for (const key in this.overrides) {
        if (this.overrides.hasOwnProperty(key)) { delete this.overrides[key] }
      }
      return
    }

    throw new Error('Params of msm.server.off() should either be both given or be neither given. '
                    + 'But now only one is given.  This usually indicates a problem in code.')
  }

  /**
   * Return a list of all previous requests.
   * @param pathname - Only return requests with pathname **starts** with this.
   *                   Use RegExp starts with ".*" if you want to match in middle.
   * @param method - Filter by request method.
   */
  called(pathname?: string|RegExp, method?: string): ICallLog[] {
    return _.filter(this.callLogs, (log) => {
      if (_.isString(method) && method.toLowerCase() !== log.method) {
        return false
      }
      if (pathname != null && log.pathname.search(pathname) !== 0) {
        return false
      }
      return true
    })
  }

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
    if (this.isRecording === true) {
      throw new Error('MSM is already recording! Check your test code!')
    }
    if (!isLogFlushCheckBypassed && this.callLogs.length > 0) {
      throw new Error('Previous request logs haven\'t been flushed yet!'
                      + '  If you really want to bypass this check, use `msm.server.record(true)`.')
    }
    this.isRecording = true
  }

  /**
   * Stop recording requests but not to flush the logs.
   */
  stopRecording(): void {
    this.isRecording = false
  }

  /**
   * Stop recording & flush all logs of requests.
   */
  flush(): void {
    this.isRecording     = false
    this.callLogs.length = 0
  }
}
