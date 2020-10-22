import type { JsonApiDefinition, MsmMiddleware } from '../interfaces'


export default function convertJsonToHandler(json: JsonApiDefinition): MsmMiddleware {
  return async(ctx, next) => {
    await next()

    ctx.status = json.code ?? 200

    ctx.set('content-type', 'application/json')

    Object.keys(json.headers ?? {}).forEach(key => {
      const val = json.headers?.[key]
      if (val != null) {
        ctx.set(key, val)
      } else {
        ctx.remove(key)
      }
    })

    ctx.body = json.body
  }
}
