import chai, { expect } from 'chai'
import sinon, { SinonFakeTimers } from 'sinon'
import sinonChai from 'sinon-chai'
import MSM from '../src/msm'
import { mockRes } from './helpers'

chai.use(sinonChai)

describe('Server', () => {
  const mockConfig = {
    apiDir       : 'stubapi',
    lowerCase    : false,
    nonChar      : '-',
    preserveQuery: false,
  }

  let clock: SinonFakeTimers

  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('test support ::', () => {
    describe('response manipulation ::', () => {
      describe('server#once()', () => {
        it('should only change the response once', () => {
          const mockReq                = { method: 'GET', url: '/api/user/1' } as any
          const mockResBeforeOnce      = mockRes(sinon)
          const mockResAfterOnce       = mockRes(sinon)
          const mockResSecondAfterOnce = mockRes(sinon)
          const mockNext               = sinon.stub()
          const expectedResponse       = { code: 200, body: 'OK' }

          const msm        = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server     = msm.server

          middleware(mockReq, mockResBeforeOnce, mockNext)
          server.once(mockReq.method, mockReq.url, expectedResponse)
          middleware(mockReq, mockResAfterOnce, mockNext)
          middleware(mockReq, mockResSecondAfterOnce, mockNext)

          clock.runAll()

          expect(mockResBeforeOnce.statusCode).to.equal(404)
          expect(mockResAfterOnce.statusCode).to.equal(200)
          expect(mockResAfterOnce.end).to.have.been.calledWith('"OK"')
          expect(mockResSecondAfterOnce.statusCode).to.equal(404)
        })
      })

      describe('server#on()', () => {
        it('should change all later responses', () => {
          const mockReq              = { method: 'GET', url: '/api/user/1' } as any
          const mockResBeforeOn      = mockRes(sinon)
          const mockResAfterOn       = mockRes(sinon)
          const mockResSecondAfterOn = mockRes(sinon)
          const mockNext             = sinon.stub()
          const expectedResponse     = { code: 200, body: 'OK' }

          const msm        = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server     = msm.server

          middleware(mockReq, mockResBeforeOn, mockNext)
          server.on(mockReq.method, mockReq.url, expectedResponse)
          middleware(mockReq, mockResAfterOn, mockNext)
          middleware(mockReq, mockResSecondAfterOn, mockNext)

          clock.runAll()

          expect(mockResBeforeOn.statusCode).to.equal(404)
          expect(mockResAfterOn.statusCode).to.equal(200)
          expect(mockResAfterOn.end).to.have.been.calledWith('"OK"')
          expect(mockResSecondAfterOn.statusCode).to.equal(200)
          expect(mockResSecondAfterOn.end).to.have.been.calledWith('"OK"')
        })

        it('should support of JSON w/ comments', () => {
          const mockReq     = { method: 'GET', url: '/api/user/1' } as any
          const mockRes1    = mockRes(sinon)
          const mockNext    = sinon.fake()
          const mockJsonDef = `
            {
              "code": 200,
              // This is a comment.
              "body": "OK"
            }
          `

          const msm        = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server     = msm.server

          server.on(mockReq.method, mockReq.url, mockJsonDef)
          middleware(mockReq, mockRes1, mockNext)

          clock.runAll()

          expect(mockRes1.statusCode).to.equal(200)
          expect(mockRes1.end).to.have.been.calledWith('"OK"')
        })
      })

      describe('server#off()', () => {
        it('should cancel all "server#on()" if neither parameters given', () => {
          const mockReq1          = { method: 'GET', url: '/api/user/1' } as any
          const mockReq2          = { method: 'GET', url: '/api/user/2' } as any
          const mockRes1BeforeOff = mockRes(sinon)
          const mockRes2BeforeOff = mockRes(sinon)
          const mockRes1AfterOff  = mockRes(sinon)
          const mockRes2AfterOff  = mockRes(sinon)
          const mockNext          = sinon.fake()
          const expectedResponse  = { code: 200, body: 'OK' }

          const msm        = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server     = msm.server

          server.on(mockReq1.method, mockReq1.url, expectedResponse)
          server.on(mockReq2.method, mockReq2.url, expectedResponse)
          middleware(mockReq1, mockRes1BeforeOff, mockNext)
          middleware(mockReq2, mockRes2BeforeOff, mockNext)
          server.off()
          middleware(mockReq1, mockRes1AfterOff, mockNext)
          middleware(mockReq2, mockRes2AfterOff, mockNext)

          clock.runAll()

          expect(mockRes1BeforeOff.statusCode).to.equal(200)
          expect(mockRes2BeforeOff.statusCode).to.equal(200)
          expect(mockRes1BeforeOff.end).to.have.been.calledWith('"OK"')
          expect(mockRes2BeforeOff.end).to.have.been.calledWith('"OK"')
          expect(mockRes1AfterOff.statusCode).to.equal(404)
          expect(mockRes2AfterOff.statusCode).to.equal(404)
        })

        it('should only cancel the specified path of ".on()" if both parameters given', () => {
          const mockReq1          = { method: 'GET', url: '/api/user/1' } as any
          const mockReq2          = { method: 'GET', url: '/api/user/2' } as any
          const mockRes1BeforeOff = mockRes(sinon)
          const mockRes2BeforeOff = mockRes(sinon)
          const mockRes1AfterOff  = mockRes(sinon)
          const mockRes2AfterOff  = mockRes(sinon)
          const mockNext          = sinon.fake()
          const expectedResponse  = { code: 200, body: 'OK' }

          const msm        = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server     = msm.server

          server.on(mockReq1.method, mockReq1.url, expectedResponse)
          server.on(mockReq2.method, mockReq2.url, expectedResponse)
          middleware(mockReq1, mockRes1BeforeOff, mockNext)
          middleware(mockReq2, mockRes2BeforeOff, mockNext)
          server.off(mockReq1.method, mockReq1.url)
          middleware(mockReq1, mockRes1AfterOff, mockNext)
          middleware(mockReq2, mockRes2AfterOff, mockNext)

          clock.runAll()

          expect(mockRes1BeforeOff.statusCode).to.equal(200)
          expect(mockRes2BeforeOff.statusCode).to.equal(200)
          expect(mockRes1BeforeOff.end).to.have.been.calledWith('"OK"')
          expect(mockRes2BeforeOff.end).to.have.been.calledWith('"OK"')
          expect(mockRes1AfterOff.statusCode).to.equal(404)
          expect(mockRes2AfterOff.statusCode).to.equal(200)
          expect(mockRes2BeforeOff.end).to.have.been.calledWith('"OK"')
        })

        it('should throw an error if only one parameter given', () => {
          const msm    = new MSM(mockConfig)
          const server = msm.server

          expect(() => {
            server.off('get')
          }).to.throw()
        })
      })
    })

    describe('response recording ::', () => {
      it('should only start recording once called "server#record()"', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any
        const mockReq2 = { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } } as any
        const mockReq3 = { method: 'DELETE', url: '/api/user/3?param=value' } as any
        const mockRes1 = mockRes(sinon)
        const mockNext = sinon.fake()


        const msm        = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server     = msm.server

        middleware(mockReq1, mockRes1, mockNext)

        server.record()

        middleware(mockReq2, mockRes1, mockNext)
        middleware(mockReq3, mockRes1, mockNext)

        expect(server.called().length).to.equal(2)
      })

      it('should filter the requests if passing parameters to "server#called()"', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any
        const mockReq2 = { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } } as any
        const mockReq3 = { method: 'DELETE', url: '/api/user/3?param=value' } as any
        const mockRes1 = mockRes(sinon)
        const mockNext = sinon.fake()


        const msm        = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server     = msm.server

        server.record()

        middleware(mockReq1, mockRes1, mockNext)
        middleware(mockReq2, mockRes1, mockNext)
        middleware(mockReq3, mockRes1, mockNext)

        expect(server.called().length).to.equal(3)
        expect(server.called(undefined, 'GET').length).to.equal(1)
        expect(server.called('/api/user/2').length).to.equal(1)
        expect(server.called(/.*\/user\/\d+$/).length).to.equal(3)
        expect(server.called(/.*\/user\/\d+$/, 'POST').length).to.equal(1)
      })

      it('should stop recording once called "server#stopRecording()"', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any
        const mockReq2 = { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } } as any
        const mockReq3 = { method: 'DELETE', url: '/api/user/3?param=value' } as any
        const mockRes1 = mockRes(sinon)
        const mockNext = sinon.fake()


        const msm        = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server     = msm.server

        server.record()

        middleware(mockReq1, mockRes1, mockNext)
        middleware(mockReq2, mockRes1, mockNext)

        server.stopRecording()

        middleware(mockReq3, mockRes1, mockNext)

        expect(server.called().length).to.equal(2)
      })

      it('should remove all logs once called "server#flush()', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any
        const mockReq2 = { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } } as any
        const mockReq3 = { method: 'DELETE', url: '/api/user/3?param=value' } as any
        const mockRes1 = mockRes(sinon)
        const mockNext = sinon.fake()

        const msm        = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server     = msm.server

        server.record()

        middleware(mockReq1, mockRes1, mockNext)
        middleware(mockReq2, mockRes1, mockNext)
        middleware(mockReq3, mockRes1, mockNext)

        expect(server.called().length).to.equal(3)

        server.flush()

        expect(server.called().length).to.equal(0)
      })

      it('should throw error if start when already started recording', () => {
        const msm    = new MSM(mockConfig)
        const server = msm.server

        server.record()

        expect(() => { server.record() }).to.throw()
      })

      it('should not start recording if the previous stopped recording hasn\'t been flushed', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any
        const mockRes1 = mockRes(sinon)
        const mockNext = sinon.fake()

        const msm        = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server     = msm.server

        server.record()
        middleware(mockReq1, mockRes1, mockNext)
        server.stopRecording()

        expect(() => { server.record() }).to.throw()
      })

      it('should allow to start recording even the previous haven\'t been flushed if explicitly requested to', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any
        const mockRes1 = mockRes(sinon)
        const mockNext = sinon.fake()

        const msm        = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server     = msm.server

        server.record()
        middleware(mockReq1, mockRes1, mockNext)
        server.stopRecording()

        expect(() => { server.record(true) }).not.to.throw()
      })
    })
  })
})
