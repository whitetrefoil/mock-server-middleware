import chai, { expect }           from 'chai'
import sinon, { SinonStub }       from 'sinon'
import sinonChai                  from 'sinon-chai'
import { createLogger, LogLevel } from '~/logger'

chai.use(sinonChai)

describe('Logger', () => {

  afterEach(() => {
    sinon.restore()
  })

  it('should be exported from index', () => {
    expect(createLogger).to.a('function')
  })

  describe('Log Level ::', () => {
    let spyLog: SinonStub

    beforeEach(() => {
      spyLog = sinon.stub(global.console, 'log').returns(undefined)
    })

    afterEach(() => {
      spyLog.restore()
    })

    it('should not show debug when level is "INFO"', () => {
      const logger = createLogger(LogLevel.INFO)
      logger.debug('asdf')
      expect(console.log).not.to.have.been.called
      logger.info('qwert')
      expect(console.log).to.have.been.called
    })
    it('should not show debug when level is "LOG"', () => {
      const logger = createLogger(LogLevel.LOG)
      logger.debug('asdf')
      expect(console.log).not.to.have.been.called
      logger.log('qwert')
      expect(console.log).to.have.been.called
    })
    it('should not show log when level is "WARN"', () => {
      const logger = createLogger(LogLevel.WARN)
      logger.log('asdf')
      expect(console.log).not.to.have.been.called
      logger.warn('qwert')
      expect(console.log).to.have.been.called
    })
    it('should not show info when level is "WARN"', () => {
      const logger = createLogger(LogLevel.WARN)
      logger.info('asdf')
      expect(console.log).not.to.have.been.called
    })
    it('should not show warning when level is "ERROR"', () => {
      const logger = createLogger(LogLevel.ERROR)
      logger.warn('asdf')
      expect(console.log).not.to.have.been.called
      logger.error('qwert')
      expect(console.log).to.have.been.called
    })
    it('should not show anything when level is "NONE"', () => {
      const logger = createLogger(LogLevel.NONE)
      logger.error('asdf')
      expect(console.log).not.to.have.been.called
    })
    it('should have default level of "NONE"', () => {
      const logger = createLogger(123)
      logger.error('asdf')
      expect(console.log).not.to.have.been.called
    })
  })
})
