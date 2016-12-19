const chai       = require('chai')
const requireNew = require('require-uncached')
const should     = chai.should()
const sinon      = require('sinon')
const sinonChai  = require('sinon-chai')
chai.use(sinonChai)

describe('Server ::', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('.once()', () => {
    it('should affect only the next request', (done) => {
      const mockReq                = { method: 'GET', url: '/api/user/1' }
      const mockResBeforeOnce      = { end: sandbox.spy() }
      const mockResAfterOnce       = { end: sandbox.spy() }
      const mockResSecondAfterOnce = { end: sandbox.spy() }
      const mockNext               = sandbox.spy()
      const expectedResponse       = { code: 200, body: 'OK' }

      const msm = requireNew('../lib')
      msm.initialize()
      const server = msm.server
      msm.middleware(mockReq, mockResBeforeOnce, mockNext)
      server.once(mockReq.method, mockReq.url, expectedResponse)
      msm.middleware(mockReq, mockResAfterOnce, mockNext)
      msm.middleware(mockReq, mockResSecondAfterOnce, mockNext)
      setTimeout(() => {
        mockResBeforeOnce.statusCode.should.equal(404)
        mockResAfterOnce.statusCode.should.equal(200)
        mockResAfterOnce.end.should.have.been.calledWith('"OK"')
        mockResSecondAfterOnce.statusCode.should.equal(404)
        done()
      }, 0)
    })
  })

  describe('.on()', () => {
    it('should affect & won\' been canceled automatically', (done) => {
      const mockReq                = { method: 'GET', url: '/api/user/1' }
      const mockResBeforeOnce      = { end: sandbox.spy() }
      const mockResAfterOnce       = { end: sandbox.spy() }
      const mockResSecondAfterOnce = { end: sandbox.spy() }
      const mockNext               = sandbox.spy()
      const expectedResponse       = { code: 200, body: 'OK' }

      const msm = requireNew('../lib')
      msm.initialize()
      const server = msm.server
      msm.middleware(mockReq, mockResBeforeOnce, mockNext)
      server.on(mockReq.method, mockReq.url, expectedResponse)
      msm.middleware(mockReq, mockResAfterOnce, mockNext)
      msm.middleware(mockReq, mockResSecondAfterOnce, mockNext)
      setTimeout(() => {
        mockResBeforeOnce.statusCode.should.equal(404)
        mockResAfterOnce.statusCode.should.equal(200)
        mockResAfterOnce.end.should.have.been.calledWith('"OK"')
        mockResSecondAfterOnce.statusCode.should.equal(200)
        mockResSecondAfterOnce.end.should.have.been.calledWith('"OK"')
        done()
      }, 0)
    })
  })

  describe('.off()', () => {
    it('should cancel the effect of all ".on()"', (done) => {
      const mockReq1          = { method: 'GET', url: '/api/user/1' }
      const mockReq2          = { method: 'GET', url: '/api/user/2' }
      const mockRes1BeforeOff = { end: sandbox.spy() }
      const mockRes2BeforeOff = { end: sandbox.spy() }
      const mockRes1AfterOff  = { end: sandbox.spy() }
      const mockRes2AfterOff  = { end: sandbox.spy() }
      const mockNext          = sandbox.spy()
      const expectedResponse  = { code: 200, body: 'OK' }

      const msm = requireNew('../lib')
      msm.initialize()
      const server = msm.server
      server.on(mockReq1.method, mockReq1.url, expectedResponse)
      server.on(mockReq2.method, mockReq2.url, expectedResponse)
      msm.middleware(mockReq1, mockRes1BeforeOff, mockNext)
      msm.middleware(mockReq2, mockRes2BeforeOff, mockNext)
      server.off()
      msm.middleware(mockReq1, mockRes1AfterOff, mockNext)
      msm.middleware(mockReq2, mockRes2AfterOff, mockNext)
      setTimeout(() => {
        mockRes1BeforeOff.statusCode.should.equal(200)
        mockRes2BeforeOff.statusCode.should.equal(200)
        mockRes1BeforeOff.end.should.have.been.calledWith('"OK"')
        mockRes2BeforeOff.end.should.have.been.calledWith('"OK"')
        mockRes1AfterOff.statusCode.should.equal(404)
        mockRes2AfterOff.statusCode.should.equal(404)
        done()
      }, 0)
    })

    it('should only cancel the specified path of ".on()"', (done) => {
      const mockReq1          = { method: 'GET', url: '/api/user/1' }
      const mockReq2          = { method: 'GET', url: '/api/user/2' }
      const mockRes1BeforeOff = { end: sandbox.spy() }
      const mockRes2BeforeOff = { end: sandbox.spy() }
      const mockRes1AfterOff  = { end: sandbox.spy() }
      const mockRes2AfterOff  = { end: sandbox.spy() }
      const mockNext          = sandbox.spy()
      const expectedResponse  = { code: 200, body: 'OK' }

      const msm = requireNew('../lib')
      msm.initialize()
      const server = msm.server
      server.on(mockReq1.method, mockReq1.url, expectedResponse)
      server.on(mockReq2.method, mockReq2.url, expectedResponse)
      msm.middleware(mockReq1, mockRes1BeforeOff, mockNext)
      msm.middleware(mockReq2, mockRes2BeforeOff, mockNext)
      server.off(mockReq1.method, mockReq1.url)
      msm.middleware(mockReq1, mockRes1AfterOff, mockNext)
      msm.middleware(mockReq2, mockRes2AfterOff, mockNext)
      setTimeout(() => {
        mockRes1BeforeOff.statusCode.should.equal(200)
        mockRes2BeforeOff.statusCode.should.equal(200)
        mockRes1BeforeOff.end.should.have.been.calledWith('"OK"')
        mockRes2BeforeOff.end.should.have.been.calledWith('"OK"')
        mockRes1AfterOff.statusCode.should.equal(404)
        mockRes2AfterOff.statusCode.should.equal(200)
        mockRes2BeforeOff.end.should.have.been.calledWith('"OK"')
        done()
      }, 0)
    })
  })
})
