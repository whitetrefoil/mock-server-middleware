// region - Imports

import chalk from 'chalk'
import clearRequire from 'clear-require'
import { NextHandleFunction } from 'connect'
import * as fs from 'fs'
import { IncomingMessage, ServerResponse } from 'http'
import * as _ from 'lodash'
import * as path from 'path'
import stripJsonComments from 'strip-json-comments'
import Logger from './logger'
import { IJsonApiDefinition, IMockServerConfig } from './msm'
import { IOverrideStore } from './server'

// endregion

// region - Constants

const HTTP_NOT_FOUND    = 404
const { green, yellow } = chalk

// endregion

export function ensureProperties<T, P extends keyof T>(
  obj: T,
  props: P[],
  message?: string,
): Require<T, P> {
  for (const prop of props) {
    if (obj[prop] == null) {
      throw new Error(message || `Missing "${prop}" in ${obj}`)
    }
  }
  return obj as Require<T, P>
}

export function ensureUrl<T extends IncomingMessage>(req: T): Require<T, 'url'> {
  return ensureProperties(req, ['url'], 'Missing "url" in request, something must be wrong in config.')
}

export function ensureMethod<T extends IncomingMessage>(req: T): Require<T, 'method'> {
  return ensureProperties(req, ['method'], 'Missing "method" in request, something must be wrong in config.')
}

export function composeModulePath(
  { url, method }: Required<Pick<IncomingMessage, 'url'|'method'>>,
  config: Required<IMockServerConfig>,
): string {
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

export function isJsonApiDefinition(obj: object): obj is IJsonApiDefinition {
  return obj != null && obj.hasOwnProperty('body')
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
export function readJsonDefFromFs(filePath: string, logger: Logger): NextHandleFunction|undefined {
  // if (!_.isString(filePath)) { throw new TypeError('Path must be a string!') }
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
export function readJsDefFromFs(filePath: string, logger: Logger): NextHandleFunction|undefined {
  // if (!_.isString(filePath)) { throw new TypeError('Path must be a string!') }
  const formattedPath = path.extname(filePath) !== '.json' ? filePath : `${filePath}.js`

  try {
    clearRequire(formattedPath)
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

export function loadModuleFromOverrides(
  modulePath: string,
  overrides: IOverrideStore,
  logger: Logger,
): NextHandleFunction|undefined {
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
  let handler: NextHandleFunction|undefined

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
