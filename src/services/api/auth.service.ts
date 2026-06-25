import axios from 'axios'
import { apiClient } from './client'
import type {
  AuthResponse,
  LoginDto,
  MfaChallenge,
  MfaVerifyDto,
  SignupDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SwitchUserDto,
  MeApiResponse,
  TenantBrandingPublic,
} from '@/types/auth.types'
import type { ApiSuccess } from '@/types/api.types'
import { API_BASE_URL } from '@/lib/constants'

// ─── Raw login response straight from the backend ────────────────────────────
// The login /me user shape differs from the /me full response — it comes
// pre-combined (email + fullName are on the user object, not person).
interface LoginUserShape {
  id: string
  personId: string
  tenantId: string
  tenantKind: string
  email: string
  fullName: string
  roles: string[]
  mfaEnabled: boolean
}

interface LoginApiResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: LoginUserShape
  linkedUsers: AuthResponse['linkedUsers']
}

// ─── Auth service ─────────────────────────────────────────────────────────────

export const authService = {
  /** POST /auth/login — returns full tokens or MFA challenge */
  async login(dto: LoginDto): Promise<AuthResponse | MfaChallenge> {
    const res = await apiClient.post<ApiSuccess<LoginApiResponse | MfaChallenge>>(
      '/auth/login',
      dto
    )
    const data = res.data.data

    if ('mfaRequired' in data) return data as MfaChallenge

    // Map backend shape → our AuthResponse / User type
    const raw = data as LoginApiResponse
    const auth: AuthResponse = {
      accessToken: raw.accessToken,
      tokenType: raw.tokenType,
      expiresIn: raw.expiresIn,
      linkedUsers: raw.linkedUsers ?? [],
      user: {
        id: raw.user.id,
        email: raw.user.email,
        fullName: raw.user.fullName,
        primaryRole: (raw.user.roles[0] ?? 'student') as AuthResponse['user']['primaryRole'],
        roles: raw.user.roles as AuthResponse['user']['roles'],
        tenantId: raw.user.tenantId,
        tenantKind: raw.user.tenantKind as AuthResponse['user']['tenantKind'],
        personId: raw.user.personId,
        cohortId: null,
        mfaEnabled: raw.user.mfaEnabled,
        status: 'active',
      },
    }
    return auth
  },

  /** POST /auth/mfa/verify — finalise MFA and receive tokens */
  async verifyMfa(dto: MfaVerifyDto): Promise<AuthResponse> {
    const res = await apiClient.post<ApiSuccess<LoginApiResponse>>('/auth/mfa/verify', dto)
    const raw = res.data.data
    return {
      accessToken: raw.accessToken,
      tokenType: raw.tokenType,
      expiresIn: raw.expiresIn,
      linkedUsers: raw.linkedUsers ?? [],
      user: {
        id: raw.user.id,
        email: raw.user.email,
        fullName: raw.user.fullName,
        primaryRole: (raw.user.roles[0] ?? 'student') as AuthResponse['user']['primaryRole'],
        roles: raw.user.roles as AuthResponse['user']['roles'],
        tenantId: raw.user.tenantId,
        tenantKind: raw.user.tenantKind as AuthResponse['user']['tenantKind'],
        personId: raw.user.personId,
        cohortId: null,
        mfaEnabled: raw.user.mfaEnabled,
        status: 'active',
      },
    }
  },

  /** POST /auth/signup — direct B2C subscriber registration */
  async signup(dto: SignupDto): Promise<AuthResponse> {
    const res = await apiClient.post<ApiSuccess<LoginApiResponse>>('/auth/signup', dto)
    const raw = res.data.data
    return {
      accessToken: raw.accessToken,
      tokenType: raw.tokenType,
      expiresIn: raw.expiresIn,
      linkedUsers: raw.linkedUsers ?? [],
      user: {
        id: raw.user.id,
        email: raw.user.email,
        fullName: raw.user.fullName,
        primaryRole: (raw.user.roles[0] ?? 'student') as AuthResponse['user']['primaryRole'],
        roles: raw.user.roles as AuthResponse['user']['roles'],
        tenantId: raw.user.tenantId,
        tenantKind: raw.user.tenantKind as AuthResponse['user']['tenantKind'],
        personId: raw.user.personId,
        cohortId: null,
        mfaEnabled: raw.user.mfaEnabled,
        status: 'active',
      },
    }
  },

  /** GET /me — full profile including person, tenant, subscription */
  async getFullProfile(): Promise<MeApiResponse> {
    const res = await apiClient.get<ApiSuccess<MeApiResponse>>('/me')
    return res.data.data
  },

  /**
   * POST /auth/refresh — uses httpOnly refresh cookie.
   * In mock mode, reads from localStorage instead of calling the backend.
   * Intentionally uses raw axios (NOT apiClient) to avoid the 401 interceptor
   * triggering another refresh, which would cause an infinite loop.
   */
  async tryRefresh(): Promise<string | null> {
    if (import.meta.env.VITE_APP_MODE === 'mock') {
      try {
        const key = localStorage.getItem('__MOCK_SESSION__')
        return key ? `MOCK_TOKEN_${key}` : null
      } catch {
        return null
      }
    }
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      )
      return (res.data as { data: { accessToken: string } }).data.accessToken
    } catch {
      return null
    }
  },

  /** POST /auth/logout — revoke current refresh cookie */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Fire-and-forget — always clear local state regardless of server response
    }
  },

  /** POST /auth/logout/all — revoke all sessions for this user */
  async logoutAll(): Promise<void> {
    try {
      await apiClient.post('/auth/logout/all')
    } catch {
      // Fire-and-forget
    }
  },

  /** POST /auth/forgot-password — initiate password reset email */
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    await apiClient.post('/auth/forgot-password', dto)
  },

  /** POST /auth/reset-password — consume token and set new password */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    await apiClient.post('/auth/reset-password', dto)
  },

  /** POST /me/switch-user — switch between linked accounts */
  async switchUser(dto: SwitchUserDto): Promise<AuthResponse> {
    const res = await apiClient.post<ApiSuccess<LoginApiResponse>>('/me/switch-user', dto)
    const raw = res.data.data
    return {
      accessToken: raw.accessToken,
      tokenType: raw.tokenType,
      expiresIn: raw.expiresIn,
      linkedUsers: raw.linkedUsers ?? [],
      user: {
        id: raw.user.id,
        email: raw.user.email,
        fullName: raw.user.fullName,
        primaryRole: (raw.user.roles[0] ?? 'student') as AuthResponse['user']['primaryRole'],
        roles: raw.user.roles as AuthResponse['user']['roles'],
        tenantId: raw.user.tenantId,
        tenantKind: raw.user.tenantKind as AuthResponse['user']['tenantKind'],
        personId: raw.user.personId,
        cohortId: null,
        mfaEnabled: raw.user.mfaEnabled,
        status: 'active',
      },
    }
  },

  /**
   * GET /tenants/by-subdomain/:subdomain
   * Public endpoint — no auth required. Used to load branding on the login page.
   */
  async getTenantBranding(subdomain: string): Promise<TenantBrandingPublic | null> {
    try {
      const res = await axios.get<ApiSuccess<TenantBrandingPublic>>(
        `${API_BASE_URL}/api/v1/tenants/by-subdomain/${encodeURIComponent(subdomain)}`
      )
      return res.data.data
    } catch {
      return null
    }
  },
}
