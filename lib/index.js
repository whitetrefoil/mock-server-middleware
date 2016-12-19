// region Imports
"use strict";
const chalk_1 = require("chalk");
const every = require("lodash/every");
const forEach = require("lodash/forEach");
const isFunction = require("lodash/isFunction");
const path = require("path");
const requireNew = require('require-uncached');
// endregion
// region Constants
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_SERVER_ERROR = 500;
// endregion
// region Variables / constants initialize
const overrides = {};
const config = {
    apiPrefixes: ['/api/'],
    apiDir: 'stubapi',
    nonChar: '-',
    lowerCase: true,
    ping: 0,
    preserveQuery: false,
};
// endregion
// region Helper functions
function log(message, ...optionalParams) {
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    // tslint:disable-next-line:no-console
    console.log(message, ...optionalParams);
}
function composeModulePath({ url, method }) {
    let modulePath = url;
    if (config.preserveQuery !== true) {
        modulePath = modulePath.split('?')[0];
    }
    if (config.lowerCase) {
        modulePath = modulePath.toLowerCase();
    }
    modulePath = modulePath.replace(/[^\d\w/]/g, config.nonChar);
    const fullModulePath = path.join(process.cwd(), config.apiDir, method.toLowerCase(), modulePath);
    return fullModulePath;
}
exports.composeModulePath = composeModulePath;
function convertJsonToHandler(json) {
    return (req, res, next) => {
        res.statusCode = json.code || 200;
        forEach(json.headers, (val, name) => {
            res.setHeader(name, val);
        });
        res.end(JSON.stringify(json.body, null, 2));
    };
}
exports.convertJsonToHandler = convertJsonToHandler;
function loadModule(modulePath) {
    try {
        let handler;
        if (overrides[modulePath] != null) {
            handler = overrides[modulePath].definition;
            if (overrides[modulePath].once) {
                delete overrides[modulePath];
            }
            log(chalk_1.green('Using Manual Override: ') + modulePath);
        }
        else {
            handler = requireNew(modulePath);
            log(chalk_1.green('Using API definition: ') + modulePath);
        }
        if (isFunction(handler)) {
            return handler;
        }
        return convertJsonToHandler(handler);
    }
    catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            log(chalk_1.yellow('StubAPI not found: ') + modulePath);
            return convertJsonToHandler({ code: HTTP_NOT_FOUND, body: e });
        }
        log(chalk_1.red('Errors in StubAPI: ') + modulePath);
        log(e);
        return convertJsonToHandler({ code: HTTP_INTERNAL_SERVER_ERROR, body: e });
    }
}
exports.loadModule = loadModule;
// endregion
// region Main exports
function initialize(options) {
    Object.assign(config, options);
}
exports.initialize = initialize;
exports.middleware = function (req, res, next) {
    if (every(config.apiPrefixes, (prefix) => req.url.indexOf(prefix) !== 0)) {
        next();
        return;
    }
    const modulePath = composeModulePath(req);
    const handler = loadModule(modulePath);
    setTimeout(() => {
        handler(req, res, next);
    }, config.ping);
};
exports.server = {
    once(method, url, definition) {
        const req = { url, method };
        overrides[composeModulePath(req)] = {
            definition,
            once: true,
        };
    },
    on(method, url, definition) {
        const req = { url, method };
        overrides[composeModulePath(req)] = {
            definition,
            once: false,
        };
    },
    off(method, url) {
        if (method != null && url != null) {
            const req = { url, method };
            delete overrides[composeModulePath(req)];
            return;
        }
        if (method == null && url == null) {
            for (const key in overrides) {
                if (overrides.hasOwnProperty(key)) {
                    delete overrides[key];
                }
            }
            return;
        }
        throw new Error('Params of msm.server.off() should either be both given or be neither given. '
            + 'But now only one is given.  This usually indicates a problem in code.');
    },
};
// endregion
//# sourceMappingURL=index.js.map