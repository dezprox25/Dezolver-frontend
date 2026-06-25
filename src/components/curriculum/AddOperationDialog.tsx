import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAppendOperation } from '@/hooks/useCurriculum'
import { OPERATION_TYPES, OPERATION_TYPE_LABELS } from '@/types/curriculum.types'
import { Button } from '@/components/ui/button'
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
  FormDescription,
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
import type { OperationType } from '@/types/curriculum.types'

const schema = z.object({
  operationType: z.enum([
    'hide_node',
    'rename_node',
    'remap_content',
    'reorder_children',
    'add_child_node',
  ] as const),
  targetNodeId: z.string().uuid('Must be a valid node UUID'),
  newTitle: z.string().max(255).optional(),
  contentRef: z.string().max(255).optional(),
})

type FormValues = z.infer<typeof schema>

const OPERATION_DESCRIPTIONS: Record<OperationType, string> = {
  hide_node: 'Hide this node from students in this cohort.',
  rename_node: 'Replace the display title for this node.',
  remap_content: 'Point this node to a different room/course/problem.',
  reorder_children: 'Change the order of child nodes (provide comma-separated IDs).',
  add_child_node: 'Add a new child node under the target.',
}

interface AddOperationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  overlayId: string
  onSuccess?: () => void
}

export function AddOperationDialog({
  open,
  onOpenChange,
  overlayId,
  onSuccess,
}: AddOperationDialogProps) {
  const { mutateAsync: append, isPending } = useAppendOperation()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      operationType: 'hide_node',
      targetNodeId: '',
      newTitle: '',
      contentRef: '',
    },
  })

  const selectedType = form.watch('operationType')

  const onSubmit = async (values: FormValues) => {
    const payload: Record<string, unknown> = {}
    if (values.operationType === 'rename_node' && values.newTitle) {
      payload['title'] = values.newTitle
    }
    if (values.operationType === 'remap_content' && values.contentRef) {
      payload['contentRef'] = values.contentRef
    }

    try {
      await append({
        overlayId,
        dto: {
          operationType: values.operationType as OperationType,
          targetNodeId: values.targetNodeId,
          payload,
        },
      })
      toast.success('Operation added.')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('Failed to add operation.')
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
          <DialogTitle>Add Overlay Operation</DialogTitle>
          <DialogDescription>
            Operations are applied in sequence order when the effective syllabus is computed.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="operationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operation Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {OPERATION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {OPERATION_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {OPERATION_DESCRIPTIONS[selectedType as OperationType]}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetNodeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Node ID</FormLabel>
                  <FormControl>
                    <Input placeholder="UUID of the node to operate on" {...field} />
                  </FormControl>
                  <FormDescription>
                    Copy the node UUID from the syllabus tree.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === 'rename_node' && (
              <FormField
                control={form.control}
                name="newTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Replacement display title" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === 'remap_content' && (
              <FormField
                control={form.control}
                name="contentRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Content Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. room:new-slug" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                {isPending ? 'Adding…' : 'Add Operation'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
