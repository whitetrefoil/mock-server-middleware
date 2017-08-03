import * as path from 'path'
import { IncomingMessage } from 'http'
import { IMockServerConfig } from '../src/msm'

describe('Utilities ::', () => {
  jest.resetModules()

  beforeEach(() => {
    jest.resetModules()
  })

  describe('.composeModulePath()', () => {
    const { composeModulePath } = require('../src/utils')
    const mockReq: IncomingMessage = {
      url: '/Test_Something/Url-item/1?asdf=1234',
      method: 'POST',
    } as any
    const basicConfig: IMockServerConfig = {
      apiDir: 'stubapi',
      lowerCase: false,
      nonChar: '-',
      preserveQuery: false,
    }

    it('should basically works', () => {
      expect(composeModulePath(mockReq, basicConfig))
        .toBe(path.join(process.cwd(), 'stubapi/post/Test-Something/Url-item/1'))
    })

    describe('config', () => {
      it('should work with #apiDir', () => {
        expect(composeModulePath(mockReq, {...basicConfig, apiDir: 'testApiDir'}))
          .toBe(path.join(process.cwd(), 'testApiDir/post/Test-Something/Url-item/1'))
      })

      it('should work with #lowerCase', () => {
        expect(composeModulePath(mockReq, {...basicConfig, lowerCase: true}))
          .toBe(path.join(process.cwd(), 'stubapi/post/test-something/url-item/1'))
      })

      it('should work with #nonChar', () => {
        expect(composeModulePath(mockReq, {...basicConfig, nonChar: '+'}))
          .toBe(path.join(process.cwd(), 'stubapi/post/Test+Something/Url+item/1'))
      })

      it('should work with #preserveQuery', () => {
        expect(composeModulePath(mockReq, {...basicConfig, preserveQuery: true}))
          .toBe(path.join(process.cwd(), 'stubapi/post/Test-Something/Url-item/1-asdf-1234'))
      })

      it('should work with multiple config options', () => {
        expect(composeModulePath(mockReq, {
          apiDir: 'TEST_DIR',
          lowerCase: true,
          nonChar: 'T',
          preserveQuery: true,
        }))
          .toBe(path.join(process.cwd(), 'TEST_DIR/post/testTsomething/urlTitem/1TasdfT1234'))
      })

      it('should ignore hash', () => {
        const mockReqWithHash: IncomingMessage = {
          url: '/Test_Something/Url-item/1?asdf=1234#zxcv?qwe=987654',
          method: 'POST',
        } as any
        expect(composeModulePath(mockReqWithHash, {...basicConfig, preserveQuery: true}))
          .toBe(path.join(process.cwd(), 'stubapi/post/Test-Something/Url-item/1-asdf-1234'))
      })
    })
  })

  describe('.convertJsonToHandler()', () => {
    it('should basically works', () => {
      const { convertJsonToHandler } = require('../src/utils')

      const jsonDef = {
        code: 201,
        headers: {
          'X-Test-Header': 'test',
        },
        body: {
          test: 1,
        },
      }

      const handler = convertJsonToHandler(jsonDef)

      expect(typeof handler).toBe('function')

      const mockRes = {
        statusCode: null,
        setHeader: jest.fn(),
        end: jest.fn(),
      }
      mockRes.end = jest.fn()
      handler(null, mockRes)

      expect(mockRes.statusCode).toBe(201)
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Test-Header', 'test')
      expect(mockRes.end).toBeCalledWith('{\n  "test": 1\n}')
    })
  })

  describe.skip('.loadModule()', () => {
    // TODO
  })
})
