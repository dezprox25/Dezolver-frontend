/**
 * Production mock personas for demo deployment.
 * These are the 4 primary demo accounts used for investor/client demos.
 */

import type { User, TenantInfo, SubscriptionInfo } from '@/types/auth.types'

export interface MockPersona {
  key: string
  email: string
  password: string
  label: string
  user: User
  tenant: TenantInfo
  subscription: SubscriptionInfo
}

const PLATFORM_TENANT: TenantInfo = {
  id: 'tenant-platform-dezolver-001',
  kind: 'direct',
  name: 'Dezolver Platform',
  subdomain: 'platform',
  branding: { primaryColor: '#6366f1' },
  ssoEnabled: false,
}

const COLLEGE_TENANT: TenantInfo = {
  id: 'tenant-college-iitm-001',
  kind: 'college',
  name: 'IIT Madras',
  subdomain: 'iitm',
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

export const MOCK_PERSONAS: Record<string, MockPersona> = {
  platform_admin: {
    key: 'platform_admin',
    email: 'admin@dezolver.com',
    password: 'Password123',
    label: 'Super Admin',
    user: {
      id: 'user-platform-admin-001',
      email: 'admin@dezolver.com',
      fullName: 'Arjun Sharma',
      primaryRole: 'platform_admin',
      roles: ['platform_admin'],
      tenantId: PLATFORM_TENANT.id,
      tenantKind: 'direct',
      tenantName: PLATFORM_TENANT.name,
      subdomain: PLATFORM_TENANT.subdomain,
      personId: 'person-platform-admin-001',
      cohortId: null,
      mfaEnabled: false,
      status: 'active',
      platformRating: 3200,
    },
    tenant: PLATFORM_TENANT,
    subscription: UNLIMITED_SUB,
  },

  college_admin: {
    key: 'college_admin',
    email: 'college@dezolver.com',
    password: 'Password123',
    label: 'College Admin',
    user: {
      id: 'user-college-admin-001',
      email: 'college@dezolver.com',
      fullName: 'Priya Krishnamurthy',
      primaryRole: 'college_admin',
      roles: ['college_admin'],
      tenantId: COLLEGE_TENANT.id,
      tenantKind: 'college',
      tenantName: COLLEGE_TENANT.name,
      subdomain: COLLEGE_TENANT.subdomain,
      personId: 'person-college-admin-001',
      cohortId: null,
      mfaEnabled: false,
      status: 'active',
      platformRating: 1400,
    },
    tenant: COLLEGE_TENANT,
    subscription: PRO_SUB,
  },

  faculty: {
    key: 'faculty',
    email: 'faculty@dezolver.com',
    password: 'Password123',
    label: 'Faculty',
    user: {
      id: 'user-faculty-001',
      email: 'faculty@dezolver.com',
      fullName: 'Dr. Ramesh Babu',
      primaryRole: 'faculty',
      roles: ['faculty'],
      tenantId: COLLEGE_TENANT.id,
      tenantKind: 'college',
      tenantName: COLLEGE_TENANT.name,
      subdomain: COLLEGE_TENANT.subdomain,
      personId: 'person-faculty-001',
      cohortId: null,
      mfaEnabled: false,
      status: 'active',
      platformRating: 920,
    },
    tenant: COLLEGE_TENANT,
    subscription: PRO_SUB,
  },

  student: {
    key: 'student',
    email: 'student@dezolver.com',
    password: 'Password123',
    label: 'Student',
    user: {
      id: 'user-student-001',
      email: 'student@dezolver.com',
      fullName: 'Kavya Reddy',
      primaryRole: 'student',
      roles: ['student'],
      tenantId: COLLEGE_TENANT.id,
      tenantKind: 'college',
      tenantName: COLLEGE_TENANT.name,
      subdomain: COLLEGE_TENANT.subdomain,
      personId: 'person-student-001',
      cohortId: 'cohort-cse-2025',
      mfaEnabled: false,
      status: 'active',
      platformRating: 487,
    },
    tenant: COLLEGE_TENANT,
    subscription: PRO_SUB,
  },
}

// Also expose the existing DEV personas via the same interface
export const MOCK_CREDENTIALS_BY_EMAIL: Record<string, MockPersona> = Object.fromEntries(
  Object.values(MOCK_PERSONAS).map((p) => [p.email, p])
)

const MOCK_SESSION_KEY = '__MOCK_SESSION__'

export function saveMockSession(personaKey: string): void {
  try {
    localStorage.setItem(MOCK_SESSION_KEY, personaKey)
  } catch { /* ignore */ }
}

export function loadMockSession(): MockPersona | null {
  try {
    const key = localStorage.getItem(MOCK_SESSION_KEY)
    if (!key) return null
    return MOCK_PERSONAS[key] ?? null
  } catch {
    return null
  }
}

export function clearMockSession(): void {
  try {
    localStorage.removeItem(MOCK_SESSION_KEY)
  } catch { /* ignore */ }
}
