export const APP_NAME = 'Dezolver'
export const APP_VERSION = '2.0.0'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3002'
export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY ?? ''

export const TOKEN_COOKIE_NAME = 'dz_refresh'
/** Refresh proactively 60 s before the 15-min access-token expires */
export const ACCESS_TOKEN_EXPIRY_MS = 14 * 60 * 1000

export const REMEMBERED_EMAIL_KEY = 'dezolver_remember_email'

export const QUERY_KEYS = {
  ME: ['me'] as const,
  TENANTS: ['tenants'] as const,
  USERS: ['users'] as const,
  PERSONS: ['persons'] as const,
  ROOMS: ['rooms'] as const,
  COURSES: ['courses'] as const,
  PROBLEMS: ['problems'] as const,
  MEDIA: ['media'] as const,
  SEARCH: ['search'] as const,
  ASSESSMENTS: ['assessments'] as const,
  SUBMISSIONS: ['submissions'] as const,
  FLAGGED: ['flagged-submissions'] as const,
  EVENTS: ['events'] as const,
  GLOBAL_LEADERBOARD: ['leaderboard', 'global'] as const,
  BILLING_PLANS: ['billing-plans'] as const,
  BILLING_SUBSCRIPTION: ['billing-subscription'] as const,
  BILLING_SUBSCRIPTIONS: ['billing-subscriptions'] as const,
  BILLING_INVOICES: ['billing-invoices'] as const,
  BILLING_PAYMENTS: ['billing-payments'] as const,
  BILLING_PAYOUTS: ['billing-payouts'] as const,
  PATHS: ['paths'] as const,
  MY_PATHS: ['my-paths'] as const,
  PATH_PROGRESS: ['path-progress'] as const,
  CAREER_MAPS: ['career-maps'] as const,
  MY_CERTIFICATES: ['my-certificates'] as const,
  CERTIFICATES_ADMIN: ['certificates-admin'] as const,
  CERTIFICATE_VERIFY: ['certificate-verify'] as const,
  CERT_TEMPLATES: ['certificate-templates'] as const,
  ISSUANCE_RULES: ['issuance-rules'] as const,
  CURRICULUM_DOMAINS: ['curriculum-domains'] as const,
  CURRICULUM_SYLLABI: ['curriculum-syllabi'] as const,
  MY_SYLLABUS: ['my-syllabus'] as const,
  EFFECTIVE_SYLLABUS: (syllabusId: string) => ['effective-syllabus', syllabusId] as const,
  CURRICULUM_OVERLAYS: ['curriculum-overlays'] as const,
  OVERLAY_OPERATIONS: (overlayId: string) => ['overlay-operations', overlayId] as const,
  OVERLAY_CONFLICTS: (overlayId: string) => ['overlay-conflicts', overlayId] as const,
  OVERLAY_PREVIEW: (overlayId: string) => ['overlay-preview', overlayId] as const,
  TENANT_BRANDING: (subdomain: string) => ['tenant-branding', subdomain] as const,
  AUDIT_ENTRIES: ['audit-entries'] as const,
  FEATURE_FLAGS: ['feature-flags'] as const,
  LAUNCH_STATUS: ['launch-status'] as const,
  PLATFORM_VERSION: ['platform-version'] as const,
  PLATFORM_TIME: ['platform-time'] as const,
  SYSTEM_HEALTH: ['system-health'] as const,
  DASHBOARD: {
    STATS: (role: string) => ['dashboard', 'stats', role] as const,
    ACTIVITY: (role: string) => ['dashboard', 'activity', role] as const,
    NOTIFICATIONS: ['dashboard', 'notifications'] as const,
  },
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  MFA_VERIFY: '/mfa/verify',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  UNAUTHORIZED: '/unauthorized',
  // Platform admin hub
  PLATFORM: '/platform',
  PLATFORM_AUDIT: '/platform/audit',
  PLATFORM_FLAGS: '/platform/flags',
  PLATFORM_ANALYTICS: '/platform/analytics',
  PLATFORM_HEALTH: '/platform/health',
  // Tenant management (platform admin)
  PLATFORM_TENANTS: '/platform/tenants',
  PLATFORM_TENANT_NEW: '/platform/tenants/new',
  PLATFORM_TENANT: (id: string) => `/platform/tenants/${id}`,
  PLATFORM_TENANT_CONFIG: (id: string) => `/platform/tenants/${id}/config`,
  PLATFORM_TENANT_TRANSITION: (id: string) => `/platform/tenants/${id}/transition`,
  // Tenant self (college admin)
  TENANT_OVERVIEW: '/tenant/overview',
  TENANT_COHORTS: '/tenant/cohorts',
  TENANT_INVITATIONS: '/tenant/invitations',
  TENANT_USERS: '/tenant/users',
  TENANT_USER: (id: string) => `/tenant/users/${id}`,
  // Platform persons / users
  PLATFORM_PERSONS: '/platform/persons',
  PLATFORM_PERSON: (id: string) => `/platform/persons/${id}`,
  // Roles & permissions
  ROLES: '/roles',
  PERMISSIONS: '/permissions',
} as const

export const PLAN_FEATURES: Record<string, Record<string, boolean>> = {
  starter: {
    events: false,
    assessments: true,
    certificates: false,
    analytics: false,
    sso: false,
    paths: true,
    curriculum: true,
  },
  professional: {
    events: true,
    assessments: true,
    certificates: true,
    analytics: true,
    sso: false,
    paths: true,
    curriculum: true,
  },
  enterprise: {
    events: true,
    assessments: true,
    certificates: true,
    analytics: true,
    sso: true,
    paths: true,
    curriculum: true,
  },
  unlimited: {
    events: true,
    assessments: true,
    certificates: true,
    analytics: true,
    sso: true,
    paths: true,
    curriculum: true,
  },
  /** Direct (B2C) subscribers */
  direct: {
    events: true,
    assessments: true,
    certificates: true,
    analytics: false,
    sso: false,
    paths: true,
    curriculum: true,
  },
}

export const PAGINATION_DEFAULTS = {
  LIMIT: 20,
  MAX_LIMIT: 200,
} as const
