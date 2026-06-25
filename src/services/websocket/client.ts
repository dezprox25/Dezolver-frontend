import { io, type Socket } from 'socket.io-client'
import { WS_URL } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'

let socket: Socket | null = null

export function connectWebSocket(): Socket {
  if (socket?.connected) return socket

  const token = useAuthStore.getState().accessToken

  socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.info('[WS] Connected')
  })

  socket.on('disconnect', (reason) => {
    console.info('[WS] Disconnected:', reason)
  })

  socket.on('auth_error', (err: { code: string }) => {
    console.warn('[WS] Auth error:', err.code)
    disconnectWebSocket()
  })

  socket.on('system:reauth_required', () => {
    const newToken = useAuthStore.getState().accessToken
    if (newToken && socket) {
      socket.emit('re-auth', { token: newToken })
    }
  })

  return socket
}

export function disconnectWebSocket(): void {
  socket?.disconnect()
  socket = null
}

export function getSocket(): Socket | null {
  return socket
}

export function joinChannel(channel: string): void {
  socket?.emit('channel:join', { channel })
}

export function leaveChannel(channel: string): void {
  socket?.emit('channel:leave', { channel })
}
