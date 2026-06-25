import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type {
  CertificateTemplate,
  CreateTemplateDto,
  UpdateTemplateDto,
  PreviewTemplateDto,
} from '@/types/certificate.types'

export const certificateTemplateService = {
  /**
   * GET /certificate-templates — list templates (CRUD convention; not explicitly in API spec).
   */
  async list(params: { limit?: number; cursor?: string } = {}): Promise<{
    items: CertificateTemplate[]
    pagination: PaginationMeta
  }> {
    const res = await apiClient.get<ApiSuccess<CertificateTemplate[]>>(
      '/certificate-templates',
      { params }
    )
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** GET /certificate-templates/:id — template detail */
  async getById(id: string): Promise<CertificateTemplate> {
    const res = await apiClient.get<ApiSuccess<CertificateTemplate>>(
      `/certificate-templates/${encodeURIComponent(id)}`
    )
    return res.data.data
  },

  /** POST /certificate-templates — create draft template */
  async create(dto: CreateTemplateDto): Promise<CertificateTemplate> {
    const res = await apiClient.post<ApiSuccess<CertificateTemplate>>(
      '/certificate-templates',
      dto
    )
    return res.data.data
  },

  /** PATCH /certificate-templates/:id — update draft (CRUD convention) */
  async update(id: string, dto: UpdateTemplateDto): Promise<CertificateTemplate> {
    const res = await apiClient.patch<ApiSuccess<CertificateTemplate>>(
      `/certificate-templates/${encodeURIComponent(id)}`,
      dto
    )
    return res.data.data
  },

  /**
   * POST /certificate-templates/:id/preview
   * Body: { variables: { recipientName, ... } }
   * Returns: signed PDF URL (1h TTL)
   * NOTE: Backend may return HTML-backed content due to audit finding.
   */
  async preview(id: string, dto: PreviewTemplateDto): Promise<{ previewUrl: string }> {
    const res = await apiClient.post<ApiSuccess<{ previewUrl: string }>>(
      `/certificate-templates/${encodeURIComponent(id)}/preview`,
      dto
    )
    return res.data.data
  },

  /** POST /certificate-templates/:id/publish — activate template */
  async publish(id: string): Promise<CertificateTemplate> {
    const res = await apiClient.post<ApiSuccess<CertificateTemplate>>(
      `/certificate-templates/${encodeURIComponent(id)}/publish`
    )
    return res.data.data
  },
}
