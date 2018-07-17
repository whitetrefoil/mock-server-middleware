import { Context } from 'koa'
import { SinonStatic } from 'sinon'

export function mockCtx(sinon: SinonStatic, request: any = { method: 'GET', url: '/' }) {
  return {
    request,
    set   : sinon.fake(),
    status: null,
    body  : null,
  } as any as Context
}

export function mockNext() {
  return () => Promise.resolve()
}
