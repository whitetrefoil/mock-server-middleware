import { IncomingMessage } from 'http'
import * as _ from 'lodash'
import * as url from 'url'
import { IMockServerConfig } from './msm'
import { composeModulePath } from './utils'

export interface IOverride {
  definition: any
  once: boolean
}

export interface IOverrideStore {
  [path: string]: IOverride
}

export interface ICallLog {
  method: string
  href: string
  search: string
  query: object
  pathname: string
  body?: object
}

export default class MSMServer {
  readonly config: IMockServerConfig
  readonly overrides: IOverrideStore = {}
  readonly callLogs: ICallLog[] = []
  isRecording: boolean = false

  constructor(config: IMockServerConfig) {
    this.config = config
  }

  logCall(method: string, calledUrl: url.Url, body?: object) {
    if (this.isRecording === false) { return }
    this.callLogs.push({
      method,
      href: calledUrl.href,
      search: calledUrl.search,
      query: calledUrl.query,
      pathname: calledUrl.pathname,
      body,
    })
  }

  once(method: string, calledUrl: string, definition: any) {
    const req: IncomingMessage = { url: calledUrl, method } as any

    this.overrides[composeModulePath(req, this.config)] = {
      definition,
      once: true,
    }
  }

  on(method: string, calledUrl: string, definition: any) {
    const req: IncomingMessage = { url: calledUrl, method } as any

    this.overrides[composeModulePath(req, this.config)] = {
      definition,
      once: false,
    }
  }

  off(method?: string, calledUrl?: string) {
    if (method != null && calledUrl != null) {
      const req: IncomingMessage = { url: calledUrl, method } as any
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
   *                   Use RegExp if you want to match in middle.
   * @param method - Filter by request method.
   */
  called(pathname?: string|RegExp, method?: string): ICallLog[] {
    return _.filter(this.callLogs, (log) => {
      if (_.isString(method) && method.toLowerCase() !== log.method) {
        return false
      }
      if (pathname != null && log.pathname.search(pathname as any) !== 0) {
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
    this.isRecording = false
    this.callLogs.length = 0
  }
}
