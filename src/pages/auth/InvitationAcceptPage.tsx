import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckCircle2, AlertTriangle, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/api/auth.service'
import { apiClient } from '@/services/api/client'
import { normalizeMeResponse } from '@/types/auth.types'
import { ROUTES } from '@/lib/constants'
import type { ApiSuccess } from '@/types/api.types'

interface InvitationAcceptApiResponse {
  accessToken?: string
  message?: string
}

type PageStatus = 'loading' | 'success' | 'error'

function getErrorMessage(err: unknown): string {
  const apiErr = (
    err as { response?: { data?: { error?: { code?: string; message?: string } } } }
  )?.response?.data?.error

  const codeMessages: Record<string, string> = {
    invitation_not_found: 'This invitation link was not found. It may have already been used.',
    invitation_expired: 'This invitation link has expired. Please request a new one.',
    invitation_already_accepted: 'This invitation has already been accepted.',
    user_already_member: 'You are already a member of this organization.',
  }

  return (
    (apiErr?.code ? codeMessages[apiErr.code] : undefined) ??
    apiErr?.message ??
    'Failed to accept the invitation. The link may be expired or invalid.'
  )
}

export function InvitationAcceptPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, setFullAuth, setAccessToken } = useAuthStore()
  const [status, setStatus] = useState<PageStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const accept = async () => {
      if (!token) {
        setErrorMessage('Invalid invitation link — no token found.')
        setStatus('error')
        return
      }

      try {
        const res = await apiClient.post<ApiSuccess<InvitationAcceptApiResponse>>(
          `/tenants/invitations/${encodeURIComponent(token)}/accept`
        )
        const data = res.data.data

        // Backend may return a fresh access token when the user is newly provisioned
        if (data.accessToken) {
          setAccessToken(data.accessToken)
          try {
            const me = await authService.getFullProfile()
            const user = normalizeMeResponse(me)
            setFullAuth(user, data.accessToken, me.tenant, me.subscription, me.linkedUsers)
          } catch {
            // Non-fatal: token is stored; the session restore will pick up the full profile
          }
        }

        setStatus('success')
      } catch (err) {
        setErrorMessage(getErrorMessage(err))
        setStatus('error')
      }
    }

    accept()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Accepting invitation…</h2>
          <p className="text-sm text-muted-foreground">Please wait while we verify your link.</p>
        </div>
      </div>
    )
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Invitation accepted!</h2>
            <p className="text-sm text-muted-foreground">
              You've been added to the platform. Head to your dashboard to get started.
            </p>
          </div>
        </div>
        <Button className="w-full" onClick={() => navigate(ROUTES.DASHBOARD, { replace: true })}>
          Go to dashboard
        </Button>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Invitation failed</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">{errorMessage}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {isAuthenticated ? (
          <Button className="w-full" onClick={() => navigate(ROUTES.DASHBOARD)}>
            Go to dashboard
          </Button>
        ) : (
          <>
            <Button className="w-full" asChild>
              <Link to={ROUTES.LOGIN}>
                <UserPlus className="mr-2 h-4 w-4" />
                Sign in to continue
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to={ROUTES.SIGNUP}>Create an account</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
