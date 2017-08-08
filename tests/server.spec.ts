import MSM, { IMockServerConfig, IRequest } from '../src/msm'
import { mockRes } from './helpers'

jest.useFakeTimers()

describe('Server ::', () => {
  jest.resetModules()

  const mockConfig: IMockServerConfig = {
    apiDir: 'stubapi',
    lowerCase: false,
    nonChar: '-',
    preserveQuery: false,
  }

  beforeEach(() => {
    jest.resetModules()
  })

  describe('test support ::', () => {
    describe('response manipulation ::', () => {
      describe('server#once()', () => {
        it('should only change the response once', () => {
          const mockReq = { method: 'GET', url: '/api/user/1' } as any as IRequest
          const mockResBeforeOnce = mockRes()
          const mockResAfterOnce = mockRes()
          const mockResSecondAfterOnce = mockRes()
          const mockNext = jest.fn()
          const expectedResponse = { code: 200, body: 'OK' }

          const msm = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server = msm.server

          middleware(mockReq, mockResBeforeOnce, mockNext)
          server.once(mockReq.method, mockReq.url, expectedResponse)
          middleware(mockReq, mockResAfterOnce, mockNext)
          middleware(mockReq, mockResSecondAfterOnce, mockNext)

          jest.runAllTimers()

          expect(mockResBeforeOnce.statusCode).toBe(404)
          expect(mockResAfterOnce.statusCode).toBe(200)
          expect(mockResAfterOnce.end).toHaveBeenCalledWith('"OK"')
          expect(mockResSecondAfterOnce.statusCode).toBe(404)
        })
      })

      describe('server#on()', () => {
        it('should change all later responses', () => {
          const mockReq = { method: 'GET', url: '/api/user/1' } as any as IRequest
          const mockResBeforeOn = mockRes()
          const mockResAfterOn = mockRes()
          const mockResSecondAfterOn = mockRes()
          const mockNext = jest.fn()
          const expectedResponse = { code: 200, body: 'OK' }

          const msm = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server = msm.server

          middleware(mockReq, mockResBeforeOn, mockNext)
          server.on(mockReq.method, mockReq.url, expectedResponse)
          middleware(mockReq, mockResAfterOn, mockNext)
          middleware(mockReq, mockResSecondAfterOn, mockNext)

          jest.runAllTimers()

          expect(mockResBeforeOn.statusCode).toBe(404)
          expect(mockResAfterOn.statusCode).toBe(200)
          expect(mockResAfterOn.end).toHaveBeenCalledWith('"OK"')
          expect(mockResSecondAfterOn.statusCode).toBe(200)
          expect(mockResSecondAfterOn.end).toHaveBeenCalledWith('"OK"')
        })

        it('should support of JSON w/ comments', () => {
          const mockReq = { method: 'GET', url: '/api/user/1' } as any as IRequest
          const mockRes1 = mockRes()
          const mockNext = jest.fn()
          const mockJsonDef = `
            {
              "code": 200,
              // This is a comment.
              "body": "OK"
            }
          `

          const msm = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server = msm.server

          server.on(mockReq.method, mockReq.url, mockJsonDef)
          middleware(mockReq, mockRes1, mockNext)

          jest.runAllTimers()

          expect(mockRes1.statusCode).toBe(200)
          expect(mockRes1.end).toHaveBeenCalledWith('"OK"')
        })
      })

      describe('server#off()', () => {
        it('should cancel all "server#on()" if neither parameters given', () => {
          const mockReq1 = { method: 'GET', url: '/api/user/1' } as any as IRequest
          const mockReq2 = { method: 'GET', url: '/api/user/2' } as any as IRequest
          const mockRes1BeforeOff = mockRes()
          const mockRes2BeforeOff = mockRes()
          const mockRes1AfterOff = mockRes()
          const mockRes2AfterOff = mockRes()
          const mockNext = jest.fn()
          const expectedResponse = { code: 200, body: 'OK' }

          const msm = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server = msm.server

          server.on(mockReq1.method, mockReq1.url, expectedResponse)
          server.on(mockReq2.method, mockReq2.url, expectedResponse)
          middleware(mockReq1, mockRes1BeforeOff, mockNext)
          middleware(mockReq2, mockRes2BeforeOff, mockNext)
          server.off()
          middleware(mockReq1, mockRes1AfterOff, mockNext)
          middleware(mockReq2, mockRes2AfterOff, mockNext)

          jest.runAllTimers()

          expect(mockRes1BeforeOff.statusCode).toBe(200)
          expect(mockRes2BeforeOff.statusCode).toBe(200)
          expect(mockRes1BeforeOff.end).toHaveBeenCalledWith('"OK"')
          expect(mockRes2BeforeOff.end).toHaveBeenCalledWith('"OK"')
          expect(mockRes1AfterOff.statusCode).toBe(404)
          expect(mockRes2AfterOff.statusCode).toBe(404)
        })

        it('should only cancel the specified path of ".on()" if both parameters given', () => {
          const mockReq1 = { method: 'GET', url: '/api/user/1' } as any as IRequest
          const mockReq2 = { method: 'GET', url: '/api/user/2' } as any as IRequest
          const mockRes1BeforeOff = mockRes()
          const mockRes2BeforeOff = mockRes()
          const mockRes1AfterOff = mockRes()
          const mockRes2AfterOff = mockRes()
          const mockNext = jest.fn()
          const expectedResponse = { code: 200, body: 'OK' }

          const msm = new MSM(mockConfig)
          const middleware = msm.middleware()
          const server = msm.server

          server.on(mockReq1.method, mockReq1.url, expectedResponse)
          server.on(mockReq2.method, mockReq2.url, expectedResponse)
          middleware(mockReq1, mockRes1BeforeOff, mockNext)
          middleware(mockReq2, mockRes2BeforeOff, mockNext)
          server.off(mockReq1.method, mockReq1.url)
          middleware(mockReq1, mockRes1AfterOff, mockNext)
          middleware(mockReq2, mockRes2AfterOff, mockNext)

          jest.runAllTimers()

          expect(mockRes1BeforeOff.statusCode).toBe(200)
          expect(mockRes2BeforeOff.statusCode).toBe(200)
          expect(mockRes1BeforeOff.end).toHaveBeenCalledWith('"OK"')
          expect(mockRes2BeforeOff.end).toHaveBeenCalledWith('"OK"')
          expect(mockRes1AfterOff.statusCode).toBe(404)
          expect(mockRes2AfterOff.statusCode).toBe(200)
          expect(mockRes2BeforeOff.end).toHaveBeenCalledWith('"OK"')
        })

        it('should throw an error if only one parameter given', () => {
          const msm = new MSM(mockConfig)
          const server = msm.server

          expect(() => {
            server.off('get')
          }).toThrow()
        })
      })
    })

    describe('response recording ::', () => {
      it('should only start recording once called "server#record()"', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any as IRequest
        const mockReq2 = { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } } as any as IRequest
        const mockReq3 = { method: 'DELETE', url: '/api/user/3?param=value' } as any as IRequest
        const mockRes1 = mockRes()
        const mockNext = jest.fn()


        const msm = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server = msm.server

        middleware(mockReq1, mockRes1, mockNext)

        server.record()

        middleware(mockReq2, mockRes1, mockNext)
        middleware(mockReq3, mockRes1, mockNext)

        expect(server.called().length).toBe(2)
      })

      it('should filter the requests if passing parameters to "server#called()"', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any as IRequest
        const mockReq2 = { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } } as any as IRequest
        const mockReq3 = { method: 'DELETE', url: '/api/user/3?param=value' } as any as IRequest
        const mockRes1 = mockRes()
        const mockNext = jest.fn()


        const msm = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server = msm.server

        server.record()

        middleware(mockReq1, mockRes1, mockNext)
        middleware(mockReq2, mockRes1, mockNext)
        middleware(mockReq3, mockRes1, mockNext)

        expect(server.called().length).toBe(3)
        expect(server.called(null, 'GET').length).toBe(1)
        expect(server.called('/api/user/2').length).toBe(1)
        expect(server.called(/.*\/user\/\d+$/).length).toBe(3)
        expect(server.called(/.*\/user\/\d+$/, 'POST').length).toBe(1)
      })

      it('should stop recording once called "server#stopRecording()"', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any as IRequest
        const mockReq2 = { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } } as any as IRequest
        const mockReq3 = { method: 'DELETE', url: '/api/user/3?param=value' } as any as IRequest
        const mockRes1 = mockRes()
        const mockNext = jest.fn()


        const msm = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server = msm.server

        server.record()

        middleware(mockReq1, mockRes1, mockNext)
        middleware(mockReq2, mockRes1, mockNext)

        server.stopRecording()

        middleware(mockReq3, mockRes1, mockNext)

        expect(server.called().length).toBe(2)
      })

      it('should remove all logs once called "server#flush()', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any as IRequest
        const mockReq2 = { method: 'POST', url: '/api/user/2', body: { id: 1, name: 'tester' } } as any as IRequest
        const mockReq3 = { method: 'DELETE', url: '/api/user/3?param=value' } as any as IRequest
        const mockRes1 = mockRes()
        const mockNext = jest.fn()

        const msm = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server = msm.server

        server.record()

        middleware(mockReq1, mockRes1, mockNext)
        middleware(mockReq2, mockRes1, mockNext)
        middleware(mockReq3, mockRes1, mockNext)

        expect(server.called().length).toBe(3)

        server.flush()

        expect(server.called().length).toBe(0)
      })

      it('should throw error if start when already started recording', () => {
        const msm = new MSM(mockConfig)
        const server = msm.server

        server.record()

        expect(() => { server.record() }).toThrow()
      })

      it('should not start recording if the previous stopped recording hasn\'t been flushed', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any as IRequest
        const mockRes1 = mockRes()
        const mockNext = jest.fn()

        const msm = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server = msm.server

        server.record()
        middleware(mockReq1, mockRes1, mockNext)
        server.stopRecording()

        expect(() => { server.record() }).toThrow()
      })

      it('should allow to start recording even the previous haven\'t been flushed if explicitly requested to', () => {
        const mockReq1 = { method: 'GET', url: '/api/user/1' } as any as IRequest
        const mockRes1 = mockRes()
        const mockNext = jest.fn()

        const msm = new MSM(mockConfig)
        const middleware = msm.middleware()
        const server = msm.server

        server.record()
        middleware(mockReq1, mockRes1, mockNext)
        server.stopRecording()

        expect(() => { server.record(true) }).not.toThrow()
      })
    })
  })
})
