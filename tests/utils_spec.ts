import chai, { expect }             from 'chai';
import chaiAsPromised               from 'chai-as-promised';
import { IncomingMessage }          from 'http';
import path                         from 'path';
import sinon                        from 'sinon';
import sinonChai                    from 'sinon-chai';
import { IParsedServerConfig }      from '../src/config';
import { LogLevel }                 from '../src/logger';
import { composeModulePath, delay } from '../src/utils';
import { mockCtx, mockNext }        from './helpers';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Utilities', () => {

  afterEach(() => {
    sinon.restore();
  });

  describe('.delay', () => {
    it('should resolve after specified duration', async() => {
      const clock = sinon.useFakeTimers();

      let resolved = false;

      delay(10).then(() => {
        resolved = true;
      });

      clock.tick(5);
      await Promise.resolve();
      expect(resolved).to.be.false;


      clock.tick(5);
      await Promise.resolve();
      expect(resolved).to.be.true;
    });
  });

  describe('.composeModulePath()', () => {
    const mockReq = {
      url   : '/Test_Something/Url-item/1?asdf=1234',
      method: 'POST',
    } as any as Required<IncomingMessage>;

    const basicConfig: IParsedServerConfig = {
      apiPrefixes  : [],
      apiDir       : 'stubapi',
      logLevel     : LogLevel.WARN,
      lowerCase    : false,
      nonChar      : '-',
      saveHeaders  : [],
      overwriteMode: false,
      ping         : 0,
    };

    describe('config', () => {
      it('should work with #apiDir', () => {
        expect(composeModulePath(mockReq, { ...basicConfig, apiDir: 'testApiDir' }))
          .to.equal(path.join(process.cwd(), 'testApiDir/post/Test-Something/Url-item/1'));
      });

      it('should work with #lowerCase', () => {
        expect(composeModulePath(mockReq, { ...basicConfig, lowerCase: true }))
          .to.equal(path.join(process.cwd(), 'stubapi/post/test-something/url-item/1'));
      });

      it('should work with #nonChar', () => {
        expect(composeModulePath(mockReq, { ...basicConfig, nonChar: '+' }))
          .to.equal(path.join(process.cwd(), 'stubapi/post/Test+Something/Url+item/1'));
      });

      it('should work with multiple config options', () => {
        expect(composeModulePath(mockReq, {
          apiPrefixes  : [],
          apiDir       : 'TEST_DIR',
          logLevel     : LogLevel.WARN,
          lowerCase    : true,
          nonChar      : 'T',
          saveHeaders  : [],
          overwriteMode: false,
          ping         : 0,
        }, true))
          .to.equal(path.join(process.cwd(), 'TEST_DIR/post/testTsomething/urlTitem/1TasdfT1234'));
      });

      it('should ignore hash', () => {
        const mockReqWithHash = {
          url   : '/Test_Something/Url-item/1?asdf=1234#zxcv?qwe=987654',
          method: 'POST',
        } as any as Required<IncomingMessage>;
        expect(composeModulePath(mockReqWithHash, { ...basicConfig }, true))
          .to.equal(path.join(process.cwd(), 'stubapi/post/Test-Something/Url-item/1-asdf-1234'));
      });
    });

    it('should ignore query by default', () => {
      expect(composeModulePath(mockReq, basicConfig))
        .to.equal(path.join(process.cwd(), 'stubapi/post/Test-Something/Url-item/1'));
    });

    it('should preserve query if required', () => {
      expect(composeModulePath(mockReq, { ...basicConfig, nonChar: 'Z' }, true))
        .to.equal(path.join(process.cwd(), 'stubapi/post/TestZSomething/UrlZitem/1ZasdfZ1234'));
    });
  });

  describe('.convertJsonToHandler()', () => {
    it('should basically works', async() => {
      const { convertJsonToHandler } = require('../src/utils');

      const jsonDef = {
        code   : 201,
        headers: {
          'X-Test-Header': 'test',
        },
        body   : {
          test: 1,
        },
      };

      const mockCtx1 = mockCtx(sinon);

      const handler = convertJsonToHandler(jsonDef);

      expect(typeof handler).to.equal('function');

      await handler(mockCtx1, mockNext());

      expect(mockCtx1.status).to.equal(201);
      expect(mockCtx1.set).to.have.been.calledWith('Content-Type', 'application/json');
      expect(mockCtx1.set).to.have.been.calledWith('X-Test-Header', 'test');
      expect(mockCtx1.body).to.deep.equal({ test: 1 });
    });
  });

  describe.skip('.loadModule()', () => {
    // TODO
  });
});
