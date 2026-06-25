/**
 * BlockEditor — a form-based block editor for Room content.
 *
 * Internally uses `EditorBlock` (ContentBlock + `_editorKey`) so each block has
 * a stable identity that survives add, remove, and future reorder operations.
 * The `_editorKey` is stripped before sending blocks to the API.
 */
import { useState } from 'react'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContentBlock, BlockType } from '@/types/content.types'
import { BLOCK_TYPE_LABELS } from '@/types/content.types'

// ─── Editor block type (client-only `_editorKey`) ────────────────────────────

export type EditorBlock = ContentBlock & { _editorKey: string }

/** Wrap an existing ContentBlock with a stable key. */
export function wrapWithKey(block: ContentBlock): EditorBlock {
  return { ...block, _editorKey: crypto.randomUUID() }
}

/** Wrap an array of ContentBlocks for editing. */
export function wrapAllWithKeys(blocks: ContentBlock[]): EditorBlock[] {
  return blocks.map(wrapWithKey)
}

/** Strip `_editorKey` before sending to the API. */
export function stripEditorKeys(blocks: EditorBlock[]): ContentBlock[] {
  return blocks.map((b) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _editorKey, ...rest } = b
    return rest as ContentBlock
  })
}

/** Create a brand-new EditorBlock with a fresh key. */
function makeBlock(type: BlockType): EditorBlock {
  const key = crypto.randomUUID()
  switch (type) {
    case 'text':             return { type, content: '', _editorKey: key }
    case 'heading':          return { type, level: 2, content: '', _editorKey: key }
    case 'code':             return { type, language: 'python', content: '', _editorKey: key }
    case 'callout':          return { type, tone: 'info', content: '', _editorKey: key }
    case 'divider':          return { type: 'divider', _editorKey: key }
    case 'task':             return { type, description: '', required: false, _editorKey: key }
    case 'media':            return { type, assetId: '', _editorKey: key }
    case 'embedded_problem': return { type, problemId: '', _editorKey: key }
    case 'embedded_quiz':    return { type, questions: [], _editorKey: key }
    default:                 return { type: 'text', content: '', _editorKey: key }
  }
}

// ─── BlockEditor ─────────────────────────────────────────────────────────────

interface BlockEditorProps {
  blocks: EditorBlock[]
  onChange: (blocks: EditorBlock[]) => void
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [addingType, setAddingType] = useState<BlockType>('text')

  const addBlock = () => onChange([...blocks, makeBlock(addingType)])

  const removeBlock = (key: string) =>
    onChange(blocks.filter((b) => b._editorKey !== key))

  const updateBlock = (key: string, updates: Partial<ContentBlock>) =>
    onChange(
      blocks.map((b) =>
        b._editorKey === key ? ({ ...b, ...updates } as EditorBlock) : b
      )
    )

  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <Card key={block._editorKey}>
          <CardHeader className="pb-2 pr-12">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground/40" aria-hidden="true" />
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                {BLOCK_TYPE_LABELS[block.type]}
              </CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove block"
              className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeBlock(block._editorKey)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-2 pb-3">
            {block.type === 'text' && (
              <Textarea
                rows={3}
                placeholder="Text content…"
                value={block.content}
                onChange={(e) => updateBlock(block._editorKey, { content: e.target.value })}
              />
            )}

            {block.type === 'heading' && (
              <div className="flex gap-2">
                <Select
                  value={String(block.level)}
                  onValueChange={(v) =>
                    updateBlock(block._editorKey, { level: Number(v) as 1 | 2 | 3 })
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">H1</SelectItem>
                    <SelectItem value="2">H2</SelectItem>
                    <SelectItem value="3">H3</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Heading text…"
                  value={block.content}
                  onChange={(e) => updateBlock(block._editorKey, { content: e.target.value })}
                  className="flex-1"
                />
              </div>
            )}

            {block.type === 'code' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Language (python, js, cpp…)"
                    value={block.language}
                    onChange={(e) => updateBlock(block._editorKey, { language: e.target.value })}
                    className="w-40"
                  />
                  <Input
                    placeholder="Filename (optional)"
                    value={block.filename ?? ''}
                    onChange={(e) =>
                      updateBlock(block._editorKey, { filename: e.target.value || undefined })
                    }
                    className="flex-1"
                  />
                </div>
                <Textarea
                  rows={6}
                  className="font-mono text-xs"
                  placeholder="Code…"
                  value={block.content}
                  onChange={(e) => updateBlock(block._editorKey, { content: e.target.value })}
                />
              </div>
            )}

            {block.type === 'callout' && (
              <div className="space-y-2">
                <Select
                  value={block.tone}
                  onValueChange={(v) =>
                    updateBlock(block._editorKey, { tone: v as typeof block.tone })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['info', 'warning', 'success', 'error', 'tip'] as const).map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  rows={2}
                  placeholder="Callout content…"
                  value={block.content}
                  onChange={(e) => updateBlock(block._editorKey, { content: e.target.value })}
                />
              </div>
            )}

            {block.type === 'task' && (
              <div className="flex gap-2 items-start">
                <Input
                  placeholder="Task description…"
                  value={block.description}
                  onChange={(e) => updateBlock(block._editorKey, { description: e.target.value })}
                  className="flex-1"
                />
                <label className="flex items-center gap-1.5 text-sm mt-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={block.required}
                    onChange={(e) =>
                      updateBlock(block._editorKey, { required: e.target.checked })
                    }
                  />
                  Required
                </label>
              </div>
            )}

            {block.type === 'media' && (
              <Input
                placeholder="Asset ID…"
                value={block.assetId}
                onChange={(e) => updateBlock(block._editorKey, { assetId: e.target.value })}
              />
            )}

            {block.type === 'embedded_problem' && (
              <div className="flex gap-2">
                <Input
                  placeholder="Problem ID…"
                  value={block.problemId}
                  onChange={(e) => updateBlock(block._editorKey, { problemId: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Pass %"
                  value={block.passingScore ?? ''}
                  onChange={(e) =>
                    updateBlock(block._editorKey, {
                      passingScore: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-24"
                />
              </div>
            )}

            {block.type === 'divider' && (
              <p className="text-xs text-muted-foreground">Horizontal rule separator</p>
            )}

            {block.type === 'embedded_quiz' && (
              <p className="text-xs text-muted-foreground">
                Quiz block — {block.questions.length} question
                {block.questions.length !== 1 ? 's' : ''} (full quiz editor in a future release)
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add block row */}
      <div className="flex items-center gap-2">
        <Select
          value={addingType}
          onValueChange={(v) => setAddingType(v as BlockType)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {BLOCK_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={addBlock}>
          <Plus className="mr-2 h-4 w-4" />
          Add Block
        </Button>
      </div>
    </div>
  )
}
