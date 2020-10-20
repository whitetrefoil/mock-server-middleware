import type { Context }     from 'koa'
import type { SinonStatic } from 'sinon'

export function mockCtx(sinon: SinonStatic, request: unknown = { method: 'GET', url: '/' }): Context {
  return {
    request,
    set   : sinon.fake(),
    status: null,
    body  : null,
  } as unknown as Context
}

export function generateMockNext() {
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  return () => Promise.resolve()
}
