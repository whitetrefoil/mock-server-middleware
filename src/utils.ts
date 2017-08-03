// region - Imports

import { red, yellow, green } from 'chalk'
import { NextHandleFunction } from 'connect'
import { IncomingMessage, ServerResponse } from 'http'
import * as _ from 'lodash'
import * as path from 'path'
import * as requireNew from 'require-uncached'
import Logger from './logger'
import { IMockServerConfig, IJsonApiDefinition } from './msm'
import { IOverrideStore } from './server'

// endregion

// region - Constants

const HTTP_NOT_FOUND = 404
const HTTP_INTERNAL_SERVER_ERROR = 500

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

export function loadModule(modulePath: string, overrides: IOverrideStore, logger: Logger): NextHandleFunction {
  try {
    let handler
    if (overrides[modulePath] != null) {
      handler = overrides[modulePath].definition
      if (overrides[modulePath].once) { delete overrides[modulePath] }
      logger.log(green('Using Manual Override: ') + modulePath)
    } else {
      handler = requireNew(modulePath)
      logger.log(green('Using API definition: ') + modulePath)
    }
    if (_.isFunction(handler)) { return handler }
    if (!_.isNull(handler) && _.isFunction(handler.default)) { return handler.default }
    return convertJsonToHandler(handler)
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      logger.warn(yellow('StubAPI not found: ') + modulePath)
      return convertJsonToHandler({ code: HTTP_NOT_FOUND, body: e })
    }
    logger.error(red('Errors in StubAPI: ') + modulePath)
    logger.error(e)
    return convertJsonToHandler({ code: HTTP_INTERNAL_SERVER_ERROR, body: e })
  }
}
