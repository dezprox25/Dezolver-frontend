import { apiClient } from './client'
import type { ApiSuccess } from '@/types/api.types'

// ─── MFA ─────────────────────────────────────────────────────────────────────

export interface MfaStatus {
  enrolled: boolean
  factorType?: string
}

export interface MfaEnrollResponse {
  secret: string
  otpauthUri: string
  /** Base64 data URL if the backend renders a QR code server-side */
  qrCodeDataUrl?: string
}

interface MfaConfirmDto {
  code: string
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const usersService = {
  /** GET /users/me/mfa — current MFA status */
  async getMfaStatus(): Promise<MfaStatus> {
    const res = await apiClient.get<ApiSuccess<MfaStatus>>('/users/me/mfa')
    return res.data.data
  },

  /** POST /users/me/mfa/enroll — begin TOTP enrollment, returns secret + URI */
  async enrollMfa(): Promise<MfaEnrollResponse> {
    const res = await apiClient.post<ApiSuccess<MfaEnrollResponse>>('/users/me/mfa/enroll')
    return res.data.data
  },

  /** POST /users/me/mfa/confirm — activate MFA with first TOTP code */
  async confirmMfa(dto: MfaConfirmDto): Promise<void> {
    await apiClient.post('/users/me/mfa/confirm', dto)
  },

  /** DELETE /users/me/mfa — disable MFA for the current user */
  async disableMfa(): Promise<void> {
    await apiClient.delete('/users/me/mfa')
  },

  /** GET /users/me/export — queue a DPDP §9 personal data export */
  async requestDataExport(): Promise<void> {
    await apiClient.get('/users/me/export')
  },

  /** DELETE /users/me — schedule account deletion (30-day window) */
  async deleteAccount(confirmation: string): Promise<void> {
    await apiClient.delete('/users/me', { data: { confirmation } })
  },
}
