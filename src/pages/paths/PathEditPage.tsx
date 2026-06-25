/**
 * PathEditPage — edit path metadata and manage steps.
 * Only draft paths can be edited (enforced by server too).
 * Steps are managed inline with add/remove/reorder capabilities.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import {
  usePath,
  useUpdatePath,
  useAddPathStep,
  useRemovePathStep,
} from '@/hooks/usePaths'
import { PathStatusBadge } from '@/components/paths/PathStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import type { UpdatePathDto } from '@/types/path.types'

const schema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(5000).optional(),
  outcomeStatement: z.string().max(1000).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
})
type FormValues = z.infer<typeof schema>

export function PathEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: path, isLoading, isError } = usePath(id)
  const { mutateAsync: update, isPending: updating } = useUpdatePath()
  const { mutateAsync: addStep, isPending: addingStep } = useAddPathStep()
  const { mutateAsync: removeStep } = useRemovePathStep()

  const [newRoomId, setNewRoomId] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', outcomeStatement: '' },
  })

  useEffect(() => {
    if (!path) return
    form.reset({
      title: path.title,
      description: path.description ?? '',
      outcomeStatement: path.outcomeStatement ?? '',
      estimatedMinutes: path.estimatedMinutes ?? undefined,
    })
  }, [path, form])

  const onSubmit = async (values: FormValues) => {
    if (!path) return
    const dto: UpdatePathDto = {
      title: values.title,
      description: values.description || undefined,
      outcomeStatement: values.outcomeStatement || undefined,
      estimatedMinutes: values.estimatedMinutes,
    }
    try {
      await update({ id: path.id, dto })
      toast.success('Path updated.')
    } catch {
      toast.error('Update failed.')
    }
  }

  const handleAddStep = async () => {
    if (!path || !newRoomId.trim()) return
    try {
      await addStep({
        pathId: path.id,
        dto: {
          roomId: newRoomId.trim(),
          orderIndex: (path.steps?.length ?? 0),
          isOptional: false,
          prerequisiteStepIds: [],
        },
      })
      setNewRoomId('')
      toast.success('Step added.')
    } catch {
      toast.error('Failed to add step.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (isError || !path) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Path not found.{' '}
        <button className="underline" onClick={() => navigate('/paths')}>Back</button>
      </div>
    )
  }

  if (path.status !== 'draft') {
    return (
      <div className="max-w-xl py-16 mx-auto text-center space-y-3">
        <PathStatusBadge status={path.status} />
        <p className="text-sm text-muted-foreground">Only draft paths can be edited.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(`/paths/${path.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    )
  }

  const steps = path.steps ?? []

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={`Edit: ${path.title}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(`/paths/${path.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input disabled={updating} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={3} disabled={updating} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="outcomeStatement" render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning Outcome</FormLabel>
                  <FormControl><Textarea rows={2} disabled={updating} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="estimatedMinutes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Minutes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={updating}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={updating}>
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Details
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      {/* Step management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Steps ({steps.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
              <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" aria-hidden="true" />
              <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm flex-1 font-mono truncate">
                {step.room?.title ?? step.roomId}
              </span>
              {step.isOptional && (
                <Badge variant="secondary" className="text-[10px] shrink-0">Optional</Badge>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={async () => {
                  try {
                    await removeStep({ pathId: path.id, stepId: step.id })
                    toast.success('Step removed.')
                  } catch {
                    toast.error('Remove failed.')
                  }
                }}
                aria-label={`Remove step ${i + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}

          {/* Add step */}
          <div className="flex items-center gap-2 pt-1">
            <Input
              className="font-mono text-sm h-8 flex-1"
              placeholder="Room ID (UUID)…"
              value={newRoomId}
              onChange={(e) => setNewRoomId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAddStep() }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStep}
              disabled={addingStep || !newRoomId.trim()}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a room UUID from the Content Catalog to add it as a step.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
