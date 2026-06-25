import { apiClient } from './client'
import type { ApiSuccess } from '@/types/api.types'
import type {
  FeatureFlag,
  FeatureFlagMap,
  LaunchStatus,
  VersionResponse,
  TimeResponse,
} from '@/types/platform.types'
import { API_BASE_URL } from '@/lib/constants'

export const platformService = {
  // ── Feature Flags ───────────────────────────────────────────────────────────

  /** GET /platform/feature-flags — list all feature flags */
  async listFeatureFlags(): Promise<FeatureFlag[]> {
    const res = await apiClient.get<ApiSuccess<FeatureFlag[]>>('/platform/feature-flags')
    return res.data.data
  },

  /**
   * PUT /platform/feature-flags — bulk-update flag states.
   * Backend accepts { flags: Record<string, boolean> }.
   */
  async updateFeatureFlags(flags: FeatureFlagMap): Promise<FeatureFlag[]> {
    const res = await apiClient.put<ApiSuccess<FeatureFlag[]>>('/platform/feature-flags', {
      flags,
    })
    return res.data.data
  },

  // ── Launch ──────────────────────────────────────────────────────────────────

  /** GET /admin/v1/launch/status — current launch phase */
  async getLaunchStatus(): Promise<LaunchStatus> {
    const res = await apiClient.get<ApiSuccess<LaunchStatus>>(`${API_BASE_URL}/admin/v1/launch/status`)
    return res.data.data
  },

  /** POST /admin/v1/launch/advance-phase — advance to next launch phase */
  async advanceLaunchPhase(dto: { notes?: string } = {}): Promise<LaunchStatus> {
    const res = await apiClient.post<ApiSuccess<LaunchStatus>>(
      `${API_BASE_URL}/admin/v1/launch/advance-phase`,
      dto
    )
    return res.data.data
  },

  // ── Version & Time ──────────────────────────────────────────────────────────

  /** GET /version — app version + git SHA */
  async getVersion(): Promise<VersionResponse> {
    const res = await apiClient.get<ApiSuccess<VersionResponse>>('/version')
    return res.data.data
  },

  /** GET /time — authoritative server time */
  async getServerTime(): Promise<TimeResponse> {
    const res = await apiClient.get<ApiSuccess<TimeResponse>>('/time')
    return res.data.data
  },
}
