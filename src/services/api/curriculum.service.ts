import { apiClient } from './client'
import type { ApiSuccess } from '@/types/api.types'
import type {
  Domain,
  Syllabus,
  SyllabusNode,
  SyllabusOverlay,
  OverlayOperation,
  ConflictsResult,
  PreviewResult,
  UpgradeResult,
  UserSyllabusAssignment,
  CreateSyllabusDto,
  AddNodeDto,
  UpdateNodeDto,
  UpsertOverlayDto,
  AppendOperationDto,
} from '@/types/curriculum.types'

export const curriculumService = {
  // ── Domains ─────────────────────────────────────────────────────────────────

  async listDomains(): Promise<Domain[]> {
    const res = await apiClient.get<ApiSuccess<Domain[]>>('/domains')
    return res.data.data ?? []
  },

  // ── My Syllabus (student) ────────────────────────────────────────────────────

  async getMySyllabus(): Promise<UserSyllabusAssignment> {
    const res = await apiClient.get<ApiSuccess<UserSyllabusAssignment>>('/me/syllabus')
    return res.data.data
  },

  async getEffectiveSyllabus(syllabusId: string): Promise<SyllabusNode[]> {
    const res = await apiClient.get<ApiSuccess<SyllabusNode[]>>(
      `/me/syllabus/${encodeURIComponent(syllabusId)}/effective`
    )
    return res.data.data ?? []
  },

  // ── Syllabi (content-manager / college-admin) ────────────────────────────────

  async listSyllabi(): Promise<Syllabus[]> {
    const res = await apiClient.get<ApiSuccess<Syllabus[]>>('/syllabi')
    return res.data.data ?? []
  },

  async getSyllabus(id: string): Promise<Syllabus & { nodes: SyllabusNode[] }> {
    const res = await apiClient.get<ApiSuccess<Syllabus & { nodes: SyllabusNode[] }>>(
      `/syllabi/${encodeURIComponent(id)}`
    )
    return res.data.data
  },

  async createSyllabus(dto: CreateSyllabusDto): Promise<Syllabus> {
    const res = await apiClient.post<ApiSuccess<Syllabus>>('/syllabi', dto)
    return res.data.data
  },

  async publishSyllabus(id: string): Promise<Syllabus> {
    const res = await apiClient.post<ApiSuccess<Syllabus>>(
      `/syllabi/${encodeURIComponent(id)}/publish`
    )
    return res.data.data
  },

  async archiveSyllabus(id: string): Promise<Syllabus> {
    const res = await apiClient.post<ApiSuccess<Syllabus>>(
      `/syllabi/${encodeURIComponent(id)}/archive`
    )
    return res.data.data
  },

  // ── Syllabus Nodes ───────────────────────────────────────────────────────────

  async addNode(syllabusId: string, dto: AddNodeDto): Promise<SyllabusNode> {
    const res = await apiClient.post<ApiSuccess<SyllabusNode>>(
      `/syllabi/${encodeURIComponent(syllabusId)}/nodes`,
      dto
    )
    return res.data.data
  },

  async updateNode(
    syllabusId: string,
    nodeId: string,
    dto: UpdateNodeDto
  ): Promise<SyllabusNode> {
    const res = await apiClient.patch<ApiSuccess<SyllabusNode>>(
      `/syllabi/${encodeURIComponent(syllabusId)}/nodes/${encodeURIComponent(nodeId)}`,
      dto
    )
    return res.data.data
  },

  async deleteNode(syllabusId: string, nodeId: string): Promise<void> {
    await apiClient.delete(
      `/syllabi/${encodeURIComponent(syllabusId)}/nodes/${encodeURIComponent(nodeId)}`
    )
  },

  // ── Overlays ─────────────────────────────────────────────────────────────────

  async listOverlays(tenantId: string): Promise<SyllabusOverlay[]> {
    const res = await apiClient.get<ApiSuccess<SyllabusOverlay[]>>(
      `/tenants/${encodeURIComponent(tenantId)}/overlays`
    )
    return res.data.data ?? []
  },

  async upsertOverlay(dto: UpsertOverlayDto): Promise<SyllabusOverlay> {
    const res = await apiClient.post<ApiSuccess<SyllabusOverlay>>('/overlays', dto)
    return res.data.data
  },

  // ── Overlay Operations ───────────────────────────────────────────────────────

  async listOperations(overlayId: string): Promise<OverlayOperation[]> {
    const res = await apiClient.get<ApiSuccess<OverlayOperation[]>>(
      `/overlays/${encodeURIComponent(overlayId)}/operations`
    )
    return res.data.data ?? []
  },

  async appendOperation(
    overlayId: string,
    dto: AppendOperationDto
  ): Promise<{ id: string; sequence: number }> {
    const res = await apiClient.post<ApiSuccess<{ id: string; sequence: number }>>(
      `/overlays/${encodeURIComponent(overlayId)}/operations`,
      dto
    )
    return res.data.data
  },

  async removeOperation(overlayId: string, opId: string): Promise<void> {
    await apiClient.delete(
      `/overlays/${encodeURIComponent(overlayId)}/operations/${encodeURIComponent(opId)}`
    )
  },

  // ── Overlay Lifecycle ────────────────────────────────────────────────────────

  async previewOverlay(overlayId: string): Promise<PreviewResult> {
    const res = await apiClient.post<ApiSuccess<PreviewResult>>(
      `/overlays/${encodeURIComponent(overlayId)}/preview`
    )
    return res.data.data
  },

  async activateOverlay(overlayId: string): Promise<{ overlayId: string; status: string }> {
    const res = await apiClient.post<ApiSuccess<{ overlayId: string; status: string }>>(
      `/overlays/${encodeURIComponent(overlayId)}/activate`
    )
    return res.data.data
  },

  async getConflicts(overlayId: string): Promise<ConflictsResult> {
    const res = await apiClient.get<ApiSuccess<ConflictsResult>>(
      `/overlays/${encodeURIComponent(overlayId)}/conflicts`
    )
    return res.data.data
  },

  async upgradeOverlay(overlayId: string): Promise<UpgradeResult> {
    const res = await apiClient.post<ApiSuccess<UpgradeResult>>(
      `/overlays/${encodeURIComponent(overlayId)}/upgrade`
    )
    return res.data.data
  },
}
