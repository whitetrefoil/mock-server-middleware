const chai       = require('chai')
const requireNew = require('require-uncached')
const should     = chai.should()

describe('Basic ::', () => {
  it('should exports correctly', () => {
    const msm = requireNew('../lib')
    msm.initialize.should.be.a('function')
    should.exist(msm.middleware)
    should.exist(msm.server)
  })
})
