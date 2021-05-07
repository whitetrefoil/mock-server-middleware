import type { Chalk } from 'chalk'
import chalk from 'chalk'
import type { Logger, PrintFn } from './interfaces'


export enum LogLevel {
  DEBUG = 1,
  INFO = 2,
  LOG = 2,
  WARN = 3,
  ERROR = 4,
  NONE = 10,
}

/**
 * @param printFn - A function to print the log, usually `console.log` or `console.error`.
 * @param chalkFn - A function to render the text style of leading label,
 *                  usually a "Chalk" function to change text color.
 * @param message - message to print.
 */
const print = (
  chalkFn: Chalk,
  message: string,
) => {
  console.log(`${chalkFn('MDM')}@${
    new Date()
      .toTimeString()
      .substr(0, 8)
  } - ${message}`)
}


export const createLogger = (level: LogLevel): Logger => {
  const _level = level in LogLevel ? level : LogLevel.NONE

  const printF = (levelLimit: LogLevel, color: Chalk, env?: string): PrintFn => {
    if (env == null) {
      return message => {
        if (_level > levelLimit) {
          return
        }
        print(color, message)
      }
    }

    return message => {
      if (_level > levelLimit || process.env.NODE_ENV !== env) {
        return
      }
      print(color, message)
    }
  }

  return {
    debug: printF(LogLevel.DEBUG, chalk.magenta, 'development'),
    info : printF(LogLevel.INFO, chalk.cyan),
    log  : printF(LogLevel.LOG, chalk.green),
    warn : printF(LogLevel.WARN, chalk.yellow),
    error: printF(LogLevel.ERROR, chalk.red),
  }
}
