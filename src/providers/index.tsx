import type { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'
import { ThemeProvider } from './ThemeProvider'
import { SessionProvider } from './SessionProvider'
import { WebSocketProvider } from './WebSocketProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <SessionProvider>
          {/* WebSocket connects after session is restored */}
          <WebSocketProvider>
            {children}
          </WebSocketProvider>
        </SessionProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
