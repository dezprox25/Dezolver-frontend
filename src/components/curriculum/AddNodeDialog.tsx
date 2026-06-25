import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAddNode } from '@/hooks/useCurriculum'
import { NODE_KINDS, NODE_KIND_LABELS } from '@/types/curriculum.types'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SyllabusNodeKind, SyllabusNode } from '@/types/curriculum.types'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  kind: z.enum(['topic', 'subtopic', 'lesson', 'room', 'problem', 'assessment'] as const),
  contentRef: z.string().max(255).optional(),
})

type FormValues = z.infer<typeof schema>

interface AddNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  syllabusId: string
  parentNode?: SyllabusNode | null
  onSuccess?: () => void
}

export function AddNodeDialog({
  open,
  onOpenChange,
  syllabusId,
  parentNode,
  onSuccess,
}: AddNodeDialogProps) {
  const { mutateAsync: addNode, isPending } = useAddNode()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', kind: 'topic', contentRef: '' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await addNode({
        syllabusId,
        dto: {
          title: values.title,
          kind: values.kind as SyllabusNodeKind,
          parentId: parentNode?.id,
          contentRef: values.contentRef || undefined,
          position: 0,
        },
      })
      toast.success('Node added.')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('Failed to add node.')
    }
  }

  const handleClose = (open: boolean) => {
    if (!isPending) {
      form.reset()
      onOpenChange(open)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {parentNode ? `Add child to "${parentNode.title}"` : 'Add Root Node'}
          </DialogTitle>
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
                    <Input placeholder="e.g. Semester 1, Programming in C" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kind</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NODE_KINDS.map((k) => (
                        <SelectItem key={k} value={k}>
                          {NODE_KIND_LABELS[k]}
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
              name="contentRef"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Reference (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. room:slug or course:id"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Adding…' : 'Add Node'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
