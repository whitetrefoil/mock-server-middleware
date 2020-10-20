import chalk                        from 'chalk'
import clearModule                  from 'clear-module'
import * as fs                      from 'fs-extra'
import JSON5                        from 'json5'
import type { Context, Middleware } from 'koa'
import * as path                    from 'path'
import stripJsonComments            from 'strip-json-comments'
import type { IParsedServerConfig } from './config'
import { decompress }               from './decompression'
import type Logger                  from './logger'
import type { IJsonApiDefinition }  from './msm'
import type { IOverrideStore }      from './server'


// region - Constants

const HTTP_NOT_FOUND = 404
const { green, yellow } = chalk

// endregion


// region - Interfaces

interface IRule {
  method?: string
  url?: string
}

// endregion

export async function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export function composeModulePath(
  { url, method }: Required<IRule>,
  config: IParsedServerConfig,
  preserveQuery: boolean = false,
): string {
  let modulePath = url;

  [modulePath] = modulePath.split('#')
  if (preserveQuery !== true) {
    [modulePath] = modulePath.split('?')
  }
  if (config.lowerCase) {
    modulePath = modulePath.toLowerCase()
  }
  modulePath = modulePath.replace(/[^a-zA-Z0-9/]/ug, config.nonChar)

  const fullModulePath = path.join(
    process.cwd(),
    config.apiDir,
    method.toLowerCase(),
    modulePath,
  )

  return fullModulePath
}

export function isJsonApiDefinition(obj: unknown): obj is IJsonApiDefinition {
  return Object.prototype.hasOwnProperty.call(obj, 'body')
}

export function convertJsonToHandler(json: IJsonApiDefinition): Middleware {
  return async(ctx, next) => {
    await next()
    ctx.status = json.code ?? 200
    ctx.set('Content-Type', 'application/json')
    Object.keys(json.headers ?? {}).forEach(key => {
      const val = json.headers?.[key]
      if (val != null) {
        ctx.set(key, val)
      } else {
        ctx.remove(key)
      }
    })
    ctx.body = json.body
  }
}

/**
 * @param filePath - path to load file, with ".json5" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export function readJson5DefFromFs(filePath: string, logger: Logger): Middleware|undefined {
  const formatted = path.extname(filePath) === '.json5' ? filePath : `${filePath}.json5`

  let raw: string
  try {
    raw = fs.readFileSync(formatted, 'utf8')
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
      logger.warn(`Failed to load file ${formatted}`)
    }
    return undefined
  }

  try {
    const parsed = JSON5.parse(raw) as IJsonApiDefinition
    return convertJsonToHandler(parsed)
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
      logger.warn(`Failed to load file ${formatted}`)
    }
  }
  return undefined
}

/**
 * @param filePath - path to load file, with ".json" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export function readJsonDefFromFs(filePath: string, logger: Logger): Middleware|undefined {
  const formatted = path.extname(filePath) === '.json' ? filePath : `${filePath}.json`

  let raw: string
  try {
    raw = fs.readFileSync(formatted, 'utf8')
  } catch (e: unknown) {
    logger.warn(`Failed to load file ${formatted}`)
    return undefined
  }

  try {
    const parsed = JSON.parse(stripJsonComments(raw)) as IJsonApiDefinition
    return convertJsonToHandler(parsed)
  } catch (e: unknown) {
    logger.warn(`Failed to parse file ${formatted}`)
  }
  return undefined
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
    const regexp = new RegExp(`^${process.cwd()}`, 'u')
    clearModule.match(regexp)
    const loadedFile = require(formattedPath) as unknown
    if (typeof loadedFile === 'function') {
      return loadedFile as Middleware
    }
    if (typeof (loadedFile as { default?: unknown })?.default === 'function') {
      return (loadedFile as { default: Middleware }).default
    }
    logger.warn(`Failed to recognize commonjs export or es default export from module ${formattedPath}`)
  } catch (e: unknown) {
    logger.warn(`Failed to require module ${formattedPath}`)
  }
  return undefined
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
  const extname = path.extname(modulePath)

  switch (extname) {
    case '.json5':
      return readJson5DefFromFs(modulePath, logger) ?? readJsDefFromFs(modulePath, logger)
    case '.json':
      return readJsonDefFromFs(modulePath, logger) ?? readJsDefFromFs(modulePath, logger)
    default:
      return readJson5DefFromFs(modulePath, logger)
             ?? readJsonDefFromFs(modulePath, logger)
             ?? readJsDefFromFs(modulePath, logger)

  }
}

export function loadModuleFromOverrides(
  modulePath: string,
  overrides: IOverrideStore,
  logger: Logger,
): Middleware|undefined {
  const loaded = overrides[modulePath]

  if (loaded == null) {
    return undefined
  }

  if (typeof loaded.definition !== 'function') {
    logger.warn(`Overrides for ${modulePath} is corrupted, deleting...`)
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete overrides[modulePath]
    return undefined
  }

  const handler = loaded.definition
  if (loaded.once) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete overrides[modulePath]
  }

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
  return undefined
}


async function parseBody(ctx: Context, logger: Logger): Promise<unknown> {
  // const body = ctx.body;
  const rawType = ctx.response.get('Content-Type')
  const match = /^\w*\/\w*/u.exec(rawType)
  const type = match?.[0] ?? null

  const body = await decompress(ctx.body, ctx.response.headers, logger)
  if (!Buffer.isBuffer(body)) {
    return (body as Buffer).toString()
  }

  if (type === 'application/json') {
    return JSON.parse(body.toString()) as unknown
  }

  const base64 = body.toString('base64')
  return `data:${type};base64,${base64}`
}


export async function saveModule(ctx: Context, config: IParsedServerConfig, logger: Logger) {
  const { method, url, headers } = ctx
  const fp = composeModulePath(ctx.request, config, true)
  logger.info(`${method} ${url}`)
  logger.debug(`should located at: ${fp}`)
  const existed = loadModuleFromFs(fp, logger)
                  ?? loadModuleFromFs(composeModulePath(ctx.request, config, false), logger)
                  ?? undefined

  if (existed != null) {
    logger.info('Definition exists...')
    return
  }

  const code = ctx.status
  if (code === 404) {
    logger.warn('Response status 404, skipping...')
    return
  }

  logger.warn(`No definition file found, saving to :${fp}.json`)

  logger.info(`Method: ${method}`)
  logger.info(`URL: ${url}`)
  logger.debug(`Headers: ${headers}`)
  // logger.info(`Body: ${body}`)

  const parsedBody = await parseBody(ctx, logger)

  const parsedHeaders = config.saveHeaders.reduce((prev, curr) => {
    const value = ctx.get(curr)
    if (value == null) {
      return prev
    }
    return { ...prev, [curr]: value }
  }, {})

  const jsonToWrite: IJsonApiDefinition = {
    code,
    headers: parsedHeaders,
    body   : parsedBody,
  }

  await fs.ensureFile(`${fp}.json`)
  fs.writeFile(`${fp}.json`, JSON.stringify(jsonToWrite, null, 2), 'utf8', err => {
    if (err != null) {
      logger.error(`Failed to save definition file: ${fp}.json`)
      logger.debug(err.stack ?? err.message)
    } else {
      logger.info(`Definition file "${fp}.json" saved!`)
    }
  })
}
