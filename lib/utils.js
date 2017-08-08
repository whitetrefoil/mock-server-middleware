"use strict";
// region - Imports
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const stripJsonComments = require("strip-json-comments");
// endregion
// region - Constants
const HTTP_NOT_FOUND = 404;
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
/**
 * @param filePath - path to load file, with ".json" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
function readJsonDefFromFs(filePath, logger) {
    if (!_.isString(filePath)) {
        throw new TypeError('Path must be a string!');
    }
    const formattedPath = path.extname(filePath) === '.json' ? filePath : `${filePath}.json`;
    let loadedFile;
    try {
        loadedFile = fs.readFileSync(formattedPath, 'utf8');
    }
    catch (e) {
        logger.warn(`Failed to load file ${formattedPath}`);
        return;
    }
    try {
        const parsedFile = JSON.parse(stripJsonComments(loadedFile));
        return convertJsonToHandler(parsedFile);
    }
    catch (e) {
        logger.warn(`Failed to parse file ${formattedPath}`);
    }
}
exports.readJsonDefFromFs = readJsonDefFromFs;
/**
 * @param filePath - path to load file, with ".js" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
function readJsDefFromFs(filePath, logger) {
    if (!_.isString(filePath)) {
        throw new TypeError('Path must be a string!');
    }
    const formattedPath = path.extname(filePath) === '.js' ? filePath : `${filePath}.js`;
    try {
        const loadedFile = require(formattedPath);
        if (_.isFunction(loadedFile)) {
            return loadedFile;
        }
        if (!_.isNull(loadedFile) && _.isFunction(loadedFile.default)) {
            return loadedFile.default;
        }
        logger.warn(`Failed to recognize commonjs export or es default export from module ${formattedPath}`);
    }
    catch (e) {
        logger.warn(`Failed to require module ${formattedPath}`);
    }
}
exports.readJsDefFromFs = readJsDefFromFs;
/**
 * @param modulePath - path to load file, with ".js" suffix or not.
 * @param logger
 * @returns
 *     return loaded stuff if successfully loaded;
 *     return `undefined` if failed to load;
 */
function loadModuleFromFs(modulePath, logger) {
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
exports.loadModuleFromFs = loadModuleFromFs;
function loadModuleFromOverrides(modulePath, overrides, logger) {
    const loaded = overrides[modulePath];
    let handler;
    if (loaded == null) {
        return;
    }
    else if (!_.isFunction(loaded.definition)) {
        logger.warn(`Overrides for ${modulePath} is corrupted, deleting...`);
        delete overrides[modulePath];
        return;
    }
    handler = loaded.definition;
    if (loaded.once) {
        delete overrides[modulePath];
    }
    return handler;
}
exports.loadModuleFromOverrides = loadModuleFromOverrides;
function loadModule(modulePath, overrides, logger) {
    let handler;
    handler = loadModuleFromOverrides(modulePath, overrides, logger);
    if (handler != null) {
        logger.log(chalk_1.green('Using Manual Override: ') + modulePath);
        return handler;
    }
    handler = loadModuleFromFs(modulePath, logger);
    if (handler != null) {
        logger.log(chalk_1.green('Using API definition: ') + modulePath);
        return handler;
    }
    logger.warn(chalk_1.yellow('StubAPI not found: ') + modulePath);
    return convertJsonToHandler({ code: HTTP_NOT_FOUND, body: {} });
}
exports.loadModule = loadModule;
//# sourceMappingURL=utils.js.map