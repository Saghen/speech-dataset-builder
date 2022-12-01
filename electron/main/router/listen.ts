import { logRequestData } from "./logging-helpers"
import { routers as Routers } from "."
import { createRequestLog, CodesEnum } from "./router-impl"
import { BrowserWindow, ipcMain } from "electron"

export const createSuccessResponse = (body: Record<string, any> = {}) => ({
  body,
  meta: { isSuccess: true },
})

export const createErrorResponse = (code: CodesEnum, message?: string) => ({
  body: message ? { message } : {},
  meta: { isSuccess: false, code },
})

const requestHandler = async (win: BrowserWindow, { path, request, hash }) => {
  request = {
    body: { ...(request?.body ?? {}) },
    meta: { ...(request?.meta ?? {}), win },
  }
  const printResponseLog = createRequestLog({
    hash,
    label: "Listen",
    labelCSS: "color: #C678DD",
    logInfo: () => logRequestData(request),
    path,
  })

  const parts = (path as string).split("/").filter(Boolean)

  // TODO:
  const prefix = parts[0]
  if (prefix in Routers) {
    const router = await Routers[prefix as keyof typeof Routers]()
    const route = parts.slice(1).join("/")
    if (!(route in router.resolvers)) {
      printResponseLog({ isSuccess: false })
      return createErrorResponse(CodesEnum.NotFound)
    }

    return router
      .handleRequest(parts.slice(1).join("/"), request.body, {
        meta: request.meta,
      })
      .then((resBody) => {
        const response = createSuccessResponse(resBody)
        printResponseLog({
          isSuccess: true,
          logInfo: () => logRequestData(response),
        })
        return response
      })
      .catch((err) => {
        printResponseLog({
          isSuccess: false,
          logInfo: () => console.error(err?.message ?? err),
        })
        return createErrorResponse(err.code ?? CodesEnum.Unknown, err.message)
      })
  }
}

export const initListen = (win: BrowserWindow) => {
  ipcMain.handle("request", async (_, { path, request, hash }) =>
    requestHandler(win, { path, request, hash })
  )
}
