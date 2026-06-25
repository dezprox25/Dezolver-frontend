import { cn } from '@/lib/utils/cn'
import type { ContentBlock, CalloutTone } from '@/types/content.types'

// ─── Callout styles ───────────────────────────────────────────────────────────

const calloutStyles: Record<CalloutTone, string> = {
  info: 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  warning: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  error: 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300',
  tip: 'border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
}

const calloutIcons: Record<CalloutTone, string> = {
  info: 'ℹ',
  warning: '⚠',
  success: '✓',
  error: '✕',
  tip: '💡',
}

// ─── Individual block renderers ───────────────────────────────────────────────

function TextBlock({ content }: { content: string }) {
  return (
    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
      {content}
    </p>
  )
}

function HeadingBlock({ level, content }: { level: 1 | 2 | 3; content: string }) {
  const cls = cn('font-semibold text-foreground', {
    'text-xl mt-6 mb-2': level === 1,
    'text-lg mt-5 mb-2': level === 2,
    'text-base mt-4 mb-1': level === 3,
  })
  if (level === 1) return <h2 className={cls}>{content}</h2>
  if (level === 2) return <h3 className={cls}>{content}</h3>
  return <h4 className={cls}>{content}</h4>
}

function CodeBlock({ language, content, filename }: { language: string; content: string; filename?: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 overflow-hidden text-sm font-mono">
      {(language || filename) && (
        <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-1.5">
          <span className="text-xs text-muted-foreground">{filename ?? language}</span>
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
        <code>{content}</code>
      </pre>
    </div>
  )
}

function CalloutBlock({ tone, content }: { tone: CalloutTone; content: string }) {
  return (
    <div className={cn('flex gap-3 rounded-lg border px-4 py-3 text-sm', calloutStyles[tone])}>
      <span className="shrink-0 select-none text-base">{calloutIcons[tone]}</span>
      <p className="leading-relaxed">{content}</p>
    </div>
  )
}

function EmbeddedProblemBlock({
  problemId,
  passingScore,
}: {
  problemId: string
  passingScore?: number
}) {
  return (
    <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary/70 mb-1">
        Embedded Problem
      </p>
      <p className="text-sm font-mono text-muted-foreground">{problemId}</p>
      {passingScore !== undefined && (
        <p className="text-xs text-muted-foreground mt-1">Passing score: {passingScore}%</p>
      )}
    </div>
  )
}

function TaskBlock({ description, required }: { description: string; required: boolean }) {
  return (
    <div className="flex gap-3 items-start rounded-lg border bg-card px-4 py-3">
      <div className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-muted-foreground/40" />
      <div>
        <p className="text-sm">{description}</p>
        {required && (
          <p className="text-xs text-muted-foreground mt-0.5">Required to complete this room</p>
        )}
      </div>
    </div>
  )
}

function DividerBlock() {
  return <hr className="border-border my-2" />
}

function MediaBlockRenderer({ assetId, caption }: { assetId: string; caption?: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-4 py-6 text-center">
      <p className="text-xs font-mono text-muted-foreground">{assetId}</p>
      {caption && <p className="text-xs text-muted-foreground mt-1">{caption}</p>}
      <p className="text-xs text-muted-foreground/60 mt-2">Media asset (requires CDN URL)</p>
    </div>
  )
}

// ─── Main renderer ────────────────────────────────────────────────────────────

interface BlockRendererProps {
  block: ContentBlock
  className?: string
}

export function BlockRenderer({ block, className }: BlockRendererProps) {
  const el = (() => {
    switch (block.type) {
      case 'text':
        return <TextBlock content={block.content} />
      case 'heading':
        return <HeadingBlock level={block.level} content={block.content} />
      case 'code':
        return <CodeBlock language={block.language} content={block.content} filename={block.filename} />
      case 'callout':
        return <CalloutBlock tone={block.tone} content={block.content} />
      case 'embedded_problem':
        return <EmbeddedProblemBlock problemId={block.problemId} passingScore={block.passingScore} />
      case 'task':
        return <TaskBlock description={block.description} required={block.required} />
      case 'divider':
        return <DividerBlock />
      case 'media':
        return <MediaBlockRenderer assetId={block.assetId} caption={block.caption} />
      case 'embedded_quiz':
        return (
          <div className="rounded-lg border bg-muted/20 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Quiz ({block.questions.length} questions)
            </p>
            {block.questions.map((q, i) => (
              <p key={q.id} className="text-sm text-muted-foreground">{i + 1}. {q.text}</p>
            ))}
          </div>
        )
      default:
        return null
    }
  })()

  if (!el) return null
  return <div className={cn('my-3', className)}>{el}</div>
}

// ─── Room body renderer ───────────────────────────────────────────────────────

interface RoomBodyProps {
  blocks: ContentBlock[]
  className?: string
}

export function RoomBody({ blocks, className }: RoomBodyProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No content blocks.</p>
    )
  }
  return (
    <div className={cn('space-y-1', className)}>
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </div>
  )
}
