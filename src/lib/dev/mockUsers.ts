/**
 * DEV-ONLY: Mock user personas for UI review without a running backend.
 *
 * This entire module is tree-shaken out of production builds because every
 * import site is guarded by `import.meta.env.DEV`.
 *
 * Dev sessions are persisted in sessionStorage under __DEV_SESSION__ so that
 * a page-refresh keeps you logged in for the lifetime of the browser tab.
 */

import type { User, TenantInfo, SubscriptionInfo } from '@/types/auth.types'

export interface DevPersona {
  key: string
  label: string
  description: string
  email: string
  user: User
  tenant: TenantInfo
  subscription: SubscriptionInfo
}

// ─── Shared tenant fixtures ───────────────────────────────────────────────────

const PLATFORM_TENANT: TenantInfo = {
  id: 'dev-tenant-platform-00000001',
  kind: 'direct',
  name: 'Dezolver Platform',
  subdomain: 'platform',
  branding: {},
  ssoEnabled: false,
}

const COLLEGE_TENANT: TenantInfo = {
  id: 'dev-tenant-college-00000001',
  kind: 'college',
  name: 'IIT Dev University',
  subdomain: 'iit-dev',
  branding: { primaryColor: '#1d4ed8' },
  ssoEnabled: false,
}

const UNLIMITED_SUB: SubscriptionInfo = {
  planCode: 'unlimited',
  status: 'active',
}

const PRO_SUB: SubscriptionInfo = {
  planCode: 'professional',
  status: 'active',
  currentPeriodEnd: '2027-06-01T00:00:00.000Z',
}

// ─── Personas ─────────────────────────────────────────────────────────────────

