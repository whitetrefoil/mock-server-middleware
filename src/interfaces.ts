import type { IncomingHttpHeaders } from 'http'
import type { DefaultContext, DefaultState, Middleware, ParameterizedContext } from 'koa'


export type PrintFn = (message: string) => void

export interface Logger {
  debug: PrintFn
  info: PrintFn
  log: PrintFn
  warn: PrintFn
  error: PrintFn
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MsmContext extends DefaultContext {
  // Nothing yet
}

export type MsmParameterizedContext = ParameterizedContext<DefaultState, MsmContext>

export type MsmMiddleware = Middleware<DefaultState, MsmContext>

export interface JsonApiDefinition {
  /** HTTP response status code. */
  code?: number
  /** Custom HTTP response headers. */
  headers?: IncomingHttpHeaders
  /** Response body.  Any valid JSON format can be used. */
  body: unknown
}
