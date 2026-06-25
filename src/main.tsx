import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'

async function bootstrap() {
  // Install mock adapter BEFORE any component mounts so no API call fires without it
  if (import.meta.env.VITE_APP_MODE === 'mock') {
    const [{ mockAxiosAdapter }, { apiClient }] = await Promise.all([
      import('@/mock/mockAdapter'),
      import('@/services/api/client'),
    ])
    apiClient.defaults.adapter = mockAxiosAdapter
  }

  const { default: App } = await import('./App.tsx')

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

bootstrap()
