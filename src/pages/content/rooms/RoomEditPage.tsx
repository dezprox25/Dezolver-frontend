import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useRoom, useUpdateRoom } from '@/hooks/useRooms'
import { createRoomSchema, type CreateRoomFormValues } from '@/lib/schemas/content.schemas'
import {
  BlockEditor,
  wrapAllWithKeys,
  stripEditorKeys,
  type EditorBlock,
} from '@/components/content/BlockEditor'
import { TagInput } from '@/pages/content/rooms/RoomCreatePage'
import { PageHeader } from '@/components/shared/PageHeader'
import { ContentStatusBadge } from '@/components/content/ContentStatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { DOMAIN_CODE_LABELS } from '@/types/content.types'

export function RoomEditPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { data: room, isLoading, isError } = useRoom(slug)
  const { mutateAsync: updateRoom, isPending } = useUpdateRoom()

  const [blocks, setBlocks] = useState<EditorBlock[]>([])
  const [domainCodes, setDomainCodes] = useState<string[]>([])
  const [skillTags, setSkillTags] = useState<string[]>([])

  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      title: '',
      summary: '',
      difficulty: 'beginner',
      estimatedMinutes: undefined,
    },
  })

  // Populate form once data arrives
  useEffect(() => {
    if (!room) return
    form.reset({
      title: room.title,
      summary: room.summary ?? '',
      difficulty: room.difficulty,
      estimatedMinutes: room.estimatedMinutes ?? undefined,
    })
    setDomainCodes(room.domainCodes)
    setSkillTags(room.skillTags)
    setBlocks(wrapAllWithKeys(room.body ?? []))
  }, [room, form])

  const onSubmit = async (values: CreateRoomFormValues) => {
    if (!room) return
    try {
      await updateRoom({
        id: room.id,
        dto: {
          ...values,
          domainCodes,
          skillTags,
          body: stripEditorKeys(blocks),
        },
      })
      toast.success('Room saved.')
      navigate(`/content/rooms/${room.slug}`)
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      toast.error(msg ?? 'Failed to save room.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !room) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Room not found.{' '}
        <button className="underline" onClick={() => navigate('/content/rooms')}>
          Back to rooms
        </button>
      </div>
    )
  }

  // Only draft rooms can be edited; redirect for other statuses
  if (room.status !== 'draft') {
    return (
      <div className="max-w-xl py-16 mx-auto text-center space-y-3">
        <ContentStatusBadge status={room.status} />
        <p className="text-sm text-muted-foreground">
          Only <strong>draft</strong> rooms can be edited. This room is currently{' '}
          <strong>{room.status}</strong>.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate(`/content/rooms/${room.slug}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Room
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={`Edit: ${room.title}`}
        description="Changes are saved as a new draft version."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/content/rooms/${room.slug}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea rows={2} disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimatedMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isPending}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined
                            )
                          }
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Domain Codes</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DOMAIN_CODE_LABELS).map(([code, label]) => (
                    <Badge
                      key={code}
                      variant={domainCodes.includes(code) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() =>
                        setDomainCodes((prev) =>
                          prev.includes(code)
                            ? prev.filter((c) => c !== code)
                            : [...prev, code]
                        )
                      }
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
                <FormDescription>Click to toggle.</FormDescription>
              </div>

              <div className="space-y-2">
                <FormLabel>Skill Tags</FormLabel>
                <TagInput
                  value={skillTags}
                  onChange={setSkillTags}
                  placeholder="data-structures, recursion…"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content blocks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <BlockEditor blocks={blocks} onChange={setBlocks} />
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/content/rooms/${room.slug}`)}
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
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
