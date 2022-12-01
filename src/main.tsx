import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { css, Global, keyframes } from '@emotion/react'

const animatedBackground = keyframes`
  0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
`

const globalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab&display=swap');

  :root {
    --bg: #1e1e28;
  }

  body {
    margin: 0;
    background: var(--bg);
    background: linear-gradient(135deg, #0e0c13, #393348);
    background-size: 200% 200%;
    color: #fff;
    animation: ${animatedBackground} 4s linear infinite;
    /* animation-direction: alternate; */
  }

  body, button {
    font-family: 'Roboto Slab', serif;
  }

  #root > * {
    height: 100vh;
  }
`

/**
 * If you enables use of Node.js API in the Renderer-process
 * ```
 * npm i -D vite-plugin-electron-renderer
 * ```
 * @see - https://github.com/electron-vite/vite-plugin-electron/tree/main/packages/electron-renderer#electron-renderervite-serve
 */
// import './samples/node-api'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Global styles={globalStyles} />
    <App />
  </React.StrictMode>
)

postMessage({ payload: 'removeLoading' }, '*')
