import { createRequestLog } from './router-impl'

export const logRequestData = (data?: { body: Record<string, any>; meta: Record<string, any> }) => {
  if (data?.body) console.info('Body', data.body)
  if (data?.meta) console.info('Meta', data.meta)
}

export async function logRequest(
  fetchPromise: Promise<any>,
  printResponseLog: ReturnType<typeof createRequestLog>
) {
  return fetchPromise
    .then((data) => {
      printResponseLog({
        isSuccess: true,
        logInfo: () => {
          logRequestData(data)
        },
      })
      return data
    })
    .catch((err) => {
      printResponseLog({
        isSuccess: false,
        code: err.code,
        logInfo: () => {
          if (err?.message) console.error(err.message)
          else console.error(err)
        },
      })
      throw err
    })
}
