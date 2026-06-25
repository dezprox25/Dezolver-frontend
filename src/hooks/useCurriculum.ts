import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { curriculumService } from '@/services/api/curriculum.service'
import { QUERY_KEYS } from '@/lib/constants'
import type {
  CreateSyllabusDto,
  AddNodeDto,
  UpdateNodeDto,
  UpsertOverlayDto,
  AppendOperationDto,
} from '@/types/curriculum.types'

// ─── Domains ──────────────────────────────────────────────────────────────────

export function useDomains() {
  return useQuery({
    queryKey: QUERY_KEYS.CURRICULUM_DOMAINS,
    queryFn: () => curriculumService.listDomains(),
    staleTime: 10 * 60 * 1000,
  })
}

// ─── My Syllabus (student) ────────────────────────────────────────────────────

export function useMySyllabus() {
  return useQuery({
    queryKey: QUERY_KEYS.MY_SYLLABUS,
    queryFn: () => curriculumService.getMySyllabus(),
    staleTime: 5 * 60 * 1000,
    retry: (count, err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404 || status === 403) return false
      return count < 2
    },
  })
}

export function useEffectiveSyllabus(syllabusId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.EFFECTIVE_SYLLABUS(syllabusId ?? ''),
    queryFn: () => curriculumService.getEffectiveSyllabus(syllabusId!),
    enabled: !!syllabusId,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Syllabi list & detail ────────────────────────────────────────────────────

export function useSyllabi() {
  return useQuery({
    queryKey: QUERY_KEYS.CURRICULUM_SYLLABI,
    queryFn: () => curriculumService.listSyllabi(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useSyllabus(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CURRICULUM_SYLLABI, id],
    queryFn: () => curriculumService.getSyllabus(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Create Syllabus ──────────────────────────────────────────────────────────

export function useCreateSyllabus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateSyllabusDto) => curriculumService.createSyllabus(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CURRICULUM_SYLLABI })
    },
  })
}

// ─── Publish / Archive Syllabus ───────────────────────────────────────────────

export function usePublishSyllabus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => curriculumService.publishSyllabus(id),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.CURRICULUM_SYLLABI, updated.id], (old: unknown) =>
        old ? { ...(old as object), status: updated.status } : updated
      )
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CURRICULUM_SYLLABI })
    },
  })
}

export function useArchiveSyllabus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => curriculumService.archiveSyllabus(id),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.CURRICULUM_SYLLABI, updated.id], (old: unknown) =>
        old ? { ...(old as object), status: updated.status } : updated
      )
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CURRICULUM_SYLLABI })
    },
  })
}

// ─── Syllabus Nodes ───────────────────────────────────────────────────────────

export function useAddNode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ syllabusId, dto }: { syllabusId: string; dto: AddNodeDto }) =>
      curriculumService.addNode(syllabusId, dto),
    onSuccess: (_node, { syllabusId }) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.CURRICULUM_SYLLABI, syllabusId] })
    },
  })
}

export function useUpdateNode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      syllabusId,
      nodeId,
      dto,
    }: {
      syllabusId: string
      nodeId: string
      dto: UpdateNodeDto
    }) => curriculumService.updateNode(syllabusId, nodeId, dto),
    onSuccess: (_node, { syllabusId }) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.CURRICULUM_SYLLABI, syllabusId] })
    },
  })
}

export function useDeleteNode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ syllabusId, nodeId }: { syllabusId: string; nodeId: string }) =>
      curriculumService.deleteNode(syllabusId, nodeId),
    onSuccess: (_void, { syllabusId }) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.CURRICULUM_SYLLABI, syllabusId] })
    },
  })
}

// ─── Overlays ─────────────────────────────────────────────────────────────────

export function useOverlays(tenantId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CURRICULUM_OVERLAYS, tenantId],
    queryFn: () => curriculumService.listOverlays(tenantId!),
    enabled: !!tenantId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useUpsertOverlay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpsertOverlayDto) => curriculumService.upsertOverlay(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CURRICULUM_OVERLAYS })
    },
  })
}

// ─── Overlay Operations ───────────────────────────────────────────────────────

export function useOverlayOperations(overlayId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.OVERLAY_OPERATIONS(overlayId ?? ''),
    queryFn: () => curriculumService.listOperations(overlayId!),
    enabled: !!overlayId,
    staleTime: 60 * 1000,
  })
}

export function useAppendOperation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ overlayId, dto }: { overlayId: string; dto: AppendOperationDto }) =>
      curriculumService.appendOperation(overlayId, dto),
    onSuccess: (_result, { overlayId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.OVERLAY_OPERATIONS(overlayId) })
    },
  })
}

export function useRemoveOperation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ overlayId, opId }: { overlayId: string; opId: string }) =>
      curriculumService.removeOperation(overlayId, opId),
    onSuccess: (_void, { overlayId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.OVERLAY_OPERATIONS(overlayId) })
    },
  })
}

// ─── Overlay Lifecycle ────────────────────────────────────────────────────────

export function usePreviewOverlay(overlayId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.OVERLAY_PREVIEW(overlayId ?? ''),
    queryFn: () => curriculumService.previewOverlay(overlayId!),
    enabled: !!overlayId,
    staleTime: 30 * 1000,
  })
}

export function useActivateOverlay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (overlayId: string) => curriculumService.activateOverlay(overlayId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CURRICULUM_OVERLAYS })
    },
  })
}

export function useOverlayConflicts(overlayId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.OVERLAY_CONFLICTS(overlayId ?? ''),
    queryFn: () => curriculumService.getConflicts(overlayId!),
    enabled: !!overlayId,
    staleTime: 30 * 1000,
  })
}

export function useUpgradeOverlay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (overlayId: string) => curriculumService.upgradeOverlay(overlayId),
    onSuccess: (_result, overlayId) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.OVERLAY_OPERATIONS(overlayId) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.OVERLAY_CONFLICTS(overlayId) })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CURRICULUM_OVERLAYS })
    },
  })
}
