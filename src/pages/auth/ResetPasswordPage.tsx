import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react'
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
} from '@/components/ui/form'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/schemas/auth.schemas'
import { authService } from '@/services/api/auth.service'
import { ROUTES } from '@/lib/constants'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  const token = searchParams.get('token') ?? ''

  // Redirect to forgot-password if no token
  useEffect(() => {
    if (!token) {
      navigate(ROUTES.FORGOT_PASSWORD, { replace: true })
    }
  }, [token, navigate])

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '', token },
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsSubmitting(true)
    try {
      await authService.resetPassword({ token: values.token, password: values.password })
      setSucceeded(true)
    } catch (err: unknown) {
      const code = (
        err as { response?: { data?: { error?: { code?: string; message?: string } } } }
      )?.response?.data?.error
      if (code?.code === 'reset_token_expired' || code?.code === 'reset_token_invalid') {
        toast.error('This reset link has expired or is invalid. Please request a new one.')
        navigate(ROUTES.FORGOT_PASSWORD, { replace: true })
      } else {
        toast.error(code?.message ?? 'Failed to reset password. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) return null

  if (succeeded) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Password updated</h2>
            <p className="text-sm text-muted-foreground">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
          </div>
        </div>
        <Button className="w-full" onClick={() => navigate(ROUTES.LOGIN, { replace: true })}>
          Continue to sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Set new password</h2>
          <p className="text-sm text-muted-foreground">
            Choose a strong password with at least 12 characters
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          All existing sessions will be signed out after resetting your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...form.register('token')} />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 12 characters"
                      autoComplete="new-password"
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
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
                      onClick={() => setShowConfirm((p) => !p)}
                    >
                      {showConfirm ? (
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </Form>

      <Link
        to={ROUTES.LOGIN}
        className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Back to sign in
      </Link>
    </div>
  )
}
