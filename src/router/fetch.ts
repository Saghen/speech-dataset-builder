import { codeToError, createRequestLog, generateHash } from './router-impl'
import { logRequest, logRequestData } from './logging-helpers'
import type { Resolvers } from '../../electron/main/router/index'
import { useEffect, useState } from 'react'

interface Request {
  body: Record<string, any>
  meta: Record<string, any>
}

interface Response {
  body: Record<string, any>
  meta: Record<string, any>
}

type IgnoreUndefinedArg<T> = T extends undefined ? [] : [T]

type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends ArrayLike<any>
      ? `/${K}${PathImpl<T[K], Exclude<keyof T[K], keyof any[]>>}`
      : T[K] extends (...args: any[]) => any
      ? `/${K}`
      : `/${K}${PathImpl<T[K], keyof T[K]>}`
    : `/${K}`
  : never

type Path<T> = PathImpl<T, keyof T>
type PathValue<T, P extends Path<T>> = P extends `/${infer K}/${infer Rest}`
  ? K extends keyof T
    ? T[K] extends Record<string, any>
      ? T[K] extends (...args: any[]) => any
        ? T[K]
        : `/${Rest}` extends Path<T[K]>
        ? PathValue<T[K], `/${Rest}`>
        : never
      : T[K]
    : never
  : P extends `/${infer K2}`
  ? // eslint-disable-next-line
    // @ts-ignore
    T[K2]
  : never

async function fetchImpl(path: string, request: Request) {
  const hash = generateHash(6)
  const printResponseLog = createRequestLog({
    hash,
    label: 'Fetch',
    labelCSS: 'color: #67cbff',
    logInfo: () => logRequestData(request),
    path,
  })

  const fetchPromise = window.electronAPI.request({ path, request, hash }).then((response: Response) => {
    if (!response) {
      throw Error(`Did not receive response on path ${path} with hash ${hash}`)
    }
    if (!response.meta.isSuccess) {
      throw codeToError(response.meta.code, response.body.message)
    }
    return response
  })

  return logRequest(fetchPromise, printResponseLog)
}

type FetchArgs<K extends Path<Resolvers>> = IgnoreUndefinedArg<Parameters<PathValue<Resolvers, K>>[0]>
type FetchReturn<K extends Path<Resolvers>> = Awaited<ReturnType<PathValue<Resolvers, K>>>

export function fetch<K extends Path<Resolvers>>(path: K, ...args: FetchArgs<K>) {
  return fetchImpl(path, { body: args[0] ?? {}, meta: {} }).then((res) => res.body) as Promise<FetchReturn<K>>
}

export function useFetch<K extends Path<Resolvers>>(path: K, ...args: FetchArgs<K>) {
  const [data, setData] = useState<FetchReturn<K> | undefined>()
  const [error, setError] = useState()

  useEffect(() => {
    fetch(path, ...args)
      .then(setData)
      .catch(setError)
  }, [path, ...args.map(value => JSON.stringify(value))])

  return { data, error }
}
