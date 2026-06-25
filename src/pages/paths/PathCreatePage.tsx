import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreatePath } from '@/hooks/usePaths'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DOMAIN_LABELS, PATH_KIND_LABELS, type PathKind } from '@/types/path.types'

const schema = z.object({
  kind: z.enum(['default', 'curated', 'personalized']),
  title: z.string().min(3, 'At least 3 characters').max(255),
  description: z.string().max(5000).optional(),
  outcomeStatement: z.string().max(1000).optional(),
  domainCode: z.string().optional(),
  estimatedMinutes: z.number().int().positive().optional(),
})
type FormValues = z.infer<typeof schema>

export function PathCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreatePath()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { kind: 'curated', title: '', description: '', outcomeStatement: '' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const path = await mutateAsync({
        kind: values.kind as PathKind,
        title: values.title,
        description: values.description || undefined,
        outcomeStatement: values.outcomeStatement || undefined,
        domainCode: values.domainCode || undefined,
        estimatedMinutes: values.estimatedMinutes,
      })
      toast.success(`Path "${path.title}" created.`)
      navigate(`/paths/${path.id}`)
    } catch {
      toast.error('Failed to create path.')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Create Path"
        description="Build a structured learning journey."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/paths')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="kind" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.entries(PATH_KIND_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="domainCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain (optional)</FormLabel>
                    <Select value={field.value ?? 'none'} onValueChange={(v) => field.onChange(v === 'none' ? undefined : v)} disabled={isPending}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Backend Engineer Path" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={3} disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="outcomeStatement" render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning Outcome</FormLabel>
                  <FormControl><Textarea rows={2} placeholder="Upon completion, learners will be able to…" disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="estimatedMinutes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="600 (10 hours)"
                      disabled={isPending}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>Total estimated time in minutes.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Separator />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/paths')} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Path
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