export const DEV_PERSONAS: DevPersona[] = [
  {
    key: 'platform_admin',
    label: 'Platform Admin',
    description: 'Full platform access. Manage all tenants, persons, billing.',
    email: 'admin@dezolver.dev',
    user: {
      id: 'dev-user-platform-admin-0001',
      email: 'admin@dezolver.dev',
      fullName: 'Dev Platform Admin',
      primaryRole: 'platform_admin',
      roles: ['platform_admin'],
      tenantId: PLATFORM_TENANT.id,
      tenantKind: 'direct',
      tenantName: PLATFORM_TENANT.name,
      subdomain: PLATFORM_TENANT.subdomain,
      personId: 'dev-person-platform-admin-0001',
      cohortId: null,
      mfaEnabled: false,
      status: 'active',
      platformRating: 3200,
    },
    tenant: PLATFORM_TENANT,
    subscription: UNLIMITED_SUB,
  },

  {
    key: 'platform_moderator',
    label: 'Platform Moderator',
    description: 'Read-only oversight. Manage events and feature flags.',
    email: 'moderator@dezolver.dev',
    user: {
      id: 'dev-user-platform-mod-0001',
      email: 'moderator@dezolver.dev',
      fullName: 'Dev Moderator',
      primaryRole: 'platform_moderator',
      roles: ['platform_moderator'],
      tenantId: PLATFORM_TENANT.id,
      tenantKind: 'direct',
      tenantName: PLATFORM_TENANT.name,
      subdomain: PLATFORM_TENANT.subdomain,
      personId: 'dev-person-platform-mod-0001',
      cohortId: null,
      mfaEnabled: false,
      status: 'active',
      platformRating: 1800,
    },
    tenant: PLATFORM_TENANT,
    subscription: UNLIMITED_SUB,
  },

  {
    key: 'college_admin',
    label: 'College Admin',
    description: 'Full institution admin. Manage users, cohorts, billing, curriculum.',
    email: 'admin@iit-dev.dezolver.dev',
    user: {
      id: 'dev-user-college-admin-0001',
      email: 'admin@iit-dev.dezolver.dev',
      fullName: 'Dev College Admin',
      primaryRole: 'college_admin',
      roles: ['college_admin'],
      tenantId: COLLEGE_TENANT.id,
      tenantKind: 'college',
      tenantName: COLLEGE_TENANT.name,
      subdomain: COLLEGE_TENANT.subdomain,
      personId: 'dev-person-college-admin-0001',
      cohortId: null,
      mfaEnabled: false,
      status: 'active',
      platformRating: 1400,
    },
    tenant: COLLEGE_TENANT,
    subscription: PRO_SUB,
  },

  {
    key: 'coordinator',
    label: 'Coordinator',
    description: 'Program coordinator. Manage cohorts, curate learning paths.',
    email: 'coord@iit-dev.dezolver.dev',
    user: {
      id: 'dev-user-coordinator-0001',
      email: 'coord@iit-dev.dezolver.dev',
      fullName: 'Dev Coordinator',
      primaryRole: 'coordinator',
      roles: ['coordinator'],
      tenantId: COLLEGE_TENANT.id,
      tenantKind: 'college',
      tenantName: COLLEGE_TENANT.name,
      subdomain: COLLEGE_TENANT.subdomain,
      personId: 'dev-person-coordinator-0001',
      cohortId: null,
      mfaEnabled: false,
      status: 'active',
      platformRating: 1100,
    },
    tenant: COLLEGE_TENANT,
    subscription: PRO_SUB,
  },

  {
    key: 'faculty',
    label: 'Faculty',
    description: 'Instructor. Create assessments, track student progress.',
    email: 'faculty@iit-dev.dezolver.dev',
    user: {
      id: 'dev-user-faculty-0001',
      email: 'faculty@iit-dev.dezolver.dev',
      fullName: 'Dev Faculty',
      primaryRole: 'faculty',
      roles: ['faculty'],
      tenantId: COLLEGE_TENANT.id,
      tenantKind: 'college',
      tenantName: COLLEGE_TENANT.name,
      subdomain: COLLEGE_TENANT.subdomain,
      personId: 'dev-person-faculty-0001',
      cohortId: null,
      mfaEnabled: false,
      status: 'active',
      platformRating: 900,
    },
    tenant: COLLEGE_TENANT,
    subscription: PRO_SUB,
  },

  {
    key: 'content_manager',
    label: 'Content Manager',
    description: 'Dezprox internal. Author and publish curriculum, rooms, problems.',
    email: 'content@dezolver.dev',
    user: {
      id: 'dev-user-content-mgr-0001',
      email: 'content@dezolver.dev',
      fullName: 'Dev Content Manager',
      primaryRole: 'content_manager',
      roles: ['content_manager'],
      tenantId: PLATFORM_TENANT.id,
      tenantKind: 'direct',
      tenantName: PLATFORM_TENANT.name,
      subdomain: PLATFORM_TENANT.subdomain,
      personId: 'dev-person-content-mgr-0001',
      cohortId: null,
      mfaEnabled: false,
      status: 'active',
      platformRating: 1600,
    },
    tenant: PLATFORM_TENANT,
    subscription: UNLIMITED_SUB,
  },

  {
    key: 'student',
    label: 'Student',
    description: 'Enrolled learner. Browse courses, submit assessments, earn certificates.',
    email: 'student@iit-dev.dezolver.dev',
    user: {
      id: 'dev-user-student-0001',
      email: 'student@iit-dev.dezolver.dev',
      fullName: 'Dev Student',
      primaryRole: 'student',
      roles: ['student'],
      tenantId: COLLEGE_TENANT.id,
      tenantKind: 'college',
      tenantName: COLLEGE_TENANT.name,
      subdomain: COLLEGE_TENANT.subdomain,
      personId: 'dev-person-student-0001',
      cohortId: 'dev-cohort-cse-2025',
      mfaEnabled: false,
      status: 'active',
      platformRating: 450,
    },
    tenant: COLLEGE_TENANT,
    subscription: PRO_SUB,
  },
]

// ─── Session storage helpers ──────────────────────────────────────────────────

const DEV_SESSION_KEY = '__DEV_SESSION__'

export function saveDevSession(persona: DevPersona): void {
  try {
    sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify({ key: persona.key }))
  } catch {
    // sessionStorage unavailable (private mode, etc.) — ignore
  }
}

export function loadDevSession(): DevPersona | null {
  try {
    const raw = sessionStorage.getItem(DEV_SESSION_KEY)
    if (!raw) return null
    const { key } = JSON.parse(raw) as { key: string }
    return DEV_PERSONAS.find((p) => p.key === key) ?? null
  } catch {
    return null
  }
}

export function clearDevSession(): void {
  try {
    sessionStorage.removeItem(DEV_SESSION_KEY)
  } catch {
    // ignore
  }
}
