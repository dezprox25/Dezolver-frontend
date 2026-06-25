import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Providers } from '@/providers'
import { router } from '@/routes'

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" closeButton />
    </Providers>
  )
}
