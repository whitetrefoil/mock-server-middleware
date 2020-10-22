import { decompress }                           from '../decompression'
import type { Logger, MsmParameterizedContext } from '../interfaces'


export default async function parseBody(ctx: MsmParameterizedContext, logger: Logger): Promise<unknown> {
  const rawType = ctx.response.get('Content-Type')
  const match = /^\w*\/\w*/u.exec(rawType)
  const type = match?.[0] ?? 'plain/text'

  const body = await decompress(ctx.body, ctx.response.headers, logger)
  if (!Buffer.isBuffer(body)) {
    return (body as Buffer).toString()
  }

  if (type === 'application/json') {
    return JSON.parse(body.toString()) as unknown
  }

  const base64 = body.toString('base64')
  return `data:${type};base64,${base64}`
}
