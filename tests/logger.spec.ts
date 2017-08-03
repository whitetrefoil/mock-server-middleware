/* tslint:no-console:off */

describe('Logger ::', () => {
  jest.resetModules()

  beforeEach(() => {
    jest.resetModules()
  })

  it('should be exported from index', () => {
    const mainExports = require('../src/logger')
    expect(mainExports.default).toBeDefined()
  })

  describe('Log Level ::', () => {
    jest.resetModules()
    const Logger = require('../src/logger').default
    const spyLog = jest.spyOn(global.console, 'log').mockReturnValue(void 0)

    afterEach(() => {
      spyLog.mockClear()
    })

    it('should not show debug when level is "INFO"', () => {
      const logger = new Logger('INFO')
      logger.debug('asdf')
      expect(console.log).not.toHaveBeenCalled()
      logger.info('qwert')
      expect(console.log).toHaveBeenCalled()
    })
    it('should not show debug when level is "LOG"', () => {
      const logger = new Logger('LOG')
      logger.debug('asdf')
      expect(console.log).not.toHaveBeenCalled()
      logger.log('qwert')
      expect(console.log).toHaveBeenCalled()
    })
    it('should not show log when level is "WARN"', () => {
      const logger = new Logger('WARN')
      logger.log('asdf')
      expect(console.log).not.toHaveBeenCalled()
      logger.warn('qwert')
      expect(console.log).toHaveBeenCalled()
    })
    it('should not show info when level is "WARN"', () => {
      const logger = new Logger('WARN')
      logger.info('asdf')
      expect(console.log).not.toHaveBeenCalled()
    })
    it('should not show warning when level is "ERROR"', () => {
      const logger = new Logger('ERROR')
      logger.warn('asdf')
      expect(console.log).not.toHaveBeenCalled()
      logger.error('qwert')
      expect(console.log).toHaveBeenCalled()
    })
    it('should not show anything when level is "NONE"', () => {
      const logger = new Logger('NONE')
      logger.error('asdf')
      expect(console.log).not.toHaveBeenCalled()
    })
    it('should have default level of "NONE"', () => {
      const logger = new Logger('qwerqwer')
      logger.error('asdf')
      expect(console.log).not.toHaveBeenCalled()
    })
  })
})
