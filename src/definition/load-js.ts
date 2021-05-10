import clearModule from 'clear-module'
import type { Middleware } from 'koa'
import path from 'path'
import type { Logger } from '../interfaces'
import { importFreshJsModule } from '../utils.js'


/**
 * @param filePath - path to load file
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export default async function loadJsDef(filePath: string, logger: Logger): Promise<Middleware|undefined> {
  try {
    const cwd = path.sep === '/' ? process.cwd() : process.cwd().replaceAll(path.sep, '/')
    const regexp = new RegExp(`^${cwd}`, 'u')
    clearModule.match(regexp)
    const loadedFile = await importFreshJsModule(filePath) as unknown
    if (typeof loadedFile === 'function') {
      return loadedFile as Middleware
    }
    if (typeof (loadedFile as { default?: unknown })?.default === 'function') {
      return (loadedFile as { default: Middleware }).default
    }
    logger.warn(`Failed to recognize commonjs export or es default export from module ${filePath}`)
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND' || (e as NodeJS.ErrnoException).code === 'ENOENT') {
      logger.debug(`module "${filePath}" doesn't exist`)
    } else {
      logger.warn(`failed to require module "${filePath}", due to: ${(e as Error).message}`)
    }
  }
  return undefined
}
