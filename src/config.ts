import type { Logger }   from './interfaces'
import { LogLevel }      from './logger'
import { isStringArray } from './utils'


export interface MockServerConfig {
  /** Where the API definition files locate.  Related to PWD. */
  apiDir?: string

  /**
   * If a request path starts like one of this,
   * it will be handled by the mock server,
   * otherwise it will call `next()` to pass the request to the next middleware.
   */
  apiPrefixes?: string[]

  /**
   * If true (and "ignoreQueries" is not `true`),
   * when failed to load definition from default location,
   * MSM will do another attempt w/ `"ignoreQueries": true`.
   *
   * Default to `false`.
   */
  fallbackToNoQuery?: boolean

  /**
   * Ignore certain search queries when looking up for definitions & recording.
   * Set to `false` to preserve every search queries.
   * Set to `true` to ignore all.
   *
   * Default to `true`.
   */
  ignoreQueries?: string[]|boolean

  /**
   * Log level. 'INFO' & 'LOG' is the same.
   *
   *  Default is 'NONE'.
   */
  logLevel?: LogLevel

  /** Whether to unify all cases to lower case. */
  lowerCase?: boolean

  /** Replace `/[^\w\d-]/g` to this when looking for API definition files. */
  nonChar?: string

  /**
   * Whether to overwrite existing definition file.
   * Only take effect when using "recorder" middleware.
   */
  overwriteMode?: boolean

  /** Delay before response, in ms. */
  ping?: number

  /**
   * Specific some headers to save in "recorder" mode.
   */
  saveHeaders?: string[]
}

export type ParsedServerConfig = Required<MockServerConfig>


export function parseConfig(config: MockServerConfig): ParsedServerConfig {
  return {
    apiDir           : typeof config.apiDir === 'string' ? config.apiDir : 'stubapi',
    apiPrefixes      : isStringArray(config.apiPrefixes) ? config.apiPrefixes : ['/api/'],
    fallbackToNoQuery: config.fallbackToNoQuery ?? false,
    ignoreQueries    : isStringArray(config.ignoreQueries) || typeof config.ignoreQueries === 'boolean' ? config.ignoreQueries : true,
    logLevel         : config.logLevel ?? LogLevel.NONE,
    lowerCase        : config.lowerCase ?? false,
    nonChar          : config.nonChar ?? '-',
    overwriteMode    : config.overwriteMode ?? false,
    ping             : config.ping ?? 0,
    saveHeaders      : isStringArray(config.saveHeaders) ? config.saveHeaders : [],
  }
}


export function logConfig(config: ParsedServerConfig, logger: Logger) {
  logger.log(`ignoreQueries: ${config.ignoreQueries.toString()}`)
  logger.log(`apiDir: ${config.apiDir}`)
  logger.log(`apiPrefixes: ${config.apiPrefixes.toString()}`)
  logger.log(`logLevel: ${config.logLevel}`)
  logger.log(`lowerCase: ${config.lowerCase.toString()}`)
  logger.log(`nonChar: ${config.nonChar}`)
  logger.log(`overwriteMode: ${config.overwriteMode.toString()}`)
  logger.log(`ping: ${config.ping}`)
  logger.log(`saveHeaders: ${config.saveHeaders.toString()}`)
}
