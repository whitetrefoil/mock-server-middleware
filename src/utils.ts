// region - Imports

import { yellow, green } from 'chalk'
import { NextHandleFunction } from 'connect'
import * as fs from 'fs'
import { IncomingMessage, ServerResponse } from 'http'
import * as _ from 'lodash'
import * as path from 'path'
import * as stripJsonComments from 'strip-json-comments'
import Logger from './logger'
import { IMockServerConfig, IJsonApiDefinition } from './msm'
import { IOverrideStore } from './server'

// endregion

// region - Constants

const HTTP_NOT_FOUND = 404

// endregion

export function composeModulePath({ url, method }: IncomingMessage, config: IMockServerConfig): string {
  let modulePath = url

  modulePath = modulePath.split('#')[0]
  if (config.preserveQuery !== true) { modulePath = modulePath.split('?')[0] }
  if (config.lowerCase) { modulePath = modulePath.toLowerCase() }
  modulePath = modulePath.replace(/[^a-zA-Z0-9/]/g, config.nonChar)

  const fullModulePath = path.join(
    process.cwd(),
    config.apiDir,
    method.toLowerCase(),
    modulePath,
  )

  return fullModulePath
}

export function convertJsonToHandler(json: IJsonApiDefinition): NextHandleFunction {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    res.statusCode = json.code || 200
    res.setHeader('Content-Type', 'application/json')
    _.forEach(json.headers, (val, name) => {
      res.setHeader(name, val)
    })
    res.end(JSON.stringify(json.body, null, 2))
  }
}

/**
 * @param filePath - path to load file, with ".json" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export function readJsonDefFromFs(filePath: string, logger: Logger): NextHandleFunction {
  if (!_.isString(filePath)) { throw new TypeError('Path must be a string!') }
  const formattedPath = path.extname(filePath) === '.json' ? filePath : `${filePath}.json`

  let loadedFile: string
  try {
    loadedFile = fs.readFileSync(formattedPath, 'utf8')
  } catch (e) {
    logger.warn(`Failed to load file ${formattedPath}`)
    return
  }

  try {
    const parsedFile = JSON.parse(stripJsonComments(loadedFile)) as IJsonApiDefinition
    return convertJsonToHandler(parsedFile)
  } catch (e) {
    logger.warn(`Failed to parse file ${formattedPath}`)
  }
}

/**
 * @param filePath - path to load file, with ".js" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export function readJsDefFromFs(filePath: string, logger: Logger): NextHandleFunction {
  if (!_.isString(filePath)) { throw new TypeError('Path must be a string!') }
  const formattedPath = path.extname(filePath) !== '.json' ? filePath : `${filePath}.js`

  try {
    const loadedFile = require(formattedPath)
    if (_.isFunction(loadedFile)) { return loadedFile }
    if (!_.isNull(loadedFile) && _.isFunction(loadedFile.default)) { return loadedFile.default }
    logger.warn(`Failed to recognize commonjs export or es default export from module ${formattedPath}`)
  } catch (e) {
    logger.warn(`Failed to require module ${formattedPath}`)
  }
}

/**
 * @param modulePath - path to load file, with ".js" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export function loadModuleFromFs(modulePath: string, logger: Logger): any {
  let handler

  const extname = path.extname(modulePath)

  if (extname === '.json' || extname === '') { handler = readJsonDefFromFs(modulePath, logger) }
  if (handler != null) { return handler }

  return readJsDefFromFs(modulePath, logger)
}

export function loadModuleFromOverrides(modulePath: string, overrides: IOverrideStore, logger: Logger): NextHandleFunction {
  const loaded = overrides[modulePath]
  let handler: NextHandleFunction

  if (loaded == null) {
    return
  } else if (!_.isFunction(loaded.definition)) {
    logger.warn(`Overrides for ${modulePath} is corrupted, deleting...`)
    delete overrides[modulePath]
    return
  }

  handler = loaded.definition
  if (loaded.once) { delete overrides[modulePath] }

  return handler
}

export function loadModule(modulePath: string, overrides: IOverrideStore, logger: Logger): NextHandleFunction {
  let handler: NextHandleFunction

  handler = loadModuleFromOverrides(modulePath, overrides, logger)
  if (handler != null) {
    logger.log(green('Using Manual Override: ') + modulePath)
    return handler
  }

  handler = loadModuleFromFs(modulePath, logger)
  if (handler != null) {
    logger.log(green('Using API definition: ') + modulePath)
    return handler
  }

  logger.warn(yellow('StubAPI not found: ') + modulePath)
  return convertJsonToHandler({ code: HTTP_NOT_FOUND, body: {} })
}
