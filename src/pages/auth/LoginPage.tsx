import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { loginSchema, type LoginFormValues } from '@/lib/schemas/auth.schemas'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/api/auth.service'
import { normalizeMeResponse } from '@/types/auth.types'
import type { AuthResponse } from '@/types/auth.types'
import { REMEMBERED_EMAIL_KEY, ROUTES } from '@/lib/constants'

// ─── Error code → user-friendly message ──────────────────────────────────────
const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Invalid email or password.',
  account_locked: 'Account temporarily locked. Please try again in 15 minutes.',
  tenant_suspended: "Your institution's account has been suspended. Contact your administrator.",
  user_suspended: 'Your account has been suspended. Contact your administrator.',
  user_revoked: 'Your account has been deactivated.',
  mfa_required: 'Multi-factor authentication is required.',
}

function getErrorMessage(err: unknown): string {
  const code = (
    err as { response?: { data?: { error?: { code?: string; message?: string } } } }
  )?.response?.data?.error
  return code?.code
    ? (ERROR_MESSAGES[code.code] ?? code.message ?? 'Sign in failed. Please try again.')
    : 'Sign in failed. Please try again.'
}

// ─── Dev login panel (only compiled/shown in development) ─────────────────────

const ROLE_COLORS: Record<string, string> = {
  platform_admin:    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  platform_moderator:'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  college_admin:     'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  coordinator:       'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  faculty:           'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800',
  content_manager:   'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  student:           'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
}

function DevLoginPanel() {
  const navigate = useNavigate()
  const { setFullAuth } = useAuthStore()
  const [expanded, setExpanded] = useState(true)
  const [loading, setLoading] = useState<string | null>(null)
  const isMockMode = import.meta.env.VITE_APP_MODE === 'mock'

  const handleDevLogin = async (personaKey: string) => {
    setLoading(personaKey)
    try {
      if (isMockMode) {
        const { MOCK_PERSONAS, saveMockSession } = await import('@/mock/mockPersonas')
        const persona = MOCK_PERSONAS[personaKey]
        if (!persona) return
        saveMockSession(persona.key)
        setFullAuth(persona.user, `MOCK_TOKEN_${persona.key}`, persona.tenant, persona.subscription, [])
        toast.success(`Logged in as ${persona.label}`, { description: persona.email, duration: 3000 })
        navigate(ROUTES.DASHBOARD, { replace: true })
        return
      }
      const { DEV_PERSONAS, saveDevSession } = await import('@/lib/dev/mockUsers')
      const persona = DEV_PERSONAS.find((p) => p.key === personaKey)
      if (!persona) return
      saveDevSession(persona)
      setFullAuth(persona.user, 'DEV_ACCESS_TOKEN', persona.tenant, persona.subscription, [])
      toast.success(`Dev login: ${persona.label}`, {
        description: persona.email,
        duration: 3000,
      })
      navigate(ROUTES.DASHBOARD, { replace: true })
    } finally {
      setLoading(null)
    }
  }

  // Lazy-load persona list for display
  const [personas, setPersonas] = useState<Array<{ key: string; label: string; description: string; email: string }>>([])
  useEffect(() => {
    if (isMockMode) {
      import('@/mock/mockPersonas').then(({ MOCK_PERSONAS }) => {
        setPersonas(Object.values(MOCK_PERSONAS).map(({ key, label, email }) => ({ key, label, description: `Demo ${label}`, email })))
      })
      return
    }
    import('@/lib/dev/mockUsers').then(({ DEV_PERSONAS }) => {
      setPersonas(DEV_PERSONAS.map(({ key, label, description, email }) => ({ key, label, description, email })))
    })
  }, [isMockMode])

  return (
    <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20">
      {/* Header toggle */}
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            {isMockMode ? 'Quick Demo Login' : 'Developer Login'}
          </span>
          <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-800 dark:text-amber-200">
            {isMockMode ? 'demo' : 'dev only'}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
            {isMockMode
              ? 'One-click demo access. Select a role to explore the full platform with realistic mock data.'
              : 'Bypasses the backend entirely. Creates a local mock session so you can review navigation and UI for any role.'}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {personas.map((persona) => (
              <button
                key={persona.key}
                type="button"
                disabled={loading !== null}
                onClick={() => handleDevLogin(persona.key)}
                className="group flex items-center justify-between rounded-md border px-3 py-2.5 text-left transition-all hover:shadow-sm disabled:opacity-50"
                style={{ borderColor: 'transparent' }}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                      ROLE_COLORS[persona.key] ?? 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {persona.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{persona.email}</p>
                    <p className="text-[11px] text-muted-foreground/60 truncate">{persona.description}</p>
                  </div>
                </div>
                {loading === persona.key ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground ml-2" />
                ) : (
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth, setFullAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Restore remembered email
  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? ''

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail,
      password: '',
      tenantHint: '',
      rememberMe: !!rememberedEmail,
    },
  })

  // Auto-detect tenant from the current subdomain
  useEffect(() => {
    const host = window.location.hostname
    const parts = host.split('.')
    if (parts.length >= 3) {
      // e.g., vit-chennai.dezolver.com → hint = 'vit-chennai'
      form.setValue('tenantHint', parts[0])
    }
  }, [form])

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true)
    try {
      // Persist or clear remembered email
      if (values.rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, values.email)
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }

      const result = await authService.login({
        email: values.email,
        password: values.password,
        tenantHint: values.tenantHint || undefined,
      })

      // ── MFA required ───────────────────────────────────────────────────
      if ('mfaRequired' in result) {
        navigate(ROUTES.MFA_VERIFY, {
          state: { mfaToken: result.mfaToken },
          replace: true,
        })
        return
      }

      // ── Successful login ───────────────────────────────────────────────
      const auth = result as AuthResponse
      setAuth(auth.user, auth.accessToken)

      // Attempt to fetch full profile context (tenant, subscription, linkedUsers).
      // If this fails (e.g., backend bug) we still navigate — basic auth works.
      try {
        const me = await authService.getFullProfile()
        const user = normalizeMeResponse(me)
        setFullAuth(user, auth.accessToken, me.tenant, me.subscription, me.linkedUsers)
      } catch {
        // Non-fatal — user is still logged in with basic profile from login response
      }

      toast.success(`Welcome back, ${auth.user.fullName}!`)

      // Redirect to the originally requested page or dashboard
      const from = (location.state as { from?: string } | null)?.from ?? ROUTES.DASHBOARD
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@college.edu"
                    autoComplete="email"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="pr-10"
                      disabled={isSubmitting}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      tabIndex={-1}
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me */}
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input accent-primary"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal text-sm">
                  Remember my email
                </FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.SIGNUP} className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>

      {/* Demo login — shown in dev builds and mock/demo mode */}
      {(import.meta.env.DEV || import.meta.env.VITE_APP_MODE === 'mock') && (
        <>
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>
          <DevLoginPanel />
          {import.meta.env.VITE_APP_MODE === 'mock' && (
            <div className="rounded-lg border border-dashed border-blue-400 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/20 px-4 py-3">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">Demo Credentials</p>
              <div className="space-y-1 text-xs text-blue-600 dark:text-blue-300">
                <p><span className="font-medium">Super Admin:</span> admin@dezolver.com / Password123</p>
                <p><span className="font-medium">College Admin:</span> college@dezolver.com / Password123</p>
                <p><span className="font-medium">Faculty:</span> faculty@dezolver.com / Password123</p>
                <p><span className="font-medium">Student:</span> student@dezolver.com / Password123</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
