import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import './index.css'

import { router } from './routes'
import { ErrorBoundary } from './components/ErrorBoundary'
import { NotificacionesGlobales } from './components/NotificacionesGlobales'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
      <NotificacionesGlobales />
    </ErrorBoundary>
  </StrictMode>,
)
