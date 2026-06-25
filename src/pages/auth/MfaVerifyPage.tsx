import { useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { mfaVerifySchema, type MfaVerifyFormValues } from '@/lib/schemas/auth.schemas'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/api/auth.service'
import { normalizeMeResponse } from '@/types/auth.types'
import { ROUTES } from '@/lib/constants'

interface MfaLocationState {
  mfaToken?: string
}

export function MfaVerifyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth, setFullAuth } = useAuthStore()

  const state = (location.state ?? {}) as MfaLocationState
  const mfaToken = state.mfaToken

  // If no MFA token in state, the user navigated here directly — redirect to login
  useEffect(() => {
    if (!mfaToken) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [mfaToken, navigate])

  const form = useForm<MfaVerifyFormValues>({
    resolver: zodResolver(mfaVerifySchema),
    defaultValues: { code: '', mfaToken: mfaToken ?? '' },
  })

  const onSubmit = async (values: MfaVerifyFormValues) => {
    try {
      const auth = await authService.verifyMfa({
        mfaToken: values.mfaToken,
        code: values.code,
      })

      setAuth(auth.user, auth.accessToken)

      try {
        const me = await authService.getFullProfile()
        const user = normalizeMeResponse(me)
        setFullAuth(user, auth.accessToken, me.tenant, me.subscription, me.linkedUsers)
      } catch {
        // Non-fatal
      }

      toast.success('Verification successful')
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err: unknown) {
      const code = (
        err as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code
      if (code === 'mfa_token_expired') {
        toast.error('Your session has timed out. Please sign in again.')
        navigate(ROUTES.LOGIN, { replace: true })
      } else {
        toast.error('Invalid code. Please check your authenticator app and try again.')
        form.setValue('code', '')
      }
    }
  }

  // Auto-submit when 6 digits are entered
  const handleCodeChange = (value: string, onChange: (v: string) => void) => {
    const digits = value.replace(/\D/g, '').slice(0, 6)
    onChange(digits)
    if (digits.length === 6) {
      form.handleSubmit(onSubmit)()
    }
  }

  if (!mfaToken) return null

  const isSubmitting = form.formState.isSubmitting

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Two-factor authentication</h2>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden mfaToken field */}
          <input type="hidden" {...form.register('mfaToken')} />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Authentication code</FormLabel>
                <FormControl>
                  <Input
                    autoFocus
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-2xl tracking-[0.5em] h-14 font-mono"
                    autoComplete="one-time-code"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => handleCodeChange(e.target.value, field.onChange)}
                  />
                </FormControl>
                <FormDescription className="text-center">
                  The code refreshes every 30 seconds
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Verifying…' : 'Verify'}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
