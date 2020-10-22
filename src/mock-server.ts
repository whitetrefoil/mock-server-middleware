import parseurl                          from 'parseurl'
import { MockServerConfig, parseConfig } from './config'
import { loadDef }                       from './definition'
import load404Def                        from './definition/load-404'
import type { MsmMiddleware }            from './interfaces'
import { createLogger }                  from './logger'
import { composeModulePath, delay }      from './utils'


export default function createMockServer(config: MockServerConfig = {}): MsmMiddleware {
  const {
    apiDir,
    apiPrefixes,
    logLevel,
    lowerCase,
    nonChar,
    overwriteMode,
    ping,
    ignoreQueries,
    saveHeaders,
  } = parseConfig(config)
  const logger = createLogger(logLevel)
  logger.warn('MSM middleware initialized')
  logger.log(`ignoreQueries: ${ignoreQueries.toString()}`)
  logger.log(`apiDir: ${apiDir}`)
  logger.log(`apiPrefixes: ${apiPrefixes.toString()}`)
  logger.log(`logLevel: ${logLevel}`)
  logger.log(`lowerCase: ${lowerCase.toString()}`)
  logger.log(`nonChar: ${nonChar}`)
  logger.log(`overwriteMode: ${overwriteMode.toString()}`)
  logger.log(`ping: ${ping}`)
  logger.log(`saveHeaders: ${saveHeaders.toString()}`)

  return async(ctx, next) => {
    const { method } = ctx.request
    const parsedUrl = parseurl(ctx.req)
    if (parsedUrl == null) {
      logger.error('cannot parse the requested URL')
      return
    }

    const { path, pathname, search } = parsedUrl
    if (path == null || pathname == null) {
      logger.error('cannot parse the requested URL')
      return
    }

    if (apiPrefixes.every(prefix => !pathname.startsWith(prefix))) {
      logger.debug(`NOT HIT: ${method} ${path}`)
      return
    }

    logger.info(`${method} ${path}`)
    ctx.set('x-mock-server-middleware', 'stubapi')

    const modulePath = composeModulePath({
      method,
      pathname,
      search,
      lowerCase,
      nonChar,
      apiDir,
      ignoreQueries,
    })

    const handler = loadDef(modulePath, logger) ?? load404Def()

    await delay(ping)
    await handler(ctx, next)
  }
}
