const _          = require('lodash')
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
      const mockReq              = { method: 'GET', url: '/api/user/1' }
      const mockResBeforeOn      = { end: sandbox.spy() }
      const mockResAfterOn       = { end: sandbox.spy() }
      const mockResSecondAfterOn = { end: sandbox.spy() }
      const mockNext             = sandbox.spy()
      const expectedResponse     = { code: 200, body: 'OK' }

      const msm = requireNew('../lib')
      msm.initialize()
      const server = msm.server
      msm.middleware(mockReq, mockResBeforeOn, mockNext)
      server.on(mockReq.method, mockReq.url, expectedResponse)
      msm.middleware(mockReq, mockResAfterOn, mockNext)
      msm.middleware(mockReq, mockResSecondAfterOn, mockNext)
      setTimeout(() => {
        mockResBeforeOn.statusCode.should.equal(404)
        mockResAfterOn.statusCode.should.equal(200)
        mockResAfterOn.end.should.have.been.calledWith('"OK"')
        mockResSecondAfterOn.statusCode.should.equal(200)
        mockResSecondAfterOn.end.should.have.been.calledWith('"OK"')
        done()
      }, 0)
    })
  })

  describe('.off()', () => {
    it('should cancel the effect of all ".on()" if neither parameters given', (done) => {
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

    it('should only cancel the specified path of ".on()" if both parameters given', (done) => {
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

    it('should throw an error if only one parameter given', () => {
      const msm = requireNew('../lib')
      msm.initialize()
      const server = msm.server
      should.throw(() => {
        server.off('get')
      }, Error)
    })
  })

  describe('E2E test support', () => {

    let msm = requireNew('../lib')

    beforeEach(() => {
      const mockReq1 = { method: 'GET', url: '/api/user/1' }
      const mockReq2 = { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } }
      const mockReq3 = { method: 'DELETE', url: '/api/user/3?param=value' }

      msm.server.record()
      msm.initialize()

      msm.middleware(mockReq1, { end: _.noop }, _.noop)
      msm.middleware(mockReq2, { end: _.noop }, _.noop)
      msm.middleware(mockReq3, { end: _.noop }, _.noop)
    })

    afterEach(() => {
      msm.server.flush()
    })

    describe('.stopRecording()', () => {
      it('should stop recording but not to cleanup logs of requests', (done) => {
        const mockReq4 = { method: 'GET', url: '/api/user/4' }
        const mockReq5 = { method: 'GET', url: '/api/user/5' }
        setTimeout(() => {
          msm.server.called().length.should.equal(3)
          msm.middleware(mockReq4, { end: _.noop }, _.noop)
          msm.server.called().length.should.equal(4)
          msm.server.stopRecording()
          msm.middleware(mockReq5, { end: _.noop }, _.noop)
          msm.server.called().length.should.equal(4)
          done()
        }, 0)
      })
    })

    describe('.flush()', () => {
      it('should remove all logs of requests', (done) => {
        setTimeout(() => {
          msm.server.called().length.should.equal(3)
          msm.server.flush()
          msm.server.called().length.should.equal(0)
          done()
        }, 0)
      })
    })

    describe('.called()', () => {
      it('should return a list off all previous requests', (done) => {
        setTimeout(() => {
          const called = msm.server.called()
          called.length.should.equal(3)

          called[0].method.should.equal('get')
          called[0].href.should.equal('/api/user/1')
          should.not.exist(called[0].body)

          called[1].method.should.equal('post')
          called[1].href.should.equal('/api/user/2')
          called[1].body.should.eql({ id: 1, name: 'tester' })

          called[2].method.should.equal('delete')
          called[2].href.should.equal('/api/user/3?param=value')
          called[2].pathname.should.equal('/api/user/3')
          called[2].search.should.equal('?param=value')
          called[2].query.param.should.equal('value')

          done()
        }, 0)
      })
    })

    describe('.called(path: string)', () => {
      it('should filter the request list', (done) => {
        setTimeout(() => {
          msm.server.called('/api').length.should.equal(3)
          msm.server.called('/api/user/1').length.should.equal(1)
          msm.server.called('/api/user/4').length.should.equal(0)
          done()
        }, 0)
      })
    })

    describe('.called(path: string, method: string)', () => {
      it('should filter the request list', (done) => {
        setTimeout(() => {
          msm.server.called('/api', 'get').length.should.equal(1)
          msm.server.called('/api', 'POST').length.should.equal(1)
          msm.server.called('/api', 'put').length.should.equal(0)
          msm.server.called(null, 'get').length.should.equal(1)
          done()
        }, 0)
      })
    })

    describe('.called(path: RegExp, method: string)', () => {
      it('should filter the request list', (done) => {
        setTimeout(() => {
          msm.server.called(/\/api\/user/, 'get').length.should.equal(1)
          msm.server.called(/user/, 'POST').length.should.equal(0)
          msm.server.called(/.*\/api\//).length.should.equal(3)
          done()
        }, 0)
      })
    })
  })
})
