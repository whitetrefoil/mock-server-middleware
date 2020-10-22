import * as fs                                           from 'fs-extra'
import JSON5                                             from 'json5'
import path                                              from 'path'
import type { JsonApiDefinition, Logger, MsmMiddleware } from '../interfaces'
import convertJsonToHandler                              from './convert'

/**
 * @param filePath - path to load file, **MUST** with ".json5" or ".json" suffix.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export default function loadJsonDef(filePath: string, logger: Logger): MsmMiddleware|undefined {
  const extname = path.extname(filePath)
  if (extname !== '.json' && extname !== '.json5') {
    throw new Error('JSON def to read must be a .json or .json5 file')
  }

  let raw: string
  try {
    raw = fs.readFileSync(filePath, 'utf8')
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
      logger.warn(`failed to load file ${filePath}, due to: ${(e as Error).message}`)
    } else {
      logger.debug(`file "${filePath}" doesn't exist`)
    }
    return undefined
  }

  try {
    const parsed = JSON5.parse(raw) as JsonApiDefinition
    return convertJsonToHandler(parsed)
  } catch (e: unknown) {
    logger.warn(`failed to parse JSON file ${filePath}, due to: ${(e as Error).message}`)
  }
  return undefined
}
