import type { Stats } from 'fs'
import * as fs from 'fs/promises'
import * as path from 'path'
import { URLSearchParams } from 'url'
import { promisify } from 'util'


const setTimeoutPromise = promisify(setTimeout)

export function isStringArray(val: unknown): val is string[] {
  return Array.isArray(val) && val.every(v => typeof v === 'string')
}

export async function delay(ms: number) {
  return setTimeoutPromise(ms)
}

function formatPath({
  pathname,
  nonChar,
  lowerCase,
}: {
  pathname: string
  nonChar: string
  lowerCase: boolean
}): string {
  const caseNormalized = lowerCase ? pathname.toLowerCase() : pathname
  return caseNormalized.replace(/[^a-zA-Z0-9/]/ug, nonChar)
}

function formatQs({
  search,
  ignoreQueries,
}: {
  search: string|null
  ignoreQueries: string[]|boolean
}): string {
  if (search == null || ignoreQueries === true) {
    return ''
  }

  const sp = new URLSearchParams(search)
  if (ignoreQueries !== false) {
    ignoreQueries.forEach(ignore => {
      sp.delete(ignore)
    })
  }
  sp.sort()
  return sp.toString()
}

export function composeModulePath({
  method,
  pathname,
  search,
  lowerCase,
  nonChar,
  apiDir,
  ignoreQueries,
}: {
  method: string
  pathname: string
  search: string|null
  lowerCase: boolean
  nonChar: string
  apiDir: string
  ignoreQueries: string[]|boolean
}): string {

  const qsPath = formatQs({ search, ignoreQueries })
  const modulePath = qsPath === '' ? pathname : `${pathname}?${qsPath}`

  return path.join(
    process.cwd(),
    apiDir,
    method.toLowerCase(),
    formatPath({
      pathname: modulePath,
      lowerCase,
      nonChar,
    }),
  )
}


export async function importFresh(modulePath: string) {
  return import(`${modulePath}.js?x=${Math.random().toString()}`)
    .catch(async() => import(`${modulePath}.es?x=${Math.random().toString()}`))
    .catch(async() => import(`${modulePath}.ts?x=${Math.random().toString()}`))
}


export async function importFreshJsModule(modulePath: string) {
  let stat: Stats
  try {
    stat = await fs.stat(modulePath)
  } catch (e: unknown) {
    return importFresh(modulePath)
  }
  if (stat.isDirectory()) {
    return importFresh(path.join(modulePath, 'index'))
  }
  return importFresh(modulePath)
}
