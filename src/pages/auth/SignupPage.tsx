import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
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
import { signupSchema, type SignupFormValues } from '@/lib/schemas/auth.schemas'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/api/auth.service'
import { normalizeMeResponse } from '@/types/auth.types'
import { ROUTES } from '@/lib/constants'

function getErrorMessage(err: unknown): string {
  const apiErr = (
    err as { response?: { data?: { error?: { code?: string; message?: string } } } }
  )?.response?.data?.error
  if (apiErr?.code === 'email_already_registered') {
    return 'An account with this email already exists. Please sign in instead.'
  }
  return apiErr?.message ?? 'Sign up failed. Please try again.'
}

export function SignupPage() {
  const navigate = useNavigate()
  const { setAuth, setFullAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  })

  const onSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true)
    try {
      const auth = await authService.signup(values)
      setAuth(auth.user, auth.accessToken)

      try {
        const me = await authService.getFullProfile()
        const user = normalizeMeResponse(me)
        setFullAuth(user, auth.accessToken, me.tenant, me.subscription, me.linkedUsers)
      } catch {
        // Non-fatal
      }

      toast.success(`Welcome to Dezolver, ${auth.user.fullName}!`)
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Create an account</h2>
        <p className="text-sm text-muted-foreground">
          Start your learning journey on Dezolver
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Alice Kumar"
                    autoComplete="name"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
