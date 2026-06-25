import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
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
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/schemas/auth.schemas'
import { authService } from '@/services/api/auth.service'
import { ROUTES } from '@/lib/constants'

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true)
    try {
      await authService.forgotPassword(values)
      // Always show success to prevent email enumeration
      setSubmitted(true)
    } catch {
      // Intentionally still show success — backend is silent on non-existent emails
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              If an account exists for{' '}
              <span className="font-medium text-foreground">{form.getValues('email')}</span>, you
              will receive a password reset link shortly.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive an email? Check your spam folder or{' '}
          <button
            type="button"
            className="underline hover:text-foreground transition-colors"
            onClick={() => setSubmitted(false)}
          >
            try again
          </button>
          .
        </p>
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Reset your password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      </Form>

      <Link
        to={ROUTES.LOGIN}
        className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>
    </div>
  )
}
