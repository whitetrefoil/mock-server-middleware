"use strict";
// region - Imports
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const _ = require("lodash");
const path = require("path");
const requireNew = require("require-uncached");
// endregion
// region - Constants
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_SERVER_ERROR = 500;
// endregion
function composeModulePath({ url, method }, config) {
    let modulePath = url;
    modulePath = modulePath.split('#')[0];
    if (config.preserveQuery !== true) {
        modulePath = modulePath.split('?')[0];
    }
    if (config.lowerCase) {
        modulePath = modulePath.toLowerCase();
    }
    modulePath = modulePath.replace(/[^a-zA-Z0-9/]/g, config.nonChar);
    const fullModulePath = path.join(process.cwd(), config.apiDir, method.toLowerCase(), modulePath);
    return fullModulePath;
}
exports.composeModulePath = composeModulePath;
function convertJsonToHandler(json) {
    return (req, res, next) => {
        res.statusCode = json.code || 200;
        res.setHeader('Content-Type', 'application/json');
        _.forEach(json.headers, (val, name) => {
            res.setHeader(name, val);
        });
        res.end(JSON.stringify(json.body, null, 2));
    };
}
exports.convertJsonToHandler = convertJsonToHandler;
function loadModule(modulePath, overrides, logger) {
    try {
        let handler;
        if (overrides[modulePath] != null) {
            handler = overrides[modulePath].definition;
            if (overrides[modulePath].once) {
                delete overrides[modulePath];
            }
            logger.log(chalk_1.green('Using Manual Override: ') + modulePath);
        }
        else {
            handler = requireNew(modulePath);
            logger.log(chalk_1.green('Using API definition: ') + modulePath);
        }
        if (_.isFunction(handler)) {
            return handler;
        }
        if (!_.isNull(handler) && _.isFunction(handler.default)) {
            return handler.default;
        }
        return convertJsonToHandler(handler);
    }
    catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            logger.warn(chalk_1.yellow('StubAPI not found: ') + modulePath);
            return convertJsonToHandler({ code: HTTP_NOT_FOUND, body: e });
        }
        logger.error(chalk_1.red('Errors in StubAPI: ') + modulePath);
        logger.error(e);
        return convertJsonToHandler({ code: HTTP_INTERNAL_SERVER_ERROR, body: e });
    }
}
exports.loadModule = loadModule;
//# sourceMappingURL=utils.js.map