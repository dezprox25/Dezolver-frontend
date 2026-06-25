import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useIssuanceRules, useCreateIssuanceRule, useDeactivateIssuanceRule } from '@/hooks/useIssuanceRules'
import { useCertificateTemplates } from '@/hooks/useCertificateTemplates'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { IssuanceRuleTable } from '@/components/credentials/IssuanceRuleTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TRIGGER_LABELS } from '@/types/certificate.types'
import type { IssuanceRule } from '@/types/certificate.types'

const schema = z.object({
  name: z.string().max(255).optional(),
  triggerEventType: z.enum(['PathCompleted', 'EventCompleted', 'RoomCompleted', 'ManualIssue']),
  templateId: z.string().min(1, 'Template is required'),
})
type FormValues = z.infer<typeof schema>

export function IssuanceRulesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: rulesData, isLoading, isError, refetch } = useIssuanceRules()
  const { data: templatesData } = useCertificateTemplates()
  const { mutateAsync: create, isPending: creating } = useCreateIssuanceRule()
  const { mutateAsync: deactivate } = useDeactivateIssuanceRule()

  const rules = rulesData?.items ?? []
  const templates = templatesData?.pages.flatMap((p) => p.items) ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', triggerEventType: 'PathCompleted', templateId: '' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await create({
        name: values.name || undefined,
        triggerEventType: values.triggerEventType,
        templateId: values.templateId,
      })
      toast.success('Rule created.')
      setCreateOpen(false)
      form.reset()
    } catch {
      toast.error('Failed to create rule.')
    }
  }

  const handleDeactivate = async (rule: IssuanceRule) => {
    try {
      await deactivate(rule.id)
      toast.success('Rule deactivated.')
    } catch {
      toast.error('Failed to deactivate rule.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issuance Rules"
        description="Configure when certificates are automatically issued."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Rule
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load rules"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : (
        <IssuanceRuleTable rules={rules} onDeactivate={handleDeactivate} />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Issuance Rule</DialogTitle>
            <DialogDescription>
              Define when a certificate should be automatically issued.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name (optional)</FormLabel>
                  <FormControl><Input placeholder="e.g. Backend Path Certificate" disabled={creating} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="triggerEventType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Trigger</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={creating}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="templateId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={creating}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating…' : 'Create Rule'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
