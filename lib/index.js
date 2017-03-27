// region Imports
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const logger_1 = require("./logger");
exports.Logger = logger_1.default;
const every = require("lodash/every");
const filter = require("lodash/filter");
const forEach = require("lodash/forEach");
const isFunction = require("lodash/isFunction");
const isString = require("lodash/isString");
const path = require("path");
const url = require("url");
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
let callLog = [];
let isRecording = false;
// endregion
// region Main exports
function initialize(options) {
    Object.assign(config, options);
}
exports.initialize = initialize;
exports.middleware = (req, res, next) => {
    if (every(config.apiPrefixes, (prefix) => req.url.indexOf(prefix) !== 0)) {
        next();
        return;
    }
    if (isRecording === true) {
        const log = {
            method: req.method.toLowerCase(),
        };
        if (req.body != null) {
            log.body = req.body;
        }
        Object.assign(log, url.parse(req.url, true));
        callLog.push(log);
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
    /**
     * Return a list of all previous requests.
     * @param pathname - Only return requests with pathname **starts** with this.
     *                   Use RegExp if you want to match in middle.
     * @param method - Filter by request method.
     */
    called(pathname, method) {
        return filter(callLog, (log) => {
            if (isString(method) && method.toLowerCase() !== log.method) {
                return false;
            }
            if (pathname != null && log.pathname.search(pathname) !== 0) {
                return false;
            }
            return true;
        });
    },
    /**
     * Start recording requests.
     * If recording is already started or previous logs haven't been flushed
     * it will throw an Error to help prevent potential error in tests.
     *
     * You can explicitly pass the log-flush check via the arguments,
     * but the already-started check is mandatory.
     *
     * @param isFlushedCheckBypassed - Bypass log-flush check.
     * @throws {Error}
     */
    record(isLogFlushCheckBypassed = false) {
        if (isRecording === true) {
            throw new Error('MSM is already recording! Check your test code!');
        }
        if (!isLogFlushCheckBypassed && callLog.length > 0) {
            throw new Error('Previous request logs haven\'t been flushed yet!'
                + '  If you really want to bypass this check, use `msm.server.record(true)`.');
        }
        isRecording = true;
    },
    /**
     * Stop recording requests but not to flush the logs.
     */
    stopRecording() {
        isRecording = false;
    },
    /**
     * Stop recording & flush all logs of requests.
     */
    flush() {
        isRecording = false;
        callLog = [];
    },
};
// endregion
//# sourceMappingURL=index.js.map