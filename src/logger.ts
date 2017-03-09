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

export default {
  debug(message: string) {
    if (process.env.NODE_ENV === 'development') {
      print(console.log, chalk.magenta, message)
    }
  },

  info(message: string) {
    print(console.log, chalk.cyan, message)
  },

  log(message: string) {
    print(console.log, chalk.green, message)
  },

  warn(message: string) {
    print(console.error, chalk.yellow, message)
  },

  error(message: string) {
    print(console.error, chalk.red, message)
  },
}
