import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { dashboardService } from '@/services/api/dashboard.service'
import { QUERY_KEYS } from '@/lib/constants'
import type { UserRole } from '@/types/auth.types'

/**
 * Fetches role-aware KPI stats for the dashboard.
 * The mock implementation returns static data; replace queryFn with a real
 * API call once the aggregation endpoint exists.
 */
export function useDashboardStats() {
  const user = useAuthStore((s) => s.user)
  const role: UserRole = user?.primaryRole ?? 'student'

  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.STATS(role),
    queryFn: () => dashboardService.getStats(role),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Fetches recent activity items for the authenticated user.
 */
export function useDashboardActivity() {
  const user = useAuthStore((s) => s.user)
  const role: UserRole = user?.primaryRole ?? 'student'

  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.ACTIVITY(role),
    queryFn: () => dashboardService.getActivity(role),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Returns notifications from the Zustand store.
 * The store is populated by WebSocketProvider in real-time.
 * This hook is a stable accessor — it doesn't fetch from the API.
 */
export function useNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore()

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    hasUnread: unreadCount > 0,
  }
}
