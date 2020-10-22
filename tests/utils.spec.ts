import chai, { expect }              from 'chai'
import chaiAsPromised                from 'chai-as-promised'
import path                          from 'path'
import sinon                         from 'sinon'
import sinonChai                     from 'sinon-chai'
import convertJsonToHandler          from '~/definition/convert'
import { composeModulePath, delay }  from '~/utils'
import { generateMockNext, mockCtx } from './helpers'

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe('Utilities', () => {

  afterEach(() => {
    sinon.restore()
  })

  describe('.delay', () => {
    it('should resolve after specified duration', async() => {
      const clock = sinon.useFakeTimers()

      let resolved = false

      delay(10).then(() => {
        resolved = true
      })

      await clock.tickAsync(5)
      expect(resolved).to.be.false


      await clock.tickAsync(6)
      expect(resolved).to.be.true
    })
  })

  describe('.composeModulePath()', () => {
    const testParams = {
      method       : 'POST',
      pathname     : '/Test_Something/Url-item/1',
      search       : '?asdf=1234',
      apiDir       : 'stubapi',
      ignoreQueries: true,
      lowerCase    : false,
      nonChar      : '-',
    }

    describe('config', () => {
      it('should work with #apiDir', () => {
        const actual = composeModulePath({
          ...testParams,
          apiDir: 'testApiDir',
        })
        expect(actual)
          .to.equal(path.join(process.cwd(), 'testApiDir/post/Test-Something/Url-item/1'))
      })

      it('should work with #lowerCase', () => {
        const actual = composeModulePath({
          ...testParams,
          lowerCase: true,
        })
        expect(actual)
          .to.equal(path.join(process.cwd(), 'stubapi/post/test-something/url-item/1'))
      })

      it('should work with #nonChar', () => {
        const actual = composeModulePath({
          ...testParams,
          nonChar: '+',
        })
        expect(actual)
          .to.equal(path.join(process.cwd(), 'stubapi/post/Test+Something/Url+item/1'))
      })

      it('should work with complex config options', () => {
        const actual = composeModulePath({
          ...testParams,
          lowerCase    : true,
          nonChar      : 'T',
          apiDir       : 'TEST_DIR',
          ignoreQueries: false,
        })
        expect(actual)
          .to.equal(path.join(process.cwd(), 'TEST_DIR/post/testTsomething/urlTitem/1TasdfT1234'))
      })
    })
  })

  describe('.convertJsonToHandler()', () => {
    it('should basically works', async() => {
      const jsonDef = {
        code   : 201,
        headers: {
          'X-Test-Header': 'test',
        },
        body   : {
          test: 1,
        },
      }

      const mockCtx1 = mockCtx(sinon)

      const handler = convertJsonToHandler(jsonDef)

      expect(typeof handler).to.equal('function')

      await handler(mockCtx1, generateMockNext())

      expect(mockCtx1.status).to.equal(201)
      expect(mockCtx1.set).to.have.been.calledWith('content-type', 'application/json')
      expect(mockCtx1.set).to.have.been.calledWith('X-Test-Header', 'test')
      expect(mockCtx1.body).to.deep.equal({ test: 1 })
    })
  })

  describe.skip('.loadModule()', () => {
    // TODO
  })
})
