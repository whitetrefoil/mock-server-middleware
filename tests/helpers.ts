import { IResponse } from '../src/msm'

export function mockRes() {
  return {
    statusCode: null,
    setHeader: jest.fn(),
    end: jest.fn(),
  } as any as IResponse
}
