/* eslint-disable no-console,@typescript-eslint/no-magic-numbers */

import chalk, { Chalk } from 'chalk';

/**
 * @param printFn - A function to print the log, usually `console.log` or `console.error`.
 * @param chalkFn - A function to render the text style of leading label,
 *                  usually a "Chalk" function to change text color.
 * @param message - message to print.
 */
const print = (
  printFn: (message: string) => void,
  chalkFn: Chalk,
  message: string,
) => {
  printFn(`${chalkFn('MDM')}@${
    new Date()
      .toTimeString()
      .substr(0, 8)
  } - ${message}`);
};

export enum LogLevel {
  DEBUG = 1,
  INFO = 2,
  LOG = INFO,
  WARN = 3,
  ERROR = 4,
  NONE = 10,
}

class Logger {
  readonly logLevel: LogLevel;

  constructor(level: LogLevel) {
    this.logLevel = level in LogLevel ? level : LogLevel.NONE;
  }

  debug(message: string) {
    if (this.logLevel > LogLevel.DEBUG) {
      return;
    }
    if (process.env.NODE_ENV === 'development') {
      print(console.log, chalk.magenta, message);
    }
  }

  info(message: string) {
    if (this.logLevel > LogLevel.INFO) {
      return;
    }
    print(console.log, chalk.cyan, message);
  }

  log(message: string) {
    if (this.logLevel > LogLevel.LOG) {
      return;
    }
    print(console.log, chalk.green, message);
  }

  warn(message: string) {
    if (this.logLevel > LogLevel.WARN) {
      return;
    }
    print(console.log, chalk.yellow, message);
  }

  error(message: string) {
    if (this.logLevel > LogLevel.ERROR) {
      return;
    }
    print(console.log, chalk.red, message);
  }
}

export default Logger;
