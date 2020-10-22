import type { Logger, MsmMiddleware } from '../interfaces'
import loadJsDef                      from './load-js'
import loadJsonDef                    from './load-json'


/**
 * This function accept a path which should be converted from request path, w/o extname.
 *
 * It will attempt to:
 * 1. load **JSON** def by append ".json5" to the path;
 * 2. load **JSON** def by append ".json" to the path;
 * 3. load **JS** def by node's `require()`.
 *
 * @param basePath - path to load file, w/o extname
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export function loadDef(basePath: string, logger: Logger): MsmMiddleware|undefined {

  const jsonDef = loadJsonDef(`${basePath}.json5`, logger) ??
                  loadJsonDef(`${basePath}.json`, logger) ??
                  loadJsDef(basePath, logger)

  if (jsonDef == null) {
    logger.warn(`StubAPI not found for: "${basePath}"`)
  }

  return jsonDef
}
