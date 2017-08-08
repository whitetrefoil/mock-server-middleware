"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const stripJsonComments = require("strip-json-comments");
const utils_1 = require("./utils");
class MSMServer {
    constructor(config) {
        this.overrides = {};
        this.callLogs = [];
        this.isRecording = false;
        this.config = config;
    }
    logCall(method, calledUrl, body) {
        if (this.isRecording === false) {
            return;
        }
        this.callLogs.push({
            method,
            href: calledUrl.href,
            search: calledUrl.search,
            query: calledUrl.query,
            pathname: calledUrl.pathname,
            body,
        });
    }
    once(method, calledUrl, definition) {
        const req = { url: calledUrl, method };
        if (_.isString(definition)) {
            definition = JSON.parse(stripJsonComments(definition));
        }
        if (!_.isFunction(definition)) {
            definition = utils_1.convertJsonToHandler(definition);
        }
        this.overrides[utils_1.composeModulePath(req, this.config)] = {
            definition,
            once: true,
        };
    }
    on(method, calledUrl, definition) {
        const req = { url: calledUrl, method };
        if (_.isString(definition)) {
            definition = JSON.parse(stripJsonComments(definition));
        }
        if (!_.isFunction(definition)) {
            definition = utils_1.convertJsonToHandler(definition);
        }
        this.overrides[utils_1.composeModulePath(req, this.config)] = {
            definition,
            once: false,
        };
    }
    off(method, calledUrl) {
        if (method != null && calledUrl != null) {
            const req = { url: calledUrl, method };
            delete this.overrides[utils_1.composeModulePath(req, this.config)];
            return;
        }
        if (method == null && calledUrl == null) {
            for (const key in this.overrides) {
                if (this.overrides.hasOwnProperty(key)) {
                    delete this.overrides[key];
                }
            }
            return;
        }
        throw new Error('Params of msm.server.off() should either be both given or be neither given. '
            + 'But now only one is given.  This usually indicates a problem in code.');
    }
    /**
     * Return a list of all previous requests.
     * @param pathname - Only return requests with pathname **starts** with this.
     *                   Use RegExp starts with ".*" if you want to match in middle.
     * @param method - Filter by request method.
     */
    called(pathname, method) {
        return _.filter(this.callLogs, (log) => {
            if (_.isString(method) && method.toLowerCase() !== log.method) {
                return false;
            }
            if (pathname != null && log.pathname.search(pathname) !== 0) {
                return false;
            }
            return true;
        });
    }
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
        if (this.isRecording === true) {
            throw new Error('MSM is already recording! Check your test code!');
        }
        if (!isLogFlushCheckBypassed && this.callLogs.length > 0) {
            throw new Error('Previous request logs haven\'t been flushed yet!'
                + '  If you really want to bypass this check, use `msm.server.record(true)`.');
        }
        this.isRecording = true;
    }
    /**
     * Stop recording requests but not to flush the logs.
     */
    stopRecording() {
        this.isRecording = false;
    }
    /**
     * Stop recording & flush all logs of requests.
     */
    flush() {
        this.isRecording = false;
        this.callLogs.length = 0;
    }
}
exports.default = MSMServer;
//# sourceMappingURL=server.js.map