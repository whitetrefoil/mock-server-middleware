import chalk from 'chalk'
import clearRequire from 'clear-require'
import * as fs from 'fs'
import { Context, Middleware } from 'koa'
import * as _ from 'lodash'
import * as path from 'path'
import stripJsonComments from 'strip-json-comments'
import { IParsedServerConfig } from './config'
import Logger from './logger'
import { IJsonApiDefinition } from './msm'
import { IOverrideStore } from './server'


// region - Constants

const HTTP_NOT_FOUND    = 404
const { green, yellow } = chalk

// endregion


// region - Interfaces

interface IRule {
  method?: string
  url?: string
}

// endregion

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function composeModulePath(
  { url, method }: Required<IRule>,
  config: IParsedServerConfig,
  preserveQuery: boolean = false,
): string {
  let modulePath = url

  modulePath = modulePath.split('#')[0]
  if (preserveQuery !== true) { modulePath = modulePath.split('?')[0] }
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

export function convertJsonToHandler(json: IJsonApiDefinition): Middleware {
  return async(ctx, next) => {
    await next()
    ctx.status = json.code || 200
    ctx.set('Content-Type', 'application/json')
    _.forEach(json.headers, (val, name) => {
      if (val != null) {
        ctx.set(name, val)
      } else {
        ctx.remove(name)
      }
    })
    ctx.body = json.body
  }
}

/**
 * @param filePath - path to load file, with ".json" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export function readJsonDefFromFs(filePath: string, logger: Logger): Middleware|undefined {
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
export function readJsDefFromFs(filePath: string, logger: Logger): Middleware|undefined {
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

export function load404Module(): Middleware {
  return convertJsonToHandler({ code: HTTP_NOT_FOUND, body: {} })
}

/**
 * @param modulePath - path to load file, with ".js" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export function loadModuleFromFs(modulePath: string, logger: Logger): Middleware|undefined {
  let handler

  const extname = path.extname(modulePath)

  if (extname === '.json' || extname === '') {
    handler = readJsonDefFromFs(modulePath, logger)
  }
  if (handler != null) {
    return handler
  }

  return readJsDefFromFs(modulePath, logger)
}

export function loadModuleFromOverrides(
  modulePath: string,
  overrides: IOverrideStore,
  logger: Logger,
): Middleware|undefined {
  const loaded = overrides[modulePath]
  let handler: Middleware

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

export function loadModule(modulePath: string, overrides: IOverrideStore, logger: Logger): Middleware|undefined {
  let handler: Middleware|undefined

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
}


function parseBody(ctx: Context): string {
  const body    = ctx.body
  const rawType = ctx.response.get('Content-Type')
  const match   = rawType.match(/^\w*\/\w*/)
  const type    = match == null ? null : match[0]
  if (type === 'application/json') {
    return JSON.parse(body)
  }

  const base64 = Buffer.from(body).toString('base64')
  return `data:${type};base64,${base64}`
}


export async function saveModule(ctx: Context, config: IParsedServerConfig, logger: Logger) {
  const method  = ctx.method
  const url     = ctx.url
  const headers = ctx.headers
  const body    = ctx.body
  const fp      = composeModulePath(ctx.request, config, true)
  logger.info(`${method} ${url}`)
  logger.debug(`should located at: ${fp}`)
  const existed = loadModuleFromFs(fp, logger)

  if (existed != null) {
    logger.info('Definition exists...')
    return
  }

  const code = ctx.status
  if (code === 404) {
    logger.warn(`Response status 404, skipping...`)
    return
  }

  logger.warn(`No definition file found, saving to :${fp}.json`)

  logger.info(`Method: ${method}`)
  logger.info(`URL: ${url}`)
  logger.info(`Headers: ${headers}`)
  // logger.info(`Body: ${body}`)

  const parsedBody = parseBody(ctx)

  const jsonToWrite: IJsonApiDefinition = {
    code,
    headers: {},
    body   : parsedBody,
  }

  for (const name of config.saveHeaders) {
    const value = ctx.get(name)
    if (value != null) {
      jsonToWrite.headers![name] = value
    }
  }

  fs.writeFile(`${fp}.json`, JSON.stringify(jsonToWrite, null, 2), 'utf8', (err) => {
    if (err != null) {
      logger.error(`Failed to save definition file: ${fp}.json`)
    } else {
      logger.info(`Definition file "${fp}.json" saved!`)
    }
  })
}
