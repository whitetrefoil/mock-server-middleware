import chai, { expect } from 'chai'
import { IncomingMessage } from 'http'
import path from 'path'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { LogLevel } from '../src/logger'
import { IMockServerConfig } from '../src/msm'
import { composeModulePath } from '../src/utils'
import { mockRes } from './helpers'

chai.use(sinonChai)

describe('Utilities', () => {

  afterEach(() => {
    sinon.restore()
  })

  describe('.composeModulePath()', () => {
    const mockReq = {
      url   : '/Test_Something/Url-item/1?asdf=1234',
      method: 'POST',
    } as any as Required<IncomingMessage>

    const basicConfig: Required<IMockServerConfig> = {
      apiPrefixes  : [],
      apiDir       : 'stubapi',
      lowerCase    : false,
      nonChar      : '-',
      ping         : 0,
      preserveQuery: false,
      logLevel     : LogLevel.WARN,
    }

    it('should basically works', () => {
      expect(composeModulePath(mockReq, basicConfig))
        .to.equal(path.join(process.cwd(), 'stubapi/post/Test-Something/Url-item/1'))
    })

    describe('config', () => {
      it('should work with #apiDir', () => {
        expect(composeModulePath(mockReq, { ...basicConfig, apiDir: 'testApiDir' }))
          .to.equal(path.join(process.cwd(), 'testApiDir/post/Test-Something/Url-item/1'))
      })

      it('should work with #lowerCase', () => {
        expect(composeModulePath(mockReq, { ...basicConfig, lowerCase: true }))
          .to.equal(path.join(process.cwd(), 'stubapi/post/test-something/url-item/1'))
      })

      it('should work with #nonChar', () => {
        expect(composeModulePath(mockReq, { ...basicConfig, nonChar: '+' }))
          .to.equal(path.join(process.cwd(), 'stubapi/post/Test+Something/Url+item/1'))
      })

      it('should work with #preserveQuery', () => {
        expect(composeModulePath(mockReq, { ...basicConfig, preserveQuery: true }))
          .to.equal(path.join(process.cwd(), 'stubapi/post/Test-Something/Url-item/1-asdf-1234'))
      })

      it('should work with multiple config options', () => {
        expect(composeModulePath(mockReq, {
          apiPrefixes  : [],
          apiDir       : 'TEST_DIR',
          lowerCase    : true,
          nonChar      : 'T',
          ping         : 0,
          preserveQuery: true,
          logLevel     : LogLevel.WARN,
        }))
          .to.equal(path.join(process.cwd(), 'TEST_DIR/post/testTsomething/urlTitem/1TasdfT1234'))
      })

      it('should ignore hash', () => {
        const mockReqWithHash = {
          url   : '/Test_Something/Url-item/1?asdf=1234#zxcv?qwe=987654',
          method: 'POST',
        } as any as Required<IncomingMessage>
        expect(composeModulePath(mockReqWithHash, { ...basicConfig, preserveQuery: true }))
          .to.equal(path.join(process.cwd(), 'stubapi/post/Test-Something/Url-item/1-asdf-1234'))
      })
    })
  })

  describe('.convertJsonToHandler()', () => {
    it('should basically works', () => {
      const { convertJsonToHandler } = require('../src/utils')

      const jsonDef = {
        code   : 201,
        headers: {
          'X-Test-Header': 'test',
        },
        body   : {
          test: 1,
        },
      }

      const handler = convertJsonToHandler(jsonDef)

      expect(typeof handler).to.equal('function')

      const res = mockRes(sinon)
      handler(null, res)

      expect(res.statusCode).to.equal(201)
      expect(res.setHeader).to.have.been.calledWith('Content-Type', 'application/json')
      expect(res.setHeader).to.have.been.calledWith('X-Test-Header', 'test')
      expect(res.end).to.have.been.calledWith('{\n  "test": 1\n}')
    })
  })

  describe.skip('.loadModule()', () => {
    // TODO
  })
})
