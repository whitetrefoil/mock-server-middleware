import chalk                   from 'chalk';
import clearRequire            from 'clear-module';
import * as fs                 from 'fs-extra';
// tslint:disable-next-line:no-implicit-dependencies
import { Context, Middleware } from 'koa';
import * as path               from 'path';
import stripJsonComments       from 'strip-json-comments';
import { IParsedServerConfig } from './config';
import { decompress }          from './decompression';
import Logger                  from './logger';
import { IJsonApiDefinition }  from './msm';
import { IOverrideStore }      from './server';
// import bodyParser         from 'koa-bodyparser';


// region - Constants

const HTTP_NOT_FOUND = 404;
const { green, yellow } = chalk;

// endregion


// region - Interfaces

interface IRule {
  method?: string;
  url?: string;
}

// endregion

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function composeModulePath(
  { url, method }: Required<IRule>,
  config: IParsedServerConfig,
  preserveQuery: boolean = false,
): string {
  let modulePath = url;

  modulePath = modulePath.split('#')[0];
  if (preserveQuery !== true) { modulePath = modulePath.split('?')[0]; }
  if (config.lowerCase) { modulePath = modulePath.toLowerCase(); }
  modulePath = modulePath.replace(/[^a-zA-Z0-9/]/g, config.nonChar);

  const fullModulePath = path.join(
    process.cwd(),
    config.apiDir,
    method.toLowerCase(),
    modulePath,
  );

  return fullModulePath;
}

export function isJsonApiDefinition(obj: object): obj is IJsonApiDefinition {
  return obj?.hasOwnProperty('body');
}

export function convertJsonToHandler(json: IJsonApiDefinition): Middleware {
  return async(ctx, next) => {
    await next();
    ctx.status = json.code || 200;
    ctx.set('Content-Type', 'application/json');
    Object.keys(json.headers ?? {}).forEach(key => {
      const val = json.headers?.[key];
      if (val != null) {
        ctx.set(key, val);
      } else {
        ctx.remove(key);
      }
    });
    ctx.body = json.body;
  };
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
  const formattedPath = path.extname(filePath) === '.json' ? filePath : `${filePath}.json`;

  let loadedFile: string;
  try {
    loadedFile = fs.readFileSync(formattedPath, 'utf8');
  } catch (e) {
    logger.warn(`Failed to load file ${formattedPath}`);
    return undefined;
  }

  try {
    const parsedFile = JSON.parse(stripJsonComments(loadedFile)) as IJsonApiDefinition;
    return convertJsonToHandler(parsedFile);
  } catch (e) {
    logger.warn(`Failed to parse file ${formattedPath}`);
  }
  return undefined;
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
  const formattedPath = path.extname(filePath) !== '.json' ? filePath : `${filePath}.js`;

  try {
    clearRequire(formattedPath);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loadedFile = require(formattedPath);
    if (typeof loadedFile === 'function') { return loadedFile; }
    if (typeof loadedFile?.default === 'function') {
      return loadedFile.default;
    }
    logger.warn(`Failed to recognize commonjs export or es default export from module ${formattedPath}`);
  } catch (e) {
    logger.warn(`Failed to require module ${formattedPath}`);
  }
  return undefined;
}

export function load404Module(): Middleware {
  return convertJsonToHandler({ code: HTTP_NOT_FOUND, body: {} });
}

/**
 * @param modulePath - path to load file, with ".js" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
export function loadModuleFromFs(modulePath: string, logger: Logger): Middleware|undefined {
  let handler;

  const extname = path.extname(modulePath);

  if (extname === '.json' || extname === '') {
    handler = readJsonDefFromFs(modulePath, logger);
  }
  if (handler != null) {
    return handler;
  }

  return readJsDefFromFs(modulePath, logger);
}

export function loadModuleFromOverrides(
  modulePath: string,
  overrides: IOverrideStore,
  logger: Logger,
): Middleware|undefined {
  const loaded = overrides[modulePath];

  if (loaded == null) {
    return;
  }

  if (typeof loaded.definition !== 'function') {
    logger.warn(`Overrides for ${modulePath} is corrupted, deleting...`);
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete overrides[modulePath];
    return;
  }

  const handler = loaded.definition;
  if (loaded.once) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete overrides[modulePath];
  }

  return handler;
}

export function loadModule(modulePath: string, overrides: IOverrideStore, logger: Logger): Middleware|undefined {
  let handler: Middleware|undefined;

  handler = loadModuleFromOverrides(modulePath, overrides, logger);
  if (handler != null) {
    logger.log(green('Using Manual Override: ') + modulePath);
    return handler;
  }

  handler = loadModuleFromFs(modulePath, logger);
  if (handler != null) {
    logger.log(green('Using API definition: ') + modulePath);
    return handler;
  }

  logger.warn(yellow('StubAPI not found: ') + modulePath);
  return undefined;
}


async function parseBody(ctx: Context, logger: Logger): Promise<any> {
  // const body = ctx.body;
  const rawType = ctx.response.get('Content-Type');
  const match = rawType.match(/^\w*\/\w*/);
  const type = match == null ? null : match[0];

  const body = await decompress(ctx.body, ctx.response.headers, logger);
  if (!Buffer.isBuffer(body)) {
    return body.toString();
  }

  if (type === 'application/json') {
    return JSON.parse(body.toString());
  }

  const base64 = body.toString('base64');
  return `data:${type};base64,${base64}`;
}


export async function saveModule(ctx: Context, config: IParsedServerConfig, logger: Logger) {
  const { method } = ctx;
  const { url } = ctx;
  const { headers } = ctx;
  const fp = composeModulePath(ctx.request, config, true);
  logger.info(`${method} ${url}`);
  logger.debug(`should located at: ${fp}`);
  const existed = loadModuleFromFs(fp, logger)
                  || loadModuleFromFs(composeModulePath(ctx.request, config, false), logger)
                  || undefined;

  if (existed != null) {
    logger.info('Definition exists...');
    return;
  }

  const code = ctx.status;
  if (code === 404) {
    logger.warn('Response status 404, skipping...');
    return;
  }

  logger.warn(`No definition file found, saving to :${fp}.json`);

  logger.info(`Method: ${method}`);
  logger.info(`URL: ${url}`);
  logger.debug(`Headers: ${headers}`);
  // logger.info(`Body: ${body}`)

  const parsedBody = await parseBody(ctx, logger);

  const jsonToWrite: IJsonApiDefinition = {
    code,
    headers: {},
    body   : parsedBody,
  };

  for (const name of config.saveHeaders) {
    const value = ctx.get(name);
    if (value != null) {
      jsonToWrite.headers![name] = value;
    }
  }

  await fs.ensureFile(`${fp}.json`);
  fs.writeFile(`${fp}.json`, JSON.stringify(jsonToWrite, null, 2), 'utf8', err => {
    if (err != null) {
      logger.error(`Failed to save definition file: ${fp}.json`);
      logger.debug(err.stack ?? err.message);
    } else {
      logger.info(`Definition file "${fp}.json" saved!`);
    }
  });
}
