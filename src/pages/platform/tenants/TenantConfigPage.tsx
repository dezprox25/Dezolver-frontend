import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useTenant, useTenantConfig, useUpdateTenantConfig } from '@/hooks/useTenants'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const configSchema = z.object({
  branding: z.object({
    logoUrl: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
    faviconUrl: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
    primaryColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color (e.g. #3b82f6)')
      .optional()
      .or(z.literal('')),
  }),
  pathsLockCurated: z.boolean(),
  ssoEnabled: z.boolean(),
})

type ConfigFormValues = z.infer<typeof configSchema>

export function TenantConfigPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: tenant } = useTenant(id)
  const { data: config, isLoading, isError } = useTenantConfig(id)
  const { mutateAsync: updateConfig, isPending } = useUpdateTenantConfig(id!)

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      branding: { logoUrl: '', faviconUrl: '', primaryColor: '' },
      pathsLockCurated: false,
      ssoEnabled: false,
    },
  })

  useEffect(() => {
    if (config) {
      form.reset({
        branding: {
          logoUrl: config.branding?.logoUrl ?? '',
          faviconUrl: config.branding?.faviconUrl ?? '',
          primaryColor: config.branding?.primaryColor ?? '',
        },
        pathsLockCurated: config.pathsLockCurated ?? false,
        ssoEnabled: config.ssoEnabled ?? false,
      })
    }
  }, [config, form])

  const onSubmit = async (values: ConfigFormValues) => {
    try {
      const payload = {
        branding: {
          ...(values.branding.logoUrl ? { logoUrl: values.branding.logoUrl } : { logoUrl: null }),
          ...(values.branding.faviconUrl
            ? { faviconUrl: values.branding.faviconUrl }
            : { faviconUrl: null }),
          ...(values.branding.primaryColor
            ? { primaryColor: values.branding.primaryColor }
            : {}),
        },
        pathsLockCurated: values.pathsLockCurated,
        ssoEnabled: values.ssoEnabled,
      }
      await updateConfig(payload)
      toast.success('Tenant configuration saved.')
    } catch {
      toast.error('Failed to save configuration.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Failed to load configuration.{' '}
        <button className="underline" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Tenant Configuration"
        description={tenant ? `Configure ${tenant.name}` : 'Configure tenant settings'}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branding</CardTitle>
              <CardDescription>
                Customize how this tenant appears to its users on the login page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="branding.logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://cdn.example.com/logo.png"
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>HTTPS URL to a PNG or SVG logo (recommended 200×50 px).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branding.faviconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favicon URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://cdn.example.com/favicon.ico"
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>HTTPS URL to a 32×32 favicon (ICO or PNG).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branding.primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input
                          placeholder="#3b82f6"
                          maxLength={7}
                          disabled={isPending}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      {field.value && /^#[0-9A-Fa-f]{6}$/.test(field.value) && (
                        <div
                          className="h-9 w-9 rounded-md border shrink-0"
                          style={{ backgroundColor: field.value }}
                        />
                      )}
                    </div>
                    <FormDescription>Hex color code applied to the login page accent.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Feature flags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature Flags</CardTitle>
              <CardDescription>
                Per-tenant feature controls. SSO requires an enterprise or unlimited plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pathsLockCurated"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel className="text-sm font-medium">Lock Curated Paths</FormLabel>
                      <FormDescription className="text-xs mt-0.5">
                        Prevent students from forking curated learning paths.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ssoEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel className="text-sm font-medium">Enable SSO</FormLabel>
                      <FormDescription className="text-xs mt-0.5">
                        Allow SAML/OIDC login for this tenant. Requires provider configuration.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Configuration
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
