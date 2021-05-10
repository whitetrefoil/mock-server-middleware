import parseurl from 'parseurl'
import type { MockServerConfig, ParsedServerConfig } from './config'
import { logConfig, parseConfig } from './config'
import { loadDef } from './definition'
import load404Def from './definition/load-404'
import type { Logger, MsmMiddleware } from './interfaces'
import { createLogger } from './logger'
import { composeModulePath, delay } from './utils'


async function tryLoadModule(
  {
    method,
    path,
    pathname,
    search,
  }: {
    method: string
    path: string
    pathname: string
    search: string|null
  },
  {
    apiDir,
    fallbackToNoQuery,
    ignoreQueries,
    lowerCase,
    nonChar,
  }: ParsedServerConfig,
  logger: Logger,
): Promise<MsmMiddleware> {
  const modulePath = composeModulePath({
    method,
    pathname,
    search,
    lowerCase,
    nonChar,
    apiDir,
    ignoreQueries,
  })

  const handler = await loadDef(modulePath, logger)

  if (handler != null) {
    return handler
  }

  if (fallbackToNoQuery !== true) {
    logger.warn(`StubAPI not found for: "${modulePath.toString()}"`)
    return load404Def()
  }

  const fallbackModulePath = composeModulePath({
    method,
    pathname,
    search,
    lowerCase,
    nonChar,
    apiDir,
    ignoreQueries: true,
  })

  const fallbackHandler = await loadDef(fallbackModulePath, logger)
  if (fallbackHandler != null) {
    return fallbackHandler
  }

  logger.warn(`StubAPI not found for: "${modulePath.toString()}"`)
  return load404Def()
}


export default function createMockServer(config: MockServerConfig = {}): MsmMiddleware {
  const cfg = parseConfig(config)
  const logger = createLogger(cfg.logLevel)
  logger.warn('MSM middleware initialized')
  logConfig(cfg, logger)

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

    if (cfg.apiPrefixes.every(prefix => !pathname.startsWith(prefix))) {
      logger.debug(`NOT HIT: ${method} ${path}`)
      return
    }

    logger.info(`${method} ${path}`)
    ctx.set('x-mock-server-middleware', 'stubapi')

    const delayPromise = delay(cfg.ping)

    const handler = await tryLoadModule({ method, path, pathname, search }, cfg, logger)
    await delayPromise
    await handler(ctx, next)
  }
}
