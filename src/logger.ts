import * as chalk from 'chalk'

/**
 * @param printFn - A function to print the log, usually `console.log` or `console.error`.
 * @param chalkFn - A function to render the text style of leading label,
 *                  usually a "Chalk" function to change text color.
 * @param message - message to print.
 */
const print = (
  printFn: (message: string) => void,
  chalkFn: (text: string) => string,
  message: string,
) => {
  printFn(`${chalkFn('MDM')}@${new Date().toTimeString().substr(0, 8)} - ${message}`)
}

export interface ILogLevelMap {
  DEBUG: number
  INFO: number
  LOG: number
  WARN: number
  ERROR: number
  NONE: number
}

const LogLevelMap: ILogLevelMap = {
  DEBUG: 1,
  INFO : 2,
  LOG  : 2,
  WARN : 3,
  ERROR: 4,
  NONE : 10,
}

export type ILogLevel = keyof ILogLevelMap

let logLevel: ILogLevel = null

export const setLogLevel = (level: ILogLevel = 'NONE') => {
  if (!LogLevelMap[level]) {
    logLevel = 'NONE'
    return
  }
  logLevel = level
}

export default {
  debug(message: string) {
    if (LogLevelMap[logLevel] > LogLevelMap.DEBUG) { return }
    if (process.env.NODE_ENV === 'development') {
      print(console.log, chalk.magenta, message)
    }
  },

  info(message: string) {
    if (LogLevelMap[logLevel] > LogLevelMap.INFO) { return }
    print(console.log, chalk.cyan, message)
  },

  log(message: string) {
    if (LogLevelMap[logLevel] > LogLevelMap.LOG) { return }
    print(console.log, chalk.green, message)
  },

  warn(message: string) {
    if (LogLevelMap[logLevel] > LogLevelMap.WARN) { return }
    print(console.log, chalk.yellow, message)
  },

  error(message: string) {
    if (LogLevelMap[logLevel] > LogLevelMap.ERROR) { return }
    print(console.log, chalk.red, message)
  },
}
