import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import {
  connectWebSocket,
  disconnectWebSocket,
  joinChannel,
  getSocket,
} from '@/services/websocket/client'
import type { Notification } from '@/types/common.types'

interface WebSocketProviderProps {
  children: ReactNode
}

const IS_MOCK = import.meta.env.VITE_APP_MODE === 'mock'

/**
 * Manages the Socket.IO connection lifecycle.
 * In mock mode, acts as a passthrough with no real connection.
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const { addNotification } = useNotificationStore()

  // Track the current auth user ID to detect account switches
  const connectedUserRef = useRef<string | null>(null)

  useEffect(() => {
    if (IS_MOCK || !isAuthenticated || !user || !accessToken) {
      if (!IS_MOCK) { disconnectWebSocket(); connectedUserRef.current = null }
      return
    }

    // Don't reconnect if already connected for this user
    const existingSocket = getSocket()
    if (existingSocket?.connected && connectedUserRef.current === user.id) return

    const socket = connectWebSocket()
    connectedUserRef.current = user.id

    // ── Auto-join channels after connect ──────────────────────────────────
    const handleConnect = () => {
      joinChannel(`user:${user.id}`)
      joinChannel(`tenant:${user.tenantId}`)
      if (user.cohortId) {
        joinChannel(`cohort:${user.cohortId}`)
      }
    }

    // If already connected, join immediately; otherwise wait for connect event
    if (socket.connected) {
      handleConnect()
    } else {
      socket.once('connect', handleConnect)
    }

    // ── Notification events ───────────────────────────────────────────────
    const handleNotification = (payload: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        read: false,
        createdAt: new Date().toISOString(),
        ...payload,
      }
      addNotification(notification)

      // Show a sonner toast for non-info severity
      if (payload.severity === 'success') toast.success(payload.title, { description: payload.message })
      else if (payload.severity === 'warning') toast.warning(payload.title, { description: payload.message })
      else if (payload.severity === 'error') toast.error(payload.title, { description: payload.message })
    }

    // Core notification event — backend can emit this for any in-app alert
    socket.on('notification', handleNotification)

    // Module-specific events that we want to surface as notifications
    socket.on('certificate:issued', (data: { certificateId?: string; title?: string }) => {
      handleNotification({
        title: 'Certificate Issued',
        message: data.title
          ? `Your certificate "${data.title}" is ready.`
          : 'A new certificate has been issued.',
        severity: 'success',
      })
    })

    socket.on('certificate:issuing', (_data: { certificateId?: string }) => {
      handleNotification({
        title: 'Certificate Generating',
        message: 'Your certificate is being generated.',
        severity: 'info',
      })
    })

    socket.on('submission:graded', (data: { verdict: string; assessmentTitle?: string }) => {
      const label = data.assessmentTitle ? ` on "${data.assessmentTitle}"` : ''
      handleNotification({
        title: 'Submission Graded',
        message: `Verdict: ${data.verdict}${label}`,
        severity: data.verdict === 'Accepted' ? 'success' : 'info',
      })
    })

    // ── Event lifecycle notifications ─────────────────────────────────────
    socket.on('event:started', (_data: { eventId: string }) => {
      handleNotification({
        title: 'Event Started',
        message: 'A competition is now live!',
        severity: 'success',
      })
    })

    socket.on('event:ended', (_data: { eventId: string }) => {
      handleNotification({
        title: 'Event Ended',
        message: 'Competition has ended. Results are being processed.',
        severity: 'info',
      })
    })

    socket.on('event:extended', (_data: { eventId: string; newEndsAt: string }) => {
      handleNotification({
        title: 'Event Extended',
        message: 'The competition has been extended.',
        severity: 'info',
      })
    })

    socket.on('event:reminder', (data: { eventId: string; minutesUntilStart: number }) => {
      handleNotification({
        title: 'Event Starting Soon',
        message: `An event starts in ${data.minutesUntilStart} minute${data.minutesUntilStart !== 1 ? 's' : ''}.`,
        severity: 'info',
      })
    })

    socket.on('event:announcement', (data: { eventId: string; message: string }) => {
      handleNotification({
        title: 'Event Announcement',
        message: data.message,
        severity: 'info',
      })
    })

    // ── Learning path progress notifications ─────────────────────────────────
    socket.on('path:completed', (_data: { pathId: string }) => {
      handleNotification({
        title: 'Path Completed',
        message: 'You completed a learning path! 🎉',
        severity: 'success',
      })
    })

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      socket.off('connect', handleConnect)
      socket.off('notification', handleNotification)
      socket.off('certificate:issued')
      socket.off('certificate:issuing')
      socket.off('submission:graded')
      socket.off('event:started')
      socket.off('event:ended')
      socket.off('event:extended')
      socket.off('event:reminder')
      socket.off('event:announcement')
      socket.off('path:completed')
    }
  }, [isAuthenticated, user?.id, user?.tenantId, user?.cohortId, accessToken, addNotification])

  // Disconnect on unmount (app teardown)
  useEffect(() => {
    if (IS_MOCK) return
    return () => {
      disconnectWebSocket()
    }
  }, [])

  return <>{children}</>
}
