import fs from 'fs-extra'
import parseurl from 'parseurl'
import type { ParsedServerConfig } from '../config'
import { loadDef } from '../definition'
import type { JsonApiDefinition, Logger, MsmParameterizedContext } from '../interfaces'
import { createLogger, LogLevel } from '../logger'
import { composeModulePath } from '../utils'
import parseBody from './parse-body'


export default async function saveDef(
  ctx: MsmParameterizedContext,
  config: ParsedServerConfig,
  logger: Logger,
) {
  const { method } = ctx.request
  const { status } = ctx.response
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

  if (config.apiPrefixes.every(prefix => !pathname.startsWith(prefix))) {
    logger.debug(`NOT HIT: ${method} ${path}`)
    return
  }

  logger.info(`${method} ${path}`)
  const modulePath = composeModulePath({
    method,
    pathname,
    search,
    lowerCase    : config.lowerCase,
    nonChar      : config.nonChar,
    apiDir       : config.apiDir,
    ignoreQueries: config.ignoreQueries,
  })

  const silentLogger = createLogger(LogLevel.NONE)
  const existed = loadDef(modulePath, silentLogger)

  if (existed != null) {
    logger.info('Definition exists...')
    return
  }

  if (status === 404) {
    logger.warn('Response status 404, skipping...')
    return
  }

  logger.warn(`No definition file found, saving to :${modulePath}.json`)

  logger.info(`Method: ${method}`)
  logger.info(`URL: ${path}`)
  logger.debug(`Headers: ${JSON.stringify(ctx.headers, null, 2)}`)

  const parsedBody = await parseBody(ctx, logger)

  const parsedHeaders = config.saveHeaders.reduce((prev, curr) => {
    const value = ctx.get(curr)
    if (value == null) {
      return prev
    }
    return { ...prev, [curr]: value }
  }, {})

  const jsonToWrite: JsonApiDefinition = {
    code   : status,
    headers: parsedHeaders,
    body   : parsedBody,
  }

  await fs.ensureFile(`${modulePath}.json`)
  fs.writeFile(`${modulePath}.json`, JSON.stringify(jsonToWrite, null, 2), 'utf8', err => {
    if (err != null) {
      logger.error(`Failed to save definition file: ${modulePath}.json`)
      logger.debug(err.stack ?? err.message)
    } else {
      logger.info(`Definition file "${modulePath}.json" saved!`)
    }
  })
}
