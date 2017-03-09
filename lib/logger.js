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
exports.default = {
    debug(message) {
        if (process.env.NODE_ENV === 'development') {
            print(console.log, chalk.magenta, message);
        }
    },
    info(message) {
        print(console.log, chalk.cyan, message);
    },
    log(message) {
        print(console.log, chalk.green, message);
    },
    warn(message) {
        print(console.log, chalk.yellow, message);
    },
    error(message) {
        print(console.log, chalk.red, message);
    },
};
//# sourceMappingURL=logger.js.map