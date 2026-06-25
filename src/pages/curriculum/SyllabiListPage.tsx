import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useSyllabi, useCreateSyllabus } from '@/hooks/useCurriculum'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { SyllabusStatusBadge } from '@/components/curriculum/SyllabusStatusBadge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils/format'

const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
})

type CreateFormValues = z.infer<typeof createSchema>

function CreateSyllabusDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { mutateAsync: create, isPending } = useCreateSyllabus()

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { title: '', description: '' },
  })

  const onSubmit = async (values: CreateFormValues) => {
    try {
      const syllabus = await create({
        title: values.title,
        description: values.description || undefined,
      })
      toast.success('Syllabus created.')
      form.reset()
      onOpenChange(false)
      navigate(`/curriculum/syllabi/${syllabus.id}`)
    } catch {
      toast.error('Failed to create syllabus.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!isPending) { form.reset(); onOpenChange(open) } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Syllabus</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Computer Science Engineering 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this syllabus"
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating…' : 'Create Syllabus'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function SyllabiListPage() {
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const { data: syllabi, isLoading, isError, refetch } = useSyllabi()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Syllabi"
        description="Manage platform curriculum syllabi."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Syllabus
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : isError ? (
        <EmptyState
          title="Failed to load syllabi"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : !syllabi?.length ? (
        <EmptyState
          title="No syllabi yet"
          description="Create the first syllabus for your platform."
          action={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />New Syllabus</Button>}
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {syllabi.map((s) => (
                <TableRow
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => navigate(`/curriculum/syllabi/${s.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/curriculum/syllabi/${s.id}`)
                    }
                  }}
                >
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>
                    <SyllabusStatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {formatDate(s.createdAt)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateSyllabusDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
