import { useState } from 'react'
import { ChevronDown, ChevronRight, BookOpen, FileText, Code2, Layers, Circle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { NODE_KIND_LABELS } from '@/types/curriculum.types'
import type { SyllabusNode, SyllabusNodeKind } from '@/types/curriculum.types'

const KIND_ICONS: Record<SyllabusNodeKind, React.ElementType> = {
  topic: Layers,
  subtopic: Layers,
  lesson: BookOpen,
  room: BookOpen,
  problem: Code2,
  assessment: FileText,
}

function NodeRow({
  node,
  depth,
  actions,
}: {
  node: SyllabusNode
  depth: number
  actions?: (node: SyllabusNode) => React.ReactNode
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = (node.children?.length ?? 0) > 0
  const Icon = KIND_ICONS[node.kind] ?? Circle

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 group',
          !node.visible && 'opacity-50'
        )}
        style={{ paddingLeft: `${8 + depth * 20}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}

        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

        <span className="flex-1 truncate font-medium">{node.title}</span>

        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 hidden group-hover:inline-flex">
          {NODE_KIND_LABELS[node.kind] ?? node.kind}
        </Badge>

        {node.dueDate && (
          <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:inline">
            Due {new Date(node.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </span>
        )}

        {!node.visible && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-red-300 text-red-500 shrink-0">
            Hidden
          </Badge>
        )}

        {actions && (
          <div className="hidden group-hover:flex items-center gap-1 shrink-0">
            {actions(node)}
          </div>
        )}
      </div>

      {hasChildren && expanded && (
        <div>
          {(node.children ?? []).map((child) => (
            <NodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              actions={actions}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SyllabusTreeProps {
  nodes: SyllabusNode[]
  /** Optional per-node action renderer (edit/delete buttons) */
  actions?: (node: SyllabusNode) => React.ReactNode
  className?: string
}

export function SyllabusTree({ nodes, actions, className }: SyllabusTreeProps) {
  if (nodes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No nodes in this syllabus yet.
      </p>
    )
  }

  return (
    <div className={cn('select-none', className)}>
      {nodes.map((node) => (
        <NodeRow key={node.id} node={node} depth={0} actions={actions} />
      ))}
    </div>
  )
}
