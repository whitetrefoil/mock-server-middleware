import { MockServerConfig, parseConfig } from './config'
import type { MsmMiddleware }            from './interfaces'
import { createLogger }                  from './logger'
import saveDef                           from './recording/save'


export default function createRecorder(config: MockServerConfig = {}): MsmMiddleware {
  const parsedConfig = parseConfig(config)
  const logger = createLogger(parsedConfig.logLevel)
  logger.warn('MSM recorder initialized')
  logger.log(`apiDir: ${parsedConfig.apiDir}`)
  logger.log(`apiPrefixes: ${parsedConfig.apiPrefixes.toString()}`)
  logger.log(`ignoreQueries: ${parsedConfig.ignoreQueries.toString()}`)
  logger.log(`logLevel: ${parsedConfig.logLevel}`)
  logger.log(`lowerCase: ${parsedConfig.lowerCase.toString()}`)
  logger.log(`nonChar: ${parsedConfig.nonChar}`)
  logger.log(`overwriteMode: ${parsedConfig.overwriteMode.toString()}`)
  logger.log(`ping: ${parsedConfig.ping}`)
  logger.log(`saveHeaders: ${parsedConfig.saveHeaders.toString()}`)

  return async(ctx, next) => {
    ctx.set('x-mock-server-middleware', 'recorder')
    void saveDef(ctx, parsedConfig, logger)
    await next()
  }
}
