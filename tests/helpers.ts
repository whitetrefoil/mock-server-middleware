import { SinonSandbox } from 'sinon'
import { IResponse } from '../src/msm'

export function mockRes(sandbox: SinonSandbox) {
  return {
    statusCode: null,
    setHeader : sandbox.stub(),
    end       : sandbox.stub(),
  } as any as IResponse
}
