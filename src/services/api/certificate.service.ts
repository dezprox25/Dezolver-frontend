import { apiClient } from './client'
import type { ApiSuccess, PaginationMeta } from '@/types/api.types'
import type {
  Certificate,
  VerificationResult,
  UpdateCertificateDto,
  RevokeCertificateDto,
  ManualIssueCertificateDto,
} from '@/types/certificate.types'

export interface PaginatedCertificates {
  items: Certificate[]
  pagination: PaginationMeta
}

export const certificateService = {
  /** GET /me/certificates — list recipient's certificates (paginated) */
  async listMine(params: { limit?: number; cursor?: string } = {}): Promise<PaginatedCertificates> {
    const res = await apiClient.get<ApiSuccess<Certificate[]>>('/me/certificates', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** GET /me/certificates/:certificateId — detail */
  async getMine(certificateId: string): Promise<Certificate> {
    const res = await apiClient.get<ApiSuccess<Certificate>>(
      `/me/certificates/${encodeURIComponent(certificateId)}`
    )
    return res.data.data
  },

  /**
   * GET /me/certificates/:certificateId/download
   * Returns 302 → signed CloudFront URL (1h TTL).
   * We fetch as blob so the browser receives the PDF bytes.
   * NOTE: Backend may currently return HTML not PDF (audit finding).
   */
  async downloadCertificate(certificateId: string): Promise<void> {
    const response = await apiClient.get(
      `/me/certificates/${encodeURIComponent(certificateId)}/download`,
      { responseType: 'blob' }
    )
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${certificateId}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  /** PATCH /me/certificates/:certificateId — toggle isPublic */
  async updatePrivacy(certificateId: string, dto: UpdateCertificateDto): Promise<Certificate> {
    const res = await apiClient.patch<ApiSuccess<Certificate>>(
      `/me/certificates/${encodeURIComponent(certificateId)}`,
      dto
    )
    return res.data.data
  },

  /**
   * GET /verify/c/:certificateId — **PUBLIC**, no auth.
   * Returns verification status even for revoked/private certificates.
   */
  async verify(certificateId: string): Promise<VerificationResult> {
    const res = await apiClient.get<ApiSuccess<VerificationResult>>(
      `/verify/c/${encodeURIComponent(certificateId.toUpperCase())}`
    )
    return res.data.data
  },

  // ── Admin endpoints ─────────────────────────────────────────────────────────

  /**
   * GET /certificates — admin list (all tenant certificates).
   * NOTE: Not explicitly documented in API spec; follows REST convention.
   * May return 404 if endpoint doesn't exist yet.
   */
  async listAll(params: { limit?: number; cursor?: string; status?: string } = {}): Promise<PaginatedCertificates> {
    const res = await apiClient.get<ApiSuccess<Certificate[]>>('/certificates', { params })
    return {
      items: res.data.data,
      pagination: res.data.pagination ?? { nextCursor: null, hasMore: false },
    }
  },

  /** POST /certificates/:id/revoke — admin revoke (uses database ID) */
  async revoke(id: string, dto: RevokeCertificateDto): Promise<Certificate> {
    const res = await apiClient.post<ApiSuccess<Certificate>>(
      `/certificates/${encodeURIComponent(id)}/revoke`,
      dto
    )
    return res.data.data
  },

  /**
   * POST /certificates/:id/reissue — re-render PDF (uses database ID).
   * NOTE: Backend does NOT revoke old certificate on reissue (audit finding).
   */
  async reissue(id: string): Promise<Certificate> {
    const res = await apiClient.post<ApiSuccess<Certificate>>(
      `/certificates/${encodeURIComponent(id)}/reissue`
    )
    return res.data.data
  },

  /** POST /certificates/manual — platform-admin manual issuance */
  async manualIssue(dto: ManualIssueCertificateDto): Promise<Certificate> {
    const res = await apiClient.post<ApiSuccess<Certificate>>('/certificates/manual', dto)
    return res.data.data
  },
}
