import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateTenant } from '@/hooks/useTenants'
import { createTenantSchema, type CreateTenantFormValues } from '@/lib/schemas/tenant.schemas'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DOMAIN_OPTIONS = [
  { value: 'cse', label: 'Computer Science & Engineering' },
  { value: 'ece', label: 'Electronics & Communication' },
  { value: 'aiml', label: 'AI / Machine Learning' },
  { value: 'mech', label: 'Mechanical Engineering' },
  { value: 'eee', label: 'Electrical Engineering' },
  { value: 'civil', label: 'Civil Engineering' },
  { value: 'it', label: 'Information Technology' },
  { value: 'other', label: 'Other' },
]

export function TenantCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateTenant()

  const form = useForm<CreateTenantFormValues>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      kind: 'college',
      name: '',
      subdomain: '',
      primaryContactEmail: '',
      primaryDomain: 'cse',
      planCode: 'starter',
    },
  })

  const onSubmit = async (values: CreateTenantFormValues) => {
    try {
      const tenant = await mutateAsync(values)
      toast.success(`Tenant "${tenant.name}" created successfully.`)
      navigate(`/platform/tenants/${tenant.id}`, { replace: true })
    } catch (err) {
      const apiErr = (
        err as { response?: { data?: { error?: { code?: string; message?: string } } } }
      )?.response?.data?.error
      if (apiErr?.code === 'subdomain_taken') {
        form.setError('subdomain', { message: 'This subdomain is already taken.' })
      } else {
        toast.error(apiErr?.message ?? 'Failed to create tenant.')
      }
    }
  }

  // Auto-generate subdomain from name
  const handleNameChange = (value: string, onChange: (v: string) => void) => {
    onChange(value)
    if (!form.getValues('subdomain')) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 64)
      form.setValue('subdomain', slug)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Create Tenant"
        description="Add a new college or direct-subscriber tenant to the platform."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kind"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant Kind</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="college">College</SelectItem>
                          <SelectItem value="direct">Direct (B2C)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="planCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VIT Chennai"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value, field.onChange)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subdomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subdomain</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1">
                        <Input
                          placeholder="vit-chennai"
                          className="font-mono"
                          disabled={isPending}
                          {...field}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          .dezolver.com
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Lowercase letters, digits, and hyphens only.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact &amp; Academic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="primaryContactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="lms-admin@vit.ac.in"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Academic Domain</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DOMAIN_OPTIONS.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedStudentCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Students (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1200"
                          disabled={isPending}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Tenant
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
