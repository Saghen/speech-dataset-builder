import { createRequestLog } from "./router-impl"

export const logRequestData = (data) => {
  if (data?.body) console.info("Body", data.body)
  if (data?.meta) console.info("Meta", data.meta)
}

export async function logRequest(
  fetchPromise: Promise<any>,
  printResponseLog: ReturnType<typeof createRequestLog>
) {
  return fetchPromise
    .then((data) => {
      printResponseLog({
        isSuccess: true,
        logInfo: () => logRequestData(data),
      })
      return data
    })
    .catch((err) => {
      printResponseLog({
        isSuccess: false,
        logInfo: () => console.error(err?.message ?? err),
      })
      throw err
    })
}
