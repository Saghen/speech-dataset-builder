import { dialog } from "electron"
import { createRouter } from "../router/router-impl"

export enum Endpoints {
  open = "open",
}

export default createRouter("dialog", {
  [Endpoints.open]: async (_: undefined, { meta: { win }}) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"],
    })
    if (result.canceled) throw Error('User cancelled dialog')
    return result.filePaths[0]
  },
})
