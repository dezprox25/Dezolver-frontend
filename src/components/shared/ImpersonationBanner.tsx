import { ShieldAlert, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/services/api/client'
import { authService } from '@/services/api/auth.service'
import { normalizeMeResponse } from '@/types/auth.types'
import { Button } from '@/components/ui/button'
import type { ApiSuccess } from '@/types/api.types'
import type { AuthResponse } from '@/types/auth.types'

interface LoginUserShape {
  id: string; personId: string; tenantId: string; tenantKind: string
  email: string; fullName: string; roles: string[]; mfaEnabled: boolean
}
interface ExitImpersonationResponse {
  accessToken: string; tokenType: 'Bearer'; expiresIn: number
  user: LoginUserShape; linkedUsers: AuthResponse['linkedUsers']
}

/**
 * Shown when the current session is an impersonation session.
 * The `isImpersonating` flag is set by the platform-admin impersonate flow (Phase 4).
 */
export function ImpersonationBanner() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isImpersonating, impersonatorInfo, setFullAuth, setAccessToken, logout } = useAuthStore()

  if (!isImpersonating) return null

  const handleExit = async () => {
    try {
      const res = await apiClient.post<ApiSuccess<ExitImpersonationResponse>>(
        '/auth/impersonation/exit'
      )
      const raw = res.data.data
      setAccessToken(raw.accessToken)

      try {
        const me = await authService.getFullProfile()
        const user = normalizeMeResponse(me)
        setFullAuth(user, raw.accessToken, me.tenant, me.subscription, me.linkedUsers)
      } catch {
        logout()
      }
      queryClient.clear()
      toast.success('Exited impersonation — back to your account.')
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error('Failed to exit impersonation. Please try again.')
    }
  }

  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-4 bg-amber-500 px-4 text-white">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span>
          Impersonating session
          {impersonatorInfo?.name ? ` — acting as ${impersonatorInfo.name}` : ''}
        </span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-white hover:bg-white/20 hover:text-white"
        onClick={handleExit}
      >
        <LogOut className="mr-1.5 h-3.5 w-3.5" />
        Exit
      </Button>
    </div>
  )
}
