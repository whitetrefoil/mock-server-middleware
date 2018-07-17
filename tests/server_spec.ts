import chai, { expect } from 'chai'
import { Context } from 'koa'
import sinon, { SinonFakeTimers } from 'sinon'
import sinonChai from 'sinon-chai'
import MSM from '../src/msm'

chai.use(sinonChai)

describe('Server', () => {
  const mockConfig = {
    apiDir       : 'stubapi',
    lowerCase    : false,
    nonChar      : '-',
    preserveQuery: false,
  }

  afterEach(() => {
    sinon.restore()
  })

  describe('test support ::', () => {
    describe('response manipulation ::', () => {
      describe('server#once()', () => {
        it('should only change the response once', async() => {
          const mockCtxBeforeOnce = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context

          const mockCtxAfterOnce = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context

          const mockCtxSecondAfterOnce = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context

          const mockNext = () => Promise.resolve()
          const expectedResponse = { code: 200, body: 'OK' }

          const msm        = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server     = msm.server

          await middleware(mockCtxBeforeOnce, mockNext)
          server.once('GET', '/api/user/1', expectedResponse)
          await middleware(mockCtxAfterOnce, mockNext)
          await middleware(mockCtxSecondAfterOnce, mockNext)

          expect(mockCtxBeforeOnce.status).to.equal(404)
          expect(mockCtxAfterOnce.status).to.equal(200)
          expect(mockCtxAfterOnce.body).to.equal('OK')
          expect(mockCtxSecondAfterOnce.status).to.equal(404)
        })
      })

      describe('server#on()', () => {
        it('should change all later responses', async() => {
          const mockCtxBeforeOn = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context

          const mockCtxAfterOn = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context

          const mockCtxSecondAfterOn = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context

          const mockNext = () => Promise.resolve()
          const expectedResponse = { code: 200, body: 'OK' }

          const msm        = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server     = msm.server

          await middleware(mockCtxBeforeOn, mockNext)
          server.on('GET', '/api/user/1', expectedResponse)
          await middleware(mockCtxAfterOn, mockNext)
          await middleware(mockCtxSecondAfterOn, mockNext)

          expect(mockCtxBeforeOn.status).to.equal(404)
          expect(mockCtxAfterOn.status).to.equal(200)
          expect(mockCtxAfterOn.body).to.equal('OK')
          expect(mockCtxSecondAfterOn.status).to.equal(200)
          expect(mockCtxSecondAfterOn.body).to.equal('OK')
        })

        it('should support of JSON w/ comments', async() => {
          const mockCtx = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context

          const mockNext = () => Promise.resolve()
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

          server.on('GET', '/api/user/1', mockJsonDef)
          await middleware(mockCtx, mockNext)

          expect(mockCtx.status).to.equal(200)
          expect(mockCtx.body).to.equal('OK')
        })
      })

      describe('server#off()', () => {
        it('should cancel all "server#on()" if neither parameters given', async() => {
          const mockCtx1Before = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context

          const mockCtx2Before = {
            request: { method: 'GET', url: '/api/user/2' },
            set    : sinon.fake(),
          } as any as Context

          const mockCtx1After = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context

          const mockCtx2After = {
            request: { method: 'GET', url: '/api/user/2' },
            set    : sinon.fake(),
          } as any as Context

          const mockNext = () => Promise.resolve()
          const expectedResponse = { code: 200, body: 'OK' }

          const msm        = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server     = msm.server

          server.on('GET', '/api/user/1', expectedResponse)
          server.on('GET', '/api/user/2', expectedResponse)
          await middleware(mockCtx1Before, mockNext)
          await middleware(mockCtx2Before, mockNext)
          server.off()
          await middleware(mockCtx1After, mockNext)
          await middleware(mockCtx2After, mockNext)

          expect(mockCtx1Before.status).to.equal(200)
          expect(mockCtx2Before.status).to.equal(200)
          expect(mockCtx1Before.body).to.equal('OK')
          expect(mockCtx2Before.body).to.equal('OK')
          expect(mockCtx1After.status).to.equal(404)
          expect(mockCtx2After.status).to.equal(404)
        })

        it('should only cancel the specified path of ".on()" if both parameters given', async() => {
          const mockCtx1Before = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context

          const mockCtx2Before = {
            request: { method: 'GET', url: '/api/user/2' },
            set    : sinon.fake(),
          } as any as Context

          const mockCtx1After = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context

          const mockCtx2After = {
            request: { method: 'GET', url: '/api/user/2' },
            set    : sinon.fake(),
          } as any as Context

          const mockNext = () => Promise.resolve()
          const expectedResponse = { code: 200, body: 'OK' }

          const msm        = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server     = msm.server

          server.on('GET', '/api/user/1', expectedResponse)
          server.on('GET', '/api/user/2', expectedResponse)
          await middleware(mockCtx1Before, mockNext)
          await middleware(mockCtx2Before, mockNext)
          server.off('GET', '/api/user/1')
          await middleware(mockCtx1After, mockNext)
          await middleware(mockCtx2After, mockNext)

          expect(mockCtx1Before.status).to.equal(200)
          expect(mockCtx2Before.status).to.equal(200)
          expect(mockCtx1Before.body).to.equal('OK')
          expect(mockCtx2Before.body).to.equal('OK')
          expect(mockCtx1After.status).to.equal(404)
          expect(mockCtx2After.status).to.equal(200)
          expect(mockCtx2Before.body).to.equal('OK')
        })

        it('should throw an error if only one parameter given', async() => {
          const msm    = new MSM(mockConfig)
          const server = msm.server

          expect(() => {
            server.off('get')
          }).to.throw()
        })
      })
    })

    describe('response recording ::', () => {
      it('should only start recording once called "server#record()"', async() => {
        const mockCtx1 = {
          request: { method: 'GET', url: '/api/user/1' },
          set    : sinon.fake(),
        } as any as Context
        const mockCtx2 = {
          request: { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } },
          set    : sinon.fake(),
        } as any as Context
        const mockCtx3 = {
          request: { method: 'DELETE', url: '/api/user/3?param=value' },
          set    : sinon.fake(),
        } as any as Context
        const mockNext = () => Promise.resolve()

        const msm        = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server     = msm.server

        await middleware(mockCtx1, mockNext)

        server.record()

        await middleware(mockCtx2, mockNext)
        await middleware(mockCtx3, mockNext)

        expect(server.called().length).to.equal(2)
      })

      it('should filter the requests if passing parameters to "server#called()"', async() => {
        const mockCtx1 = {
          request: { method: 'GET', url: '/api/user/1' },
          set    : sinon.fake(),
        } as any as Context
        const mockCtx2 = {
          request: { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } },
          set    : sinon.fake(),
        } as any as Context
        const mockCtx3 = {
          request: { method: 'DELETE', url: '/api/user/3?param=value' },
          set    : sinon.fake(),
        } as any as Context
        const mockNext = () => Promise.resolve()


        const msm        = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server     = msm.server

        server.record()

        await middleware(mockCtx1, mockNext)
        await middleware(mockCtx2, mockNext)
        await middleware(mockCtx3, mockNext)

        expect(server.called().length).to.equal(3)
        expect(server.called(undefined, 'GET').length).to.equal(1)
        expect(server.called('/api/user/2').length).to.equal(1)
        expect(server.called(/.*\/user\/\d+$/).length).to.equal(3)
        expect(server.called(/.*\/user\/\d+$/, 'POST').length).to.equal(1)
      })

      it('should stop recording once called "server#stopRecording()"', async() => {
        const mockCtx1 = {
          request: { method: 'GET', url: '/api/user/1' },
          set    : sinon.fake(),
        } as any as Context
        const mockCtx2 = {
          request: { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } },
          set    : sinon.fake(),
        } as any as Context
        const mockCtx3 = {
          request: { method: 'DELETE', url: '/api/user/3?param=value' },
          set    : sinon.fake(),
        } as any as Context
        const mockNext = () => Promise.resolve()


        const msm        = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server     = msm.server

        server.record()

        await middleware(mockCtx1, mockNext)
        await middleware(mockCtx2, mockNext)

        server.stopRecording()

        await middleware(mockCtx3, mockNext)

        expect(server.called().length).to.equal(2)
      })

      it('should remove all logs once called "server#flush()', async() => {
        const mockCtx1 = {
          request: { method: 'GET', url: '/api/user/1' },
          set    : sinon.fake(),
        } as any as Context
        const mockCtx2 = {
          request: { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } },
          set    : sinon.fake(),
        } as any as Context
        const mockCtx3 = {
          request: { method: 'DELETE', url: '/api/user/3?param=value' },
          set    : sinon.fake(),
        } as any as Context
        const mockNext = () => Promise.resolve()

        const msm        = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server     = msm.server

        server.record()

        await middleware(mockCtx1, mockNext)
        await middleware(mockCtx2, mockNext)
        await middleware(mockCtx3, mockNext)

        expect(server.called().length).to.equal(3)

        server.flush()

        expect(server.called().length).to.equal(0)
      })

      it('should throw error if start when already started recording', async() => {
        const msm    = new MSM(mockConfig)
        const server = msm.server

        server.record()

        expect(() => { server.record() }).to.throw()
      })

      it('should not start recording if the previous stopped recording hasn\'t been flushed', async() => {
        const mockCtx1 = {
          request: { method: 'GET', url: '/api/user/1' },
          set    : sinon.fake(),
        } as any as Context
        const mockNext = () => Promise.resolve()

        const msm        = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server     = msm.server

        server.record()
        await middleware(mockCtx1, mockNext)
        server.stopRecording()

        expect(() => { server.record() }).to.throw()
      })

      it(
        'should allow to start recording even the previous haven\'t been flushed if explicitly requested to',
        async() => {
          const mockCtx1 = {
            request: { method: 'GET', url: '/api/user/1' },
            set    : sinon.fake(),
          } as any as Context
          const mockNext = () => Promise.resolve()

          const msm        = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server     = msm.server

          server.record()
          await middleware(mockCtx1, mockNext)
          server.stopRecording()

          expect(() => { server.record(true) }).not.to.throw()
        },
      )
    })
  })
})
