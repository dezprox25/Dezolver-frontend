import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateRoom } from '@/hooks/useRooms'
import { createRoomSchema, type CreateRoomFormValues } from '@/lib/schemas/content.schemas'
import { BlockEditor, stripEditorKeys, type EditorBlock } from '@/components/content/BlockEditor'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { DOMAIN_CODE_LABELS } from '@/types/content.types'

// ─── TagInput ─────────────────────────────────────────────────────────────────

export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const tag = input.trim().toLowerCase()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
      setInput('')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onChange(value.filter((t) => t !== tag))}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RoomCreatePage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateRoom()
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

  const onSubmit = async (values: CreateRoomFormValues) => {
    try {
      const room = await mutateAsync({
        ...values,
        domainCodes,
        skillTags,
        body: stripEditorKeys(blocks),
      })
      toast.success(`Room "${room.title}" created.`)
      navigate(`/content/rooms/${room.slug}`)
    } catch {
      toast.error('Failed to create room.')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="New Room"
        description="Create a block-based learning unit."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/content/rooms')}>
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
                      <Input
                        placeholder="Binary Search Trees — Insertion"
                        disabled={isPending}
                        {...field}
                      />
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
                      <Textarea
                        rows={2}
                        placeholder="Short description shown in catalogs…"
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
                          placeholder="25"
                          disabled={isPending}
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
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
                <FormDescription>Click to toggle domain categories.</FormDescription>
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
              onClick={() => navigate('/content/rooms')}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Room
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
