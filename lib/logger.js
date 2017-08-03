"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
/**
 * @param printFn - A function to print the log, usually `console.log` or `console.error`.
 * @param chalkFn - A function to render the text style of leading label,
 *                  usually a "Chalk" function to change text color.
 * @param message - message to print.
 */
const print = (printFn, chalkFn, message) => {
    printFn(`${chalkFn('MDM')}@${new Date().toTimeString().substr(0, 8)} - ${message}`);
};
const LogLevelMap = {
    DEBUG: 1,
    INFO: 2,
    LOG: 2,
    WARN: 3,
    ERROR: 4,
    NONE: 10,
};
class Logger {
    constructor(level) {
        this.logLevel = null;
        if (!LogLevelMap[level]) {
            this.logLevel = 'NONE';
            return;
        }
        this.logLevel = level;
    }
    debug(message) {
        if (LogLevelMap[this.logLevel] > LogLevelMap.DEBUG) {
            return;
        }
        if (process.env.NODE_ENV === 'development') {
            print(console.log, chalk.magenta, message);
        }
    }
    info(message) {
        if (LogLevelMap[this.logLevel] > LogLevelMap.INFO) {
            return;
        }
        print(console.log, chalk.cyan, message);
    }
    log(message) {
        if (LogLevelMap[this.logLevel] > LogLevelMap.LOG) {
            return;
        }
        print(console.log, chalk.green, message);
    }
    warn(message) {
        if (LogLevelMap[this.logLevel] > LogLevelMap.WARN) {
            return;
        }
        print(console.log, chalk.yellow, message);
    }
    error(message) {
        if (LogLevelMap[this.logLevel] > LogLevelMap.ERROR) {
            return;
        }
        print(console.log, chalk.red, message);
    }
}
exports.default = Logger;
//# sourceMappingURL=logger.js.map