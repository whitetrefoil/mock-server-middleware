const chai       = require('chai')
const path       = require('path')
const requireNew = require('require-uncached')
const should     = chai.should()
const sinon      = require('sinon')
const sinonChai  = require('sinon-chai')
chai.use(sinonChai)

describe('Config ::', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('"apiPrefixes"', () => {
    it('should not handle any request not started with specified prefix', () => {
      const msm = requireNew('../lib')
      msm.initialize({
        apiPrefixes: ['/prefix1/', '/prefix2/'],
      })

      const mockNext1 = sandbox.spy()
      msm.middleware({ method: 'GET', url: '/prefix1/test/2' }, {}, mockNext1)
      mockNext1.should.not.have.been.called

      const mockNext2 = sandbox.spy()
      msm.middleware({ method: 'GET', url: '/prefix2/test/2' }, {}, mockNext2)
      mockNext2.should.not.have.been.called

      const mockNext3 = sandbox.spy()
      msm.middleware({ method: 'GET', url: '/prefix3/test/2' }, {}, mockNext3)
      mockNext3.should.have.been.calledOnce
    })
  })

  describe('"apiDir"', () => {
    it('should be prepend to module path', () => {
      const msm = requireNew('../lib')
      msm.initialize({
        apiDir: 'testDir',
      })

      msm.composeModulePath({ method: 'GET', url: '/api/test/path' })
        .should.equal(path.join(process.cwd(), 'testDir/get/api/test/path'))
    })
  })

  describe('"nonChar"', () => {
    it('should replace special chars with given one', () => {
      const msm = requireNew('../lib')
      msm.initialize({
        nonChar: '@',
      })

      msm.composeModulePath({ method: 'GET', url: '/api/tes%t/p~ath' })
        .should.equal(path.join(process.cwd(), 'stubapi/get/api/tes@t/p@ath'))
    })
  })

  describe('"lowerCase"', () => {
    it('should convert all chars to lowercase by default', () => {
      const msm = requireNew('../lib')
      msm.initialize()

      msm.composeModulePath({ method: 'GET', url: '/api/User/Test' })
        .should.equal(path.join(process.cwd(), 'stubapi/get/api/user/test'))
    })

    it('should not touch the cases if set to false', () => {
      const msm = requireNew('../lib')
      msm.initialize({ lowerCase: false })

      msm.composeModulePath({ method: 'GET', url: '/api/User/Test' })
        .should.equal(path.join(process.cwd(), 'stubapi/get/api/User/Test'))
    })
  })

  describe('"ping"', () => {
    it('should not delay the response by default', (done) => {
      const mockReq = { method: 'GET', url: '/api/user/1' }
      const mockRes = { end: sandbox.spy() }
      const mockNext = sandbox.spy()

      const msm = requireNew('../lib')
      msm.initialize()
      msm.middleware(mockReq, mockRes, mockNext)

      mockRes.end.should.not.have.been.called
      mockNext.should.not.have.been.called
      setTimeout(() => {
        mockRes.end.should.have.been.called
        mockNext.should.not.have.been.called
        done()
      }, 0)
    })

    it('should delay the response according to the given option', (done) => {
      const mockReq = { method: 'GET', url: '/api/user/1' }
      const mockRes = { end: sandbox.spy() }
      const mockNext = sandbox.spy()

      const msm = requireNew('../lib')
      msm.initialize({ ping: 200 })
      msm.middleware(mockReq, mockRes, mockNext)

      mockRes.end.should.not.have.been.called
      mockNext.should.not.have.been.called
      setTimeout(() => {
        mockRes.end.should.not.have.been.called
        mockNext.should.not.have.been.called
        done()
      }, 150)
      setTimeout(() => {
        mockRes.end.should.have.been.called
        mockNext.should.not.have.been.called
        done()
      }, 250)
    })
  })

  describe('"preserveQuery"', () => {
    it('should strip the query string by default', () => {
      const msm = requireNew('../lib')
      msm.initialize()

      msm.composeModulePath({ method: 'GET', url: '/api/user/test?id=1' })
        .should.equal(path.join(process.cwd(), 'stubapi/get/api/user/test'))
    })

    it('should not strip the query string if set to true', () => {
      const msm = requireNew('../lib')
      msm.initialize({ preserveQuery: true })

      msm.composeModulePath({ method: 'GET', url: '/api/user/test?id=1' })
        .should.equal(path.join(process.cwd(), 'stubapi/get/api/user/test-id-1'))
    })
  })
})
