import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Sun, Moon, Monitor,
  ShieldCheck, ShieldOff, Loader2, QrCode, Key, Eye, EyeOff,
} from 'lucide-react'

import { useSettingsStore } from '@/store/settingsStore'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { usersService } from '@/services/api/users.service'
import type { MfaStatus, MfaEnrollResponse } from '@/services/api/users.service'
import { QUERY_KEYS } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// ─── Theme ────────────────────────────────────────────────────────────────────

type Theme = 'light' | 'dark' | 'system'

const themes: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

// ─── MFA schemas ──────────────────────────────────────────────────────────────

const mfaConfirmSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d+$/, 'Code must be numeric only'),
})

type MfaConfirmValues = z.infer<typeof mfaConfirmSchema>

// ─── MFA Enrollment Dialog ────────────────────────────────────────────────────

interface MfaEnrollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function MfaEnrollDialog({ open, onOpenChange, onSuccess }: MfaEnrollDialogProps) {
  const [step, setStep] = useState<'loading' | 'scan' | 'confirm'>('loading')
  const [enrollData, setEnrollData] = useState<MfaEnrollResponse | null>(null)
  const [showSecret, setShowSecret] = useState(false)

  const form = useForm<MfaConfirmValues>({
    resolver: zodResolver(mfaConfirmSchema),
    defaultValues: { code: '' },
  })

  const startEnrollment = async () => {
    setStep('loading')
    try {
      const data = await usersService.enrollMfa()
      setEnrollData(data)
      setStep('scan')
    } catch {
      toast.error('Failed to start MFA enrollment. Please try again.')
      onOpenChange(false)
    }
  }

  // Start enrollment when the dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      form.reset()
      setStep('loading')
      setEnrollData(null)
      setShowSecret(false)
      startEnrollment()
    }
    onOpenChange(open)
  }

  const onConfirm = async (values: MfaConfirmValues) => {
    try {
      await usersService.confirmMfa({ code: values.code })
      toast.success('Two-factor authentication enabled successfully.')
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const code = (
        err as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code
      if (code === 'invalid_totp_code') {
        form.setError('code', { message: 'Invalid code. Check your authenticator and try again.' })
      } else {
        toast.error('Failed to confirm MFA. Please try again.')
      }
    }
  }

  const handleCodeChange = (value: string, onChange: (v: string) => void) => {
    const digits = value.replace(/\D/g, '').slice(0, 6)
    onChange(digits)
    if (digits.length === 6) {
      form.handleSubmit(onConfirm)()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enable two-factor authentication</DialogTitle>
          <DialogDescription>
            Use an authenticator app like Google Authenticator or Authy.
          </DialogDescription>
        </DialogHeader>

        {step === 'loading' && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {step === 'scan' && enrollData && (
          <div className="space-y-4">
            {enrollData.qrCodeDataUrl ? (
              <div className="flex justify-center">
                <img
                  src={enrollData.qrCodeDataUrl}
                  alt="QR code for authenticator"
                  className="h-48 w-48 rounded border"
                />
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-center space-y-2">
                <QrCode className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Scan the QR code with your authenticator app, or enter the secret manually.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Manual entry key
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono break-all">
                  {showSecret ? enrollData.secret : '•'.repeat(enrollData.secret.length)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setShowSecret((p) => !p)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button className="w-full" onClick={() => setStep('confirm')}>
                I've added it to my app
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'confirm' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onConfirm)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification code</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-2xl tracking-[0.4em] h-14 font-mono"
                        autoComplete="one-time-code"
                        disabled={form.formState.isSubmitting}
                        {...field}
                        onChange={(e) => handleCodeChange(e.target.value, field.onChange)}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the 6-digit code from your authenticator app.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('scan')}
                  disabled={form.formState.isSubmitting}
                >
                  Back
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm &amp; enable
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── MFA Disable Dialog ───────────────────────────────────────────────────────

interface MfaDisableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function MfaDisableDialog({ open, onOpenChange, onSuccess }: MfaDisableDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDisable = async () => {
    setIsSubmitting(true)
    try {
      await usersService.disableMfa()
      toast.success('Two-factor authentication disabled.')
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error('Failed to disable MFA. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disable two-factor authentication?</DialogTitle>
          <DialogDescription>
            Your account will be less secure. You can re-enable MFA at any time.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDisable} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disable MFA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── MFA Security Card ────────────────────────────────────────────────────────

function MfaSection() {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [mfaStatus, setMfaStatus] = useState<MfaStatus | null>(
    user ? { enrolled: user.mfaEnabled } : null
  )
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)

  const isEnrolled = mfaStatus?.enrolled ?? user?.mfaEnabled ?? false

  const handleEnrollSuccess = () => {
    setMfaStatus({ enrolled: true, factorType: 'totp' })
    updateUser({ mfaEnabled: true })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
  }

  const handleDisableSuccess = () => {
    setMfaStatus({ enrolled: false })
    updateUser({ mfaEnabled: false })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isEnrolled ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldOff className="h-5 w-5 text-muted-foreground" />
            )}
            <p className="text-sm font-medium">Two-factor authentication</p>
            {isEnrolled ? (
              <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs">
                Enabled
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Disabled</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground pl-7">
            {isEnrolled
              ? 'Your account is protected with a TOTP authenticator app.'
              : 'Add an extra layer of security by requiring a code from your authenticator app.'}
          </p>
        </div>

        {isEnrolled ? (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-destructive hover:text-destructive"
            onClick={() => setDisableOpen(true)}
          >
            Disable
          </Button>
        ) : (
          <Button size="sm" className="shrink-0" onClick={() => setEnrollOpen(true)}>
            <Key className="mr-2 h-3.5 w-3.5" />
            Enable
          </Button>
        )}
      </div>

      <MfaEnrollDialog
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        onSuccess={handleEnrollSuccess}
      />
      <MfaDisableDialog
        open={disableOpen}
        onOpenChange={setDisableOpen}
        onSuccess={handleDisableSuccess}
      />
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const { theme, setTheme } = useSettingsStore()
  const { user, roleLabel } = useAuth()

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and appearance."
      />

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Full Name</p>
              <p className="font-medium">{user?.fullName ?? '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <Badge variant="secondary">{roleLabel ?? '—'}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Tenant</p>
              <p className="font-medium">{user?.tenantName ?? '—'}</p>
            </div>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Profile editing is available in Phase 12 (Advanced Features).
          </p>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how Dezolver looks on your device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {themes.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant="outline"
                className={cn(
                  'flex-1 flex-col gap-2 h-20',
                  theme === value && 'border-primary bg-primary/5 text-primary'
                )}
                onClick={() => setTheme(value)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Authentication and session settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MfaSection />
          <Separator />
          <p className="text-xs text-muted-foreground">
            Password change and active session management are available in Phase 12.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
