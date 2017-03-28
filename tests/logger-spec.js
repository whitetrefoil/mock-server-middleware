/* eslint no-console:off */
const chai       = require('chai')
const requireNew = require('require-uncached')
const should     = chai.should()
const sinon      = require('sinon')
const sinonChai  = require('sinon-chai')
chai.use(sinonChai)

describe('Logger ::', () => {
  it('should be exported from index', () => {
    const mainExports = requireNew('../lib')
    should.exist(mainExports)
    should.exist(mainExports.Logger)
    should.exist(mainExports.Logger.log)
    mainExports.Logger.log.should.be.a('function')
  })

  describe('Log Level ::', () => {
    let Logger
    let sandbox

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      Logger = requireNew('../lib/logger')
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should not show debug when level is "INFO"', () => {
      sandbox.stub(console, 'log')
      Logger.setLogLevel('INFO')
      Logger.default.debug('asdf')
      console.log.should.not.have.been.called
      Logger.default.info('qwert')
      console.log.should.have.been.called
    })
    it('should not show debug when level is "LOG"', () => {
      sandbox.stub(console, 'log')
      Logger.setLogLevel('LOG')
      Logger.default.debug('asdf')
      console.log.should.not.have.been.called
      Logger.default.log('qwert')
      console.log.should.have.been.called
    })
    it('should not show log when level is "WARN"', () => {
      sandbox.stub(console, 'log')
      Logger.setLogLevel('WARN')
      Logger.default.log('asdf')
      console.log.should.not.have.been.called
      Logger.default.warn('qwert')
      console.log.should.have.been.called
    })
    it('should not show info when level is "WARN"', () => {
      sandbox.stub(console, 'log')
      Logger.setLogLevel('WARN')
      Logger.default.info('asdf')
      console.log.should.not.have.been.called
    })
    it('should not show warning when level is "ERROR"', () => {
      sandbox.stub(console, 'log')
      Logger.setLogLevel('ERROR')
      Logger.default.warn('asdf')
      console.log.should.not.have.been.called
      Logger.default.error('qwert')
      console.log.should.have.been.called
    })
    it('should not show anything when level is "NONE"', () => {
      sandbox.stub(console, 'log')
      Logger.setLogLevel('NONE')
      Logger.default.error('asdf')
      console.log.should.not.have.been.called
    })
    it('should have default level of "NONE"', () => {
      sandbox.stub(console, 'log')
      Logger.setLogLevel('qwerqwer')
      Logger.default.error('asdf')
      console.log.should.not.have.been.called
    })
  })
})
