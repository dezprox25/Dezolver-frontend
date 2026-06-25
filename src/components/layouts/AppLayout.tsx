import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { ImpersonationBanner } from '@/components/shared/ImpersonationBanner'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile, shown on lg+ */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Impersonation banner — only visible when isImpersonating is true */}
        <ImpersonationBanner />

        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl p-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
