import type { IncomingHttpHeaders } from 'http'
import * as zlib                    from 'zlib'
import type Logger                  from './logger'


type Algorithm = (buf: Buffer, options: zlib.ZlibOptions, callback: zlib.CompressCallback) => void

const algorithmMap: Record<string, Algorithm> = {
  gzip   : zlib.gunzip,
  deflate: zlib.inflate,
  br     : zlib.brotliDecompress,
}

const IDENTITY_ALGORITHM = 'identity'

function isBufferOrString(any: Buffer|string|unknown): any is Buffer|string {
  return typeof any === 'string' || Buffer.isBuffer(any)
}

export async function decompress(
  body: Buffer|string|unknown,
  headers: IncomingHttpHeaders,
  logger: Logger,
): Promise<Buffer|string|unknown> {
  const contentEncoding = headers['content-encoding']
  if (contentEncoding == null) {
    return body
  }

  if (!isBufferOrString(body)) {
    return body
  }

  let algorithms: Algorithm[] = []
  try {
    algorithms = contentEncoding.split(',')
      .map(a => a.trim().toLowerCase())
      .filter(a => a !== IDENTITY_ALGORITHM)
      .map(a => {
        const algorithm = algorithmMap[a]
        if (algorithm == null) {
          throw new Error(`Compression encoding "${a}" is not supported, will leave the response as is!`)
        }
        return algorithm
      })
      .reverse()


    let decompressed = Buffer.isBuffer(body) ? body : Buffer.from(body)
    for (const alg of algorithms) {
      // eslint-disable-next-line no-await-in-loop,no-loop-func
      decompressed = await new Promise((resolve, reject) => {
        alg(decompressed, {}, (err, res) => {
          if (err != null) {
            reject(err)
            return
          }
          resolve(res)
        })
      })
    }

    return decompressed

  } catch (e: unknown) {
    const reason = (e instanceof Error ? e.stack : null) ?? 'unknown reason'
    logger.error(`Failed to decompress response body, due to:\n${reason}`)
    return body
  }
}
