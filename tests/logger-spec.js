const chai       = require('chai')
const requireNew = require('require-uncached')
const should     = chai.should()

describe('Logger ::', () => {
  it('should be exported from index', () => {
    const mainExports = requireNew('../lib')
    should.exist(mainExports)
    should.exist(mainExports.Logger)
    should.exist(mainExports.Logger.log)
    mainExports.Logger.log.should.be.a('function')
  })
})
