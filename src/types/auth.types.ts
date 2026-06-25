// ─── Role / Status ────────────────────────────────────────────────────────────

export type UserRole =
  | 'student'
  | 'faculty'
  | 'coordinator'
  | 'college_admin'
  | 'content_manager'
  | 'platform_moderator'
  | 'platform_admin'

export type TenantKind = 'college' | 'direct'

export type UserStatus = 'invited' | 'active' | 'suspended' | 'revoked'

// ─── Normalised User (used everywhere in the frontend) ───────────────────────

export interface User {
  id: string
  email: string
  fullName: string
  primaryRole: UserRole
  roles: UserRole[]
  tenantId: string
  tenantKind: TenantKind
  tenantName?: string
  subdomain?: string
  personId: string
  cohortId?: string | null
  mfaEnabled: boolean
  status: UserStatus
  platformRating?: number
}

// ─── Tenant / Subscription (stored separately in auth store) ─────────────────

export interface TenantBranding {
  logoUrl?: string | null
  primaryColor?: string
  faviconUrl?: string | null
}

export interface TenantInfo {
  id: string
  kind: TenantKind
  name: string
  subdomain: string
  branding: TenantBranding
  ssoEnabled?: boolean
}

export interface SubscriptionInfo {
  planCode: string
  status: string
  currentPeriodEnd?: string
}

// ─── Raw /me API shape (before normalisation) ────────────────────────────────

export interface MeApiUser {
  id: string
  tenantId: string
  personId?: string
  email?: string         // present in some backend versions
  fullName?: string      // present in some backend versions
  primaryRole?: UserRole
  roles: UserRole[]
  cohortId?: string | null
  mfaEnabled: boolean
  status?: UserStatus
}

export interface MeApiPerson {
  id: string
  primaryEmail: string
  displayName: string
  platformRating: number
}

export interface MeApiResponse {
  user: MeApiUser
  person: MeApiPerson
  tenant: TenantInfo
  subscription: SubscriptionInfo
  linkedUsers: LinkedUser[]
}

/** Flatten the raw /me response into a normalised User */
export function normalizeMeResponse(me: MeApiResponse): User {
  const primary: UserRole = me.user.primaryRole ?? me.user.roles[0] ?? 'student'
  return {
    id: me.user.id,
    email: me.user.email ?? me.person.primaryEmail,
    fullName: me.user.fullName ?? me.person.displayName,
    primaryRole: primary,
    roles: me.user.roles.length > 0 ? me.user.roles : [primary],
    tenantId: me.user.tenantId,
    tenantKind: me.tenant.kind,
    tenantName: me.tenant.name,
    subdomain: me.tenant.subdomain,
    personId: me.user.personId ?? me.person.id,
    cohortId: me.user.cohortId ?? null,
    mfaEnabled: me.user.mfaEnabled,
    status: me.user.status ?? 'active',
    platformRating: me.person.platformRating,
  }
}

// ─── Auth response types ──────────────────────────────────────────────────────

export interface LinkedUser {
  userId: string
  tenantKind: TenantKind
  tenantId: string
  email: string
}

/** Successful login / MFA verify response */
export interface AuthResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: User
  linkedUsers: LinkedUser[]
}

/** When the backend needs MFA before issuing tokens */
export interface MfaChallenge {
  mfaRequired: true
  mfaToken: string
  supportedFactors: string[]
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface LoginDto {
  email: string
  password: string
  tenantHint?: string
}

export interface SignupDto {
  email: string
  password: string
  fullName: string
}

export interface MfaVerifyDto {
  mfaToken: string
  code: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  password: string
}

export interface SwitchUserDto {
  targetUserId: string
}

// ─── Tenant branding (public, no auth) ───────────────────────────────────────

export interface TenantBrandingPublic {
  id: string
  name: string
  subdomain: string
  branding: TenantBranding
  ssoEnabled: boolean
}
