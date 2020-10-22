import type { MsmMiddleware } from '../interfaces'
import convertJsonToHandler   from './convert'


export default function load404Def(): MsmMiddleware {
  return convertJsonToHandler({
    code: 404,
    body: {},
  })
}
