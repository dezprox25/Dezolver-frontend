// ─── Domain ───────────────────────────────────────────────────────────────────

export interface Domain {
  id: string
  tenantId: string
  name: string
  code: string
  description?: string | null
  createdAt: string
}

// ─── Syllabus ─────────────────────────────────────────────────────────────────

export type SyllabusStatus = 'draft' | 'published' | 'archived'

export interface SyllabusNode {
  id: string
  syllabusId: string
  parentId: string | null
  title: string
  kind: SyllabusNodeKind
  contentRef: string | null
  position: number
  metadata: Record<string, unknown>
  /** Present on effective-syllabus nodes returned by the resolver */
  visible?: boolean
  /** Present on effective-syllabus nodes when set by overlay */
  dueDate?: string | null
  children?: SyllabusNode[]
}

export type SyllabusNodeKind = 'topic' | 'subtopic' | 'room' | 'problem' | 'assessment' | 'lesson'

export interface Syllabus {
  id: string
  tenantId: string
  title: string
  description: string | null
  status: SyllabusStatus
  createdByUserId: string
  createdAt: string
  updatedAt: string
  nodes?: SyllabusNode[]
}

// ─── User Syllabus Assignment ─────────────────────────────────────────────────

export interface UserSyllabusAssignment {
  id: string
  userId: string
  tenantId: string
  syllabusId: string
  syllabus: Syllabus & { nodes: SyllabusNode[] }
}

// ─── Overlay ──────────────────────────────────────────────────────────────────

export type OverlayStatus = 'draft' | 'active' | 'archived'

export type OperationType =
  | 'hide_node'
  | 'reorder_children'
  | 'rename_node'
  | 'remap_content'
  | 'add_child_node'

export interface OverlayOperation {
  id: string
  overlayId: string
  sequence: number
  operationType: OperationType
  targetNodeId: string
  payload: Record<string, unknown>
  createdAt: string
}

export interface SyllabusOverlay {
  id: string
  syllabusId: string
  cohortId: string
  nodeId: string
  dueDate: string | null
  visible: boolean
  status: OverlayStatus
  createdAt: string
  operations?: OverlayOperation[]
}

export interface OverlayConflict {
  opId: string
  reason: string
}

export interface ConflictsResult {
  overlayId: string
  conflicts: OverlayConflict[]
}

export interface PreviewResult {
  overlayId: string
  syllabusId: string
  cohortId: string
  operations: OverlayOperation[]
}

export interface UpgradeResult {
  overlayId: string
  status: string
  conflictsRemoved: number
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateSyllabusDto {
  title: string
  description?: string
}

export interface AddNodeDto {
  title: string
  kind: SyllabusNodeKind
  parentId?: string
  contentRef?: string
  position?: number
}

export interface UpdateNodeDto {
  title?: string
  contentRef?: string
  position?: number
}

export interface UpsertOverlayDto {
  syllabusId: string
  cohortId: string
  nodeId: string
  dueDate?: string
  visible?: boolean
}

export interface AppendOperationDto {
  operationType: OperationType
  targetNodeId: string
  payload?: Record<string, unknown>
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const SYLLABUS_STATUS_LABELS: Record<SyllabusStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export const OVERLAY_STATUS_LABELS: Record<OverlayStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
}

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  hide_node: 'Hide Node',
  reorder_children: 'Reorder Children',
  rename_node: 'Rename Node',
  remap_content: 'Remap Content',
  add_child_node: 'Add Child Node',
}

export const NODE_KIND_LABELS: Record<SyllabusNodeKind, string> = {
  topic: 'Topic',
  subtopic: 'Subtopic',
  room: 'Room',
  problem: 'Problem',
  assessment: 'Assessment',
  lesson: 'Lesson',
}

export const OPERATION_TYPES: OperationType[] = [
  'hide_node',
  'rename_node',
  'remap_content',
  'reorder_children',
  'add_child_node',
]

export const NODE_KINDS: SyllabusNodeKind[] = [
  'topic',
  'subtopic',
  'lesson',
  'room',
  'problem',
  'assessment',
]

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Build a parent→children tree from a flat node array */
export function buildNodeTree(nodes: SyllabusNode[]): SyllabusNode[] {
  const map = new Map<string, SyllabusNode>()
  const roots: SyllabusNode[] = []

  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] })
  }

  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!
      parent.children = parent.children ?? []
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortByPosition = (arr: SyllabusNode[]) => {
    arr.sort((a, b) => a.position - b.position)
    arr.forEach((n) => n.children && sortByPosition(n.children))
    return arr
  }

  return sortByPosition(roots)
}
