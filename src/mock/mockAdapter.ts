/**
 * Custom Axios adapter that intercepts all API requests and returns mock data.
 * Used when VITE_APP_MODE=mock (Vercel demo deployment).
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { MOCK_CREDENTIALS_BY_EMAIL, saveMockSession } from './mockPersonas'
import {
  mockTenants, mockCohorts, mockInvitations, mockPersons,
  mockRooms, mockCourses, mockProblems, mockMediaAssets,
  mockAssessments, mockSubmissions, mockFlaggedSubmissions,
  mockEvents, mockRegistrations, mockLeaderboard, mockGlobalLeaderboard,
  mockCertificates, mockAllCertificates, mockCertificateTemplates, mockIssuanceRules,
  mockPaths, mockCareerMaps,
  mockPlans, mockSubscriptions, mockInvoices, mockPayments, mockPayouts,
  mockDomains, mockSyllabi, mockOverlays,
  mockAuditEntries, mockFeatureFlags, mockRoomProgress,
  mockSystemHealth, mockPlatformVersion, mockLaunchStatus,
  mockRoles, mockPermissions,
} from './mockData'

// ─── URL Matcher ──────────────────────────────────────────────────────────────

function matchPath(url: string, pattern: string): Record<string, string> | null {
  const clean = url.split('?')[0]
  const pParts = pattern.split('/')
  const uParts = clean.split('/')
  if (pParts.length !== uParts.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < pParts.length; i++) {
    if (pParts[i].startsWith(':')) {
      params[pParts[i].slice(1)] = decodeURIComponent(uParts[i])
    } else if (pParts[i] !== uParts[i]) {
      return null
    }
  }
  return params
}

function getQuery(url: string): Record<string, string> {
  const qs = url.split('?')[1] ?? ''
  const params: Record<string, string> = {}
  if (!qs) return params
  for (const part of qs.split('&')) {
    const [k, v] = part.split('=')
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? '')
  }
  return params
}

// ─── Response Builders ────────────────────────────────────────────────────────

function ok<T>(data: T, pagination?: { nextCursor: string | null; hasMore: boolean }) {
  return { data, pagination: pagination ?? undefined }
}

function paginate<T>(items: T[], cursor?: string, limit = 20): { items: T[]; pagination: { nextCursor: string | null; hasMore: boolean } } {
  const start = cursor ? items.findIndex((_, i) => String(i) === cursor) + 1 : 0
  const slice = items.slice(start, start + limit)
  const hasMore = start + limit < items.length
  return {
    items: slice,
    pagination: { nextCursor: hasMore ? String(start + limit) : null, hasMore },
  }
}

// ─── Mock Session Tracking ────────────────────────────────────────────────────

export function setCurrentMockPersona(key: string | null) {
  if (key) {
    try { localStorage.setItem('__MOCK_SESSION__', key) } catch { /* ignore */ }
  }
}

// ─── Mutable State (for CRUD operations) ─────────────────────────────────────

const state = {
  tenants: [...mockTenants],
  cohorts: [...mockCohorts],
  invitations: [...mockInvitations],
  rooms: [...mockRooms],
  courses: [...mockCourses],
  problems: [...mockProblems],
  assessments: [...mockAssessments],
  events: [...mockEvents],
  registrations: [...mockRegistrations],
  certificates: [...mockCertificates],
  allCertificates: [...mockAllCertificates],
  certTemplates: [...mockCertificateTemplates],
  issuanceRules: [...mockIssuanceRules],
  paths: [...mockPaths],
  subscriptions: [...mockSubscriptions],
  invoices: [...mockInvoices],
  payments: [...mockPayments],
  syllabi: [...mockSyllabi],
  overlays: [...mockOverlays],
  featureFlags: [...mockFeatureFlags],
  submissions: [...mockSubmissions],
  flaggedSubmissions: [...mockFlaggedSubmissions],
  mediaAssets: [...mockMediaAssets],
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Handler ──────────────────────────────────────────────────────────────────

async function handleRequest(method: string, url: string, data: unknown): Promise<unknown> {
  const m = method.toUpperCase()
  const q = getQuery(url)
  const body = (typeof data === 'string' ? JSON.parse(data || '{}') : data) as Record<string, unknown>

  let p: Record<string, string> | null

  // ── Auth ────────────────────────────────────────────────────────────────────

  if (m === 'POST' && matchPath(url, '/auth/login')) {
    const email = body.email as string
    const password = body.password as string
    const persona = MOCK_CREDENTIALS_BY_EMAIL[email]
    if (!persona || password !== persona.password) {
      throw { response: { status: 401, data: { error: { code: 'invalid_credentials', message: 'Invalid email or password.' } } } }
    }
    saveMockSession(persona.key)
    setCurrentMockPersona(persona.key)
    return {
      accessToken: `MOCK_TOKEN_${persona.key}`,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: persona.user.id,
        personId: persona.user.personId,
        tenantId: persona.user.tenantId,
        tenantKind: persona.user.tenantKind,
        email: persona.user.email,
        fullName: persona.user.fullName,
        roles: persona.user.roles,
        mfaEnabled: false,
      },
      linkedUsers: [],
    }
  }

  if (m === 'POST' && matchPath(url, '/auth/logout')) return {}
  if (m === 'POST' && matchPath(url, '/auth/logout/all')) return {}
  if (m === 'POST' && matchPath(url, '/auth/forgot-password')) return {}
  if (m === 'POST' && matchPath(url, '/auth/reset-password')) return {}
  if (m === 'POST' && matchPath(url, '/auth/mfa/verify')) return { accessToken: 'MOCK_MFA_TOKEN', tokenType: 'Bearer', expiresIn: 900, user: {}, linkedUsers: [] }
  if (m === 'POST' && matchPath(url, '/auth/refresh')) return { accessToken: 'MOCK_REFRESH_TOKEN' }

  if (m === 'GET' && matchPath(url, '/me')) {
    const key = localStorage.getItem('__MOCK_SESSION__') ?? 'student'
    const { MOCK_PERSONAS } = await import('./mockPersonas')
    const persona = MOCK_PERSONAS[key] ?? MOCK_PERSONAS['student']
    return {
      user: {
        id: persona.user.id,
        tenantId: persona.user.tenantId,
        personId: persona.user.personId,
        email: persona.user.email,
        fullName: persona.user.fullName,
        primaryRole: persona.user.primaryRole,
        roles: persona.user.roles,
        cohortId: persona.user.cohortId,
        mfaEnabled: false,
        status: 'active',
      },
      person: {
        id: persona.user.personId,
        primaryEmail: persona.user.email,
        displayName: persona.user.fullName,
        platformRating: persona.user.platformRating ?? 0,
      },
      tenant: persona.tenant,
      subscription: persona.subscription,
      linkedUsers: [],
    }
  }

  if (m === 'POST' && matchPath(url, '/me/switch-user')) {
    return { accessToken: 'MOCK_SWITCH_TOKEN', tokenType: 'Bearer', expiresIn: 900, user: {}, linkedUsers: [] }
  }

  // ── Users (MFA) ─────────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/users/me/mfa')) return { enrolled: false }
  if (m === 'POST' && matchPath(url, '/users/me/mfa/enroll')) return { secret: 'JBSWY3DPEHPK3PXP', otpauthUri: 'otpauth://totp/Dezolver:demo@dezolver.com?secret=JBSWY3DPEHPK3PXP' }
  if (m === 'POST' && matchPath(url, '/users/me/mfa/confirm')) return {}
  if (m === 'DELETE' && matchPath(url, '/users/me/mfa')) return {}
  if (m === 'GET' && matchPath(url, '/users/me/export')) return {}
  if (m === 'DELETE' && matchPath(url, '/users/me')) return {}

  // ── Tenants ─────────────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/tenants')) {
    const filtered = state.tenants.filter((t) => {
      if (q.status && t.status !== q.status) return false
      if (q.kind && t.kind !== q.kind) return false
      return true
    })
    const result = paginate(filtered, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/tenants')) {
    const tenant = { id: newId('tenant'), kind: body.kind as string, name: body.name as string, subdomain: body.subdomain as string, status: 'pending' as const, primaryContactEmail: body.primaryContactEmail as string, primaryDomain: body.primaryDomain as string, expectedStudentCount: body.expectedStudentCount as number, createdAt: new Date().toISOString(), statusChangedAt: new Date().toISOString() }
    state.tenants.push(tenant as never)
    return ok(tenant)
  }

  if ((p = matchPath(url, '/tenants/by-subdomain/:subdomain'))) {
    const t = state.tenants.find((x) => x.subdomain === p!.subdomain)
    return ok(t ? { id: t.id, name: t.name, subdomain: t.subdomain, branding: {}, ssoEnabled: false } : null)
  }

  if ((p = matchPath(url, '/tenants/:id/config'))) {
    if (m === 'GET') return ok({ branding: {}, ssoEnabled: false, pathsLockCurated: false })
    if (m === 'PUT') return ok(body)
  }

  if ((p = matchPath(url, '/tenants/:id/transition'))) {
    const t = state.tenants.find((x) => x.id === p!.id)
    if (t) t.status = body.to as never
    return ok({ id: p!.id, status: body.to, statusChangedAt: new Date().toISOString() })
  }

  if ((p = matchPath(url, '/tenants/:id/cohorts'))) {
    if (m === 'GET') return ok(state.cohorts.filter((c) => c.tenantId === p!.id))
    if (m === 'POST') {
      const c = { id: newId('cohort'), tenantId: p!.id, name: body.name as string, academicYear: body.academicYear as string ?? null, memberCount: 0, createdAt: new Date().toISOString() }
      state.cohorts.push(c)
      return ok(c)
    }
  }

  if ((p = matchPath(url, '/tenants/:id/invitations'))) {
    if (m === 'GET') {
      const invs = state.invitations.filter((i) => i.tenantId === p!.id)
      const result = paginate(invs, q.cursor, Number(q.limit) || 20)
      return ok(result.items, result.pagination)
    }
    if (m === 'POST') {
      const inv = { id: newId('inv'), tenantId: p!.id, email: body.email as string, role: body.role as string, cohortId: (body.cohortId as string) ?? null, cohortName: null, status: 'pending', expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), createdAt: new Date().toISOString(), acceptedAt: null }
      state.invitations.push(inv as never)
      return ok(inv)
    }
  }

  if ((p = matchPath(url, '/tenants/:id/invitations/:invId')) && m === 'DELETE') {
    state.invitations = state.invitations.filter((i) => i.id !== p!.invId)
    return ok({})
  }

  if ((p = matchPath(url, '/tenants/:id'))) {
    if (m === 'GET') return ok(state.tenants.find((t) => t.id === p!.id) ?? state.tenants[0])
    if (m === 'PATCH') {
      const t = state.tenants.find((x) => x.id === p!.id)
      if (t) Object.assign(t, body)
      return ok(t)
    }
  }

  // ── Persons ─────────────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/persons')) {
    const result = paginate(mockPersons, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if ((p = matchPath(url, '/persons/:id')) && m === 'GET') {
    return ok(mockPersons.find((x) => x.id === p!.id) ?? mockPersons[0])
  }

  if (m === 'POST' && matchPath(url, '/admin/v1/persons/:id/impersonate')) {
    return ok({ accessToken: 'MOCK_IMPERSONATE_TOKEN', tokenType: 'Bearer', expiresIn: 900 })
  }

  // ── Content: Rooms ──────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/rooms')) {
    const filtered = state.rooms.filter((r) => {
      if (q.status && r.status !== q.status) return false
      if (q.domain && !r.domainCodes.includes(q.domain)) return false
      if (q.difficulty && r.difficulty !== q.difficulty) return false
      if (q.q) { const lq = q.q.toLowerCase(); if (!r.title.toLowerCase().includes(lq)) return false }
      return true
    })
    const result = paginate(filtered, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/rooms')) {
    const room = { id: newId('room'), slug: (body.title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(), status: 'draft', createdAt: new Date().toISOString(), authorId: 'user-platform-admin-001', ...body }
    state.rooms.push(room as never)
    return ok(room)
  }

  if ((p = matchPath(url, '/rooms/:slug/versions')) && m === 'GET') {
    return ok([{ id: newId('rv'), versionNumber: 1, status: 'published', publishedAt: new Date().toISOString(), createdAt: new Date().toISOString() }])
  }

  if ((p = matchPath(url, '/rooms/:slug/publish')) && m === 'PUT') {
    const r = state.rooms.find((x) => x.slug === p!.slug)
    if (r) r.status = 'published'
    return ok(r)
  }

  if ((p = matchPath(url, '/rooms/:slug/review')) && m === 'PUT') {
    const r = state.rooms.find((x) => x.slug === p!.slug)
    if (r) r.status = 'review'
    return ok(r)
  }

  if ((p = matchPath(url, '/rooms/:slug/approve')) && m === 'PUT') {
    const r = state.rooms.find((x) => x.slug === p!.slug)
    if (r) r.status = 'published'
    return ok(r)
  }

  if ((p = matchPath(url, '/rooms/:slug/archive')) && m === 'PUT') {
    const r = state.rooms.find((x) => x.slug === p!.slug)
    if (r) r.status = 'archived'
    return ok(r)
  }

  if ((p = matchPath(url, '/rooms/:slug'))) {
    if (m === 'GET') return ok(state.rooms.find((x) => x.slug === p!.slug) ?? state.rooms[0])
    if (m === 'PATCH') {
      const r = state.rooms.find((x) => x.slug === p!.slug)
      if (r) Object.assign(r, body)
      return ok(r)
    }
  }

  // ── Content: Courses ────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/courses')) {
    const result = paginate(state.courses, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/courses')) {
    const c = { id: newId('course'), slug: (body.title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(), rooms: [], roomCount: 0, status: 'draft', createdAt: new Date().toISOString(), ...body }
    state.courses.push(c as never)
    return ok(c)
  }

  if ((p = matchPath(url, '/courses/:slug/rooms')) && m === 'POST') {
    const c = state.courses.find((x) => x.slug === p!.slug)
    const room = state.rooms.find((r) => r.id === body.roomId)
    if (c && room) {
      c.rooms.push({ id: room.id, slug: room.slug, title: room.title, difficulty: room.difficulty, estimatedMinutes: room.estimatedMinutes ?? null, position: c.rooms.length + 1 })
      c.roomCount = c.rooms.length
    }
    return ok(c)
  }

  if ((p = matchPath(url, '/courses/:slug'))) {
    if (m === 'GET') return ok(state.courses.find((x) => x.slug === p!.slug) ?? state.courses[0])
  }

  // ── Content: Problems ───────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/problems')) {
    const filtered = state.problems.filter((r) => {
      if (q.difficulty && r.difficulty !== q.difficulty) return false
      if (q.q) { const lq = q.q.toLowerCase(); if (!r.title.toLowerCase().includes(lq)) return false }
      return true
    })
    const result = paginate(filtered, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/problems')) {
    const pb = { id: newId('prob'), slug: (body.title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(), status: 'draft', createdAt: new Date().toISOString(), ...body }
    state.problems.push(pb as never)
    return ok(pb)
  }

  if ((p = matchPath(url, '/problems/:slug/test-cases')) && m === 'POST') {
    return ok({ id: newId('tc'), index: 0, isSample: body.isSample, weight: 1, input: body.input, expectedOutput: body.expectedOutput, explanation: body.explanation ?? null })
  }

  if ((p = matchPath(url, '/problems/:slug/publish')) && m === 'PUT') {
    const pb = state.problems.find((x) => x.slug === p!.slug)
    if (pb) pb.status = 'published'
    return ok(pb)
  }

  if ((p = matchPath(url, '/problems/:slug'))) {
    if (m === 'GET') return ok(state.problems.find((x) => x.slug === p!.slug) ?? state.problems[0])
    if (m === 'PATCH') {
      const pb = state.problems.find((x) => x.slug === p!.slug)
      if (pb) Object.assign(pb, body)
      return ok(pb)
    }
  }

  // ── Media ───────────────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/media')) {
    const result = paginate(state.mediaAssets, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/media/initiate')) {
    const asset = { assetId: newId('media'), uploadUrl: 'https://mock-upload.dezolver.com/upload', method: 'PUT', headers: {}, expiresAt: new Date(Date.now() + 3600000).toISOString() }
    return ok(asset)
  }

  if ((p = matchPath(url, '/media/:id/status')) && m === 'PATCH') {
    return ok({ id: p!.id, status: 'ready', cdnUrl: `https://cdn.dezolver.com/assets/${p!.id}` })
  }

  if ((p = matchPath(url, '/media/:id/signed-url')) && m === 'GET') {
    return ok({ url: `https://cdn.dezolver.com/assets/${p!.id}?token=mock`, expiresAt: new Date(Date.now() + 3600000).toISOString() })
  }

  // ── Search ──────────────────────────────────────────────────────────────────

  if (m === 'POST' && matchPath(url, '/search')) {
    const searchQ = (body.q as string ?? '').toLowerCase()
    const items = [
      ...state.rooms.filter((r) => r.title.toLowerCase().includes(searchQ)).slice(0, 5).map((r) => ({ kind: 'room' as const, id: r.id, slug: r.slug, title: r.title, summary: r.summary, difficulty: r.difficulty, status: r.status })),
      ...state.problems.filter((r) => r.title.toLowerCase().includes(searchQ)).slice(0, 5).map((r) => ({ kind: 'problem' as const, id: r.id, slug: r.slug, title: r.title, difficulty: r.difficulty, status: r.status })),
      ...state.courses.filter((r) => r.title.toLowerCase().includes(searchQ)).slice(0, 3).map((r) => ({ kind: 'course' as const, id: r.id, slug: r.slug, title: r.title, summary: r.summary, difficulty: r.difficulty, status: r.status })),
    ]
    return ok({ items, total: items.length, query: body.q })
  }

  // ── Assessments ─────────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/assessments')) {
    const filtered = state.assessments.filter((a) => {
      if (q.status && a.status !== q.status) return false
      if (q.kind && a.kind !== q.kind) return false
      return true
    })
    const result = paginate(filtered, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/assessments')) {
    const a = { id: newId('assess'), status: 'draft', createdAt: new Date().toISOString(), myAttemptCount: 0, myBestVerdict: null, ...body }
    state.assessments.push(a as never)
    return ok(a)
  }

  if ((p = matchPath(url, '/assessments/:id/publish')) && m === 'POST') {
    const a = state.assessments.find((x) => x.id === p!.id)
    if (a) a.status = 'published'
    return ok(a)
  }

  if ((p = matchPath(url, '/assessments/:id/archive')) && m === 'POST') {
    const a = state.assessments.find((x) => x.id === p!.id)
    if (a) a.status = 'archived'
    return ok(a)
  }

  if ((p = matchPath(url, '/assessments/:id/submit/code')) && m === 'POST') {
    const submission = { submissionId: newId('sub'), kind: 'coding_problem', status: 'pending', attemptNumber: 1, subscribeChannel: 'mock-channel', pollUrl: `/submissions/${newId('sub')}` }
    setTimeout(() => {
      const fullSub = { id: submission.submissionId, assessmentId: p!.id, userId: 'user-student-001', kind: 'coding_problem', verdict: ['accepted', 'wrong_answer', 'accepted', 'accepted'][Math.floor(Math.random() * 4)], status: 'completed', score: 100, testCasesPassed: 10, testCasesTotal: 10, executionTimeMs: 89, memoryUsedKb: 12800, language: body.language as string, attemptNumber: 1, submittedAt: new Date().toISOString(), gradedAt: new Date().toISOString() }
      state.submissions.unshift(fullSub as never)
    }, 2000)
    return ok(submission)
  }

  if ((p = matchPath(url, '/assessments/:id/submit/mcq')) && m === 'POST') {
    const answers = body.answers as Array<{ questionId: string; value?: string; values?: string[] }>
    const assessment = state.assessments.find((a) => a.id === p!.id)
    const questions = assessment?.questions ?? []
    let correct = 0
    const perQuestion = questions.map((q) => {
      const ans = answers.find((a) => a.questionId === q.id)
      let isCorrect = false
      if (q.kind === 'mcq_single' && ans?.value === q.correctOptionId) isCorrect = true
      if (q.kind === 'mcq_multi' && JSON.stringify((ans?.values ?? []).sort()) === JSON.stringify((q.correctOptionIds ?? []).sort())) isCorrect = true
      if (isCorrect) correct++
      return { questionId: q.id, correct: isCorrect, points: isCorrect ? (q.weight ?? 1) : 0, maxPoints: q.weight ?? 1 }
    })
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0
    return ok({ id: newId('sub-mcq'), verdict: score >= 60 ? 'accepted' : score > 0 ? 'partial' : 'wrong_answer', score, perQuestion, submittedAt: new Date().toISOString() })
  }

  if ((p = matchPath(url, '/assessments/:id/analytics')) && m === 'GET') {
    return ok({
      assessmentId: p!.id,
      totalAttempts: 186,
      uniqueParticipants: 156,
      passRate: 72,
      avgScore: 68,
      verdictBreakdown: { accepted: 112, wrong_answer: 28, time_limit_exceeded: 16, runtime_error: 12, compilation_error: 18 },
      avgExecutionTimeMs: 125,
      languageBreakdown: { python: 80, java: 45, cpp: 38, javascript: 23 },
    })
  }

  if ((p = matchPath(url, '/assessments/:id'))) {
    if (m === 'GET') return ok(state.assessments.find((x) => x.id === p!.id) ?? state.assessments[0])
    if (m === 'PATCH') {
      const a = state.assessments.find((x) => x.id === p!.id)
      if (a) Object.assign(a, body)
      return ok(a)
    }
    if (m === 'DELETE') {
      state.assessments = state.assessments.filter((x) => x.id !== p!.id)
      return ok({})
    }
  }

  // ── Submissions ─────────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/me/submissions')) {
    const result = paginate(state.submissions, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'GET' && matchPath(url, '/submissions/flagged')) {
    const result = paginate(state.flaggedSubmissions, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if ((p = matchPath(url, '/submissions/:id/flagged/review')) && m === 'PATCH') {
    const f = state.flaggedSubmissions.find((x) => x.id === p!.id || x.submissionId === p!.id)
    if (f) { f.decision = body.decision as never; f.reviewNote = body.note as string; f.reviewedAt = new Date().toISOString() }
    return ok(f)
  }

  if ((p = matchPath(url, '/submissions/:id/judge-run')) && m === 'GET') {
    return ok({ id: newId('jrun'), submissionId: p!.id, attemptNumber: 1, startedAt: new Date().toISOString(), completedAt: new Date().toISOString(), testCaseResults: Array.from({ length: 5 }, (_, i) => ({ index: i, isSample: i < 2, status: 'Accepted', timeMs: 45 + i * 10, memoryKb: 12800 }) ) })
  }

  if ((p = matchPath(url, '/submissions/:id/rerun')) && m === 'POST') {
    return ok({ submissionId: p!.id, status: 'queued' })
  }

  if ((p = matchPath(url, '/submissions/:id')) && m === 'GET') {
    return ok(state.submissions.find((x) => x.id === p!.id) ?? state.submissions[0])
  }

  // ── Events ──────────────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/events')) {
    const filtered = state.events.filter((e) => {
      if (q.kind && e.kind !== q.kind) return false
      if (q.status && e.status !== q.status) return false
      return true
    })
    const result = paginate(filtered, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/events')) {
    const ev = { id: newId('event'), status: 'draft', registrationCount: 0, createdAt: new Date().toISOString(), myRegistration: null, ...body }
    state.events.push(ev as never)
    return ok(ev)
  }

  if ((p = matchPath(url, '/events/:id/publish')) && m === 'POST') {
    const ev = state.events.find((x) => x.id === p!.id)
    if (ev) ev.status = 'published'
    return ok(ev)
  }

  if ((p = matchPath(url, '/events/:id/cancel')) && m === 'POST') {
    const ev = state.events.find((x) => x.id === p!.id)
    if (ev) ev.status = 'cancelled'
    return ok(ev)
  }

  if ((p = matchPath(url, '/events/:id/start')) && m === 'POST') {
    const ev = state.events.find((x) => x.id === p!.id)
    if (ev) ev.status = 'live'
    return ok(ev)
  }

  if ((p = matchPath(url, '/events/:id/end')) && m === 'POST') {
    const ev = state.events.find((x) => x.id === p!.id)
    if (ev) ev.status = 'grading'
    return ok(ev)
  }

  if ((p = matchPath(url, '/events/:id/extend')) && m === 'POST') {
    const ev = state.events.find((x) => x.id === p!.id)
    if (ev) ev.endsAt = body.newEndsAt as string
    return ok(ev)
  }

  if ((p = matchPath(url, '/events/:id/register')) && m === 'POST') {
    const reg = { registrationId: newId('reg'), status: 'registered', payment: null }
    return ok(reg)
  }

  if ((p = matchPath(url, '/events/:id/unregister')) && m === 'POST') {
    return ok({})
  }

  if ((p = matchPath(url, '/events/:id/registrations')) && m === 'GET') {
    const regs = mockRegistrations.filter((r) => r.eventId === p!.id)
    const result = paginate(regs, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if ((p = matchPath(url, '/events/:id/registrations/me')) && m === 'GET') {
    return ok(state.events.find((e) => e.id === p!.id)?.myRegistration ?? null)
  }

  if ((p = matchPath(url, '/events/:id/submit')) && m === 'POST') {
    return ok({ submissionId: newId('evtsub'), status: 'accepted', verdict: 'accepted' })
  }

  if ((p = matchPath(url, '/events/:id/leaderboard')) && m === 'GET') {
    return ok({ eventId: p!.id, entries: mockLeaderboard, updatedAt: new Date().toISOString() })
  }

  if ((p = matchPath(url, '/events/:id/results')) && m === 'GET') {
    return ok(mockLeaderboard.slice(0, 10).map((e) => ({ userId: e.userId, displayName: e.displayName, rank: e.rank, score: e.score ?? 0, totalTimeSeconds: e.totalTime * 60, acceptedProblems: [] })))
  }

  if ((p = matchPath(url, '/events/:id/analytics')) && m === 'GET') {
    return ok({ eventId: p!.id, totalParticipants: 287, submissionsCount: 1240, avgProblemsAttempted: 3.2, passRate: 45, problemStats: [] })
  }

  if ((p = matchPath(url, '/events/:id/server-time')) && m === 'GET') {
    return ok({ serverTime: new Date().toISOString() })
  }

  if ((p = matchPath(url, '/events/:id'))) {
    if (m === 'GET') return ok(state.events.find((x) => x.id === p!.id) ?? state.events[0])
    if (m === 'PATCH') {
      const ev = state.events.find((x) => x.id === p!.id)
      if (ev) Object.assign(ev, body)
      return ok(ev)
    }
    if (m === 'DELETE') {
      state.events = state.events.filter((x) => x.id !== p!.id)
      return ok({})
    }
  }

  // ── Global Leaderboard ──────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/leaderboard/global')) {
    return ok(mockGlobalLeaderboard)
  }

  if ((p = matchPath(url, '/persons/:id/standing')) && m === 'GET') {
    return ok({ rank: 5, rating: 1840, eventsParticipated: 8 })
  }

  // ── Learning Paths ──────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/paths')) {
    const filtered = mockPaths.filter((p) => {
      if (q.status && p.status !== q.status) return false
      if (q.domain && p.domainCode !== q.domain) return false
      return true
    })
    const result = paginate(filtered, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/paths')) {
    const path = { id: newId('path'), kind: body.kind, status: 'draft', stepCount: 0, steps: [], createdAt: new Date().toISOString(), ...body }
    state.paths.push(path as never)
    return ok(path)
  }

  if ((p = matchPath(url, '/paths/:id/publish')) && m === 'PUT') {
    const path = state.paths.find((x) => x.id === p!.id)
    if (path) path.status = 'published'
    return ok(path)
  }

  if ((p = matchPath(url, '/paths/:id/archive')) && m === 'PUT') {
    const path = state.paths.find((x) => x.id === p!.id)
    if (path) path.status = 'archived'
    return ok(path)
  }

  if ((p = matchPath(url, '/paths/:id/fork')) && m === 'POST') {
    const orig = state.paths.find((x) => x.id === p!.id)
    const forked = { ...orig, id: newId('path'), kind: 'personalized', status: 'draft', sourcePathId: p!.id, createdAt: new Date().toISOString() }
    state.paths.push(forked as never)
    return ok(forked)
  }

  if ((p = matchPath(url, '/paths/:id/steps')) && m === 'POST') {
    return ok({ id: newId('step'), pathId: p!.id, roomId: body.roomId, orderIndex: body.orderIndex ?? 0, isOptional: false, prerequisiteStepIds: [] })
  }

  if ((p = matchPath(url, '/paths/:id/steps/reorder')) && m === 'PUT') {
    return ok({ pathId: p!.id })
  }

  if ((p = matchPath(url, '/paths/:id/steps/:stepId')) && m === 'DELETE') {
    return ok({})
  }

  if ((p = matchPath(url, '/paths/:id/steps/:stepId')) && m === 'PATCH') {
    return ok({ id: p!.stepId, ...body })
  }

  if ((p = matchPath(url, '/paths/:id'))) {
    if (m === 'GET') return ok(state.paths.find((x) => x.id === p!.id) ?? state.paths[0])
    if (m === 'PATCH') {
      const path = state.paths.find((x) => x.id === p!.id)
      if (path) Object.assign(path, body)
      return ok(path)
    }
    if (m === 'DELETE') {
      state.paths = state.paths.filter((x) => x.id !== p!.id)
      return ok({})
    }
  }

  // ── My Paths (progress) ─────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/me/paths')) {
    return ok(mockPaths.filter((p) => p.myProgress && (p.myProgress.stepsCompleted > 0 || p.myProgress.percentageComplete > 0)))
  }

  if ((p = matchPath(url, '/me/paths/:pathId/progress')) && m === 'GET') {
    const path = mockPaths.find((x) => x.id === p!.pathId)
    return ok(path?.myProgress ?? { pathId: p!.pathId, userId: 'user-student-001', percentageComplete: 0, stepsCompleted: 0, stepsTotal: 0, isCompleted: false, lastActivityAt: null })
  }

  if ((p = matchPath(url, '/me/paths/:pathId/next-step')) && m === 'GET') {
    const path = mockPaths.find((x) => x.id === p!.pathId)
    const inProgressStep = path?.steps?.find((s) => s.progress === 'in_progress') ?? path?.steps?.find((s) => s.progress === 'not_started')
    return ok({ pathId: p!.pathId, completion: { percentage: path?.myProgress?.percentageComplete ?? 0, stepsCompleted: path?.myProgress?.stepsCompleted ?? 0, stepsTotal: path?.myProgress?.stepsTotal ?? 0 }, next: inProgressStep ?? null, upcoming: path?.steps?.slice(0, 3) ?? [] })
  }

  // ── Room Progress ───────────────────────────────────────────────────────────

  if ((p = matchPath(url, '/rooms/:roomId/progress')) && m === 'GET') {
    const prog = mockRoomProgress.get(p!.roomId)
    return ok(prog ? { roomId: p!.roomId, userId: 'user-student-001', ...prog, timeSpentMinutes: 25 } : { roomId: p!.roomId, userId: 'user-student-001', state: 'not_started', startedAt: null, completedAt: null, timeSpentMinutes: 0 })
  }

  if ((p = matchPath(url, '/rooms/:roomId/progress/start')) && m === 'POST') {
    return ok({ roomId: p!.roomId, state: 'in_progress', startedAt: new Date().toISOString() })
  }

  if ((p = matchPath(url, '/rooms/:roomId/progress/complete')) && m === 'POST') {
    return ok({ roomId: p!.roomId, state: 'completed', completedAt: new Date().toISOString() })
  }

  if ((p = matchPath(url, '/rooms/:roomId/progress/skip')) && m === 'POST') {
    return ok({ roomId: p!.roomId, state: 'skipped' })
  }

  // ── Career Maps ─────────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/career-maps')) {
    const result = paginate(mockCareerMaps, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if ((p = matchPath(url, '/career-maps/:id')) && m === 'GET') {
    return ok(mockCareerMaps.find((x) => x.id === p!.id) ?? mockCareerMaps[0])
  }

  // ── Certificates (My) ───────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/me/certificates')) {
    const result = paginate(state.certificates, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if ((p = matchPath(url, '/me/certificates/:id/download')) && m === 'GET') {
    return new Blob(['MOCK CERTIFICATE PDF - Demo Only'], { type: 'application/pdf' })
  }

  if ((p = matchPath(url, '/me/certificates/:id'))) {
    if (m === 'GET') return ok(state.certificates.find((x) => x.id === p!.id || x.certificateId === p!.id) ?? state.certificates[0])
    if (m === 'PATCH') {
      const c = state.certificates.find((x) => x.id === p!.id)
      if (c) Object.assign(c, body)
      return ok(c)
    }
  }

  // ── Certificates (Admin) ────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/certificates')) {
    const result = paginate(state.allCertificates, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/certificates/issue')) {
    const cert = { id: newId('cert'), certificateId: `DZL-2026-${String(Date.now()).slice(-8)}`, recipientUserId: body.userId, recipientName: 'Demo Recipient', status: 'issued', isPublic: true, achievementKind: 'manual', achievementTitle: body.achievementTitle, templateId: body.templateId, issuedAt: new Date().toISOString(), createdAt: new Date().toISOString() }
    state.allCertificates.push(cert as never)
    return ok(cert)
  }

  if ((p = matchPath(url, '/certificates/:id/revoke')) && m === 'DELETE') {
    const c = state.allCertificates.find((x) => x.id === p!.id)
    if (c) { c.status = 'revoked'; (c as never as Record<string, unknown>)['revokedAt'] = new Date().toISOString() }
    return ok(c)
  }

  if ((p = matchPath(url, '/certificates/:id/reissue')) && m === 'POST') {
    return ok({ id: newId('cert'), status: 'pending' })
  }

  // ── Certificate Verification ────────────────────────────────────────────────

  if ((p = matchPath(url, '/verify/c/:id')) && m === 'GET') {
    const cert = state.allCertificates.find((x) => x.certificateId === p!.id)
    return ok(cert ? {
      certificateId: cert.certificateId,
      status: cert.status === 'issued' ? 'valid' : 'revoked',
      recipientName: cert.recipientName,
      achievementTitle: cert.achievementTitle,
      issuedOn: cert.issuedAt,
      issuingEntity: 'Dezolver Platform',
      downloadAvailable: cert.status === 'issued',
    } : { certificateId: p!.id, status: 'not_found' })
  }

  // ── Certificate Templates ───────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/certificate-templates')) {
    const result = paginate(state.certTemplates, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/certificate-templates')) {
    const t = { id: newId('tmpl'), status: 'draft', createdAt: new Date().toISOString(), ...body }
    state.certTemplates.push(t as never)
    return ok(t)
  }

  if ((p = matchPath(url, '/certificate-templates/:id/publish')) && m === 'PUT') {
    const t = state.certTemplates.find((x) => x.id === p!.id)
    if (t) t.status = 'published'
    return ok(t)
  }

  if ((p = matchPath(url, '/certificate-templates/:id/preview')) && m === 'POST') {
    return ok({ previewHtml: `<div style="padding:40px;border:4px solid #1d4ed8;font-family:Georgia,serif;text-align:center"><h1>Certificate of Achievement</h1><p>This certifies that <strong>${(body.variables as Record<string, string>)?.recipientName ?? 'Demo User'}</strong> has successfully completed the course.</p></div>` })
  }

  if ((p = matchPath(url, '/certificate-templates/:id'))) {
    if (m === 'GET') return ok(state.certTemplates.find((x) => x.id === p!.id) ?? state.certTemplates[0])
    if (m === 'PATCH') {
      const t = state.certTemplates.find((x) => x.id === p!.id)
      if (t) Object.assign(t, body)
      return ok(t)
    }
    if (m === 'DELETE') {
      state.certTemplates = state.certTemplates.filter((x) => x.id !== p!.id)
      return ok({})
    }
  }

  // ── Certificate Rules ───────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/certificate-rules')) {
    const result = paginate(state.issuanceRules, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/certificate-rules')) {
    const r = { id: newId('rule'), isActive: true, createdAt: new Date().toISOString(), ...body }
    state.issuanceRules.push(r as never)
    return ok(r)
  }

  if ((p = matchPath(url, '/certificate-rules/:id')) && m === 'PATCH') {
    const r = state.issuanceRules.find((x) => x.id === p!.id)
    if (r) Object.assign(r, body)
    return ok(r)
  }

  if ((p = matchPath(url, '/certificate-rules/:id')) && m === 'DELETE') {
    const r = state.issuanceRules.find((x) => x.id === p!.id)
    if (r) r.isActive = false
    return ok(r)
  }

  // ── Billing: Plans ──────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/billing/plans')) {
    return ok(mockPlans)
  }

  // ── Billing: Subscriptions ──────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/billing/subscriptions')) {
    const result = paginate(state.subscriptions, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if (m === 'POST' && matchPath(url, '/billing/subscriptions')) {
    const sub = { id: newId('sub'), status: 'active', billingCycle: body.billingCycle ?? 'monthly', currentPeriodStart: new Date().toISOString(), currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(), amountInr: 14999, createdAt: new Date().toISOString(), ...body }
    state.subscriptions.push(sub as never)
    return ok({ subscriptionId: sub.id, status: 'active', amountInr: 14999, billingCycle: 'monthly', razorpay: { orderId: 'mock_order_123', publicKey: 'rzp_test_mock', checkoutUrl: null } })
  }

  if ((p = matchPath(url, '/billing/subscriptions/:id/upgrade')) && m === 'PATCH') {
    return ok({ subscriptionId: p!.id, razorpay: { orderId: 'mock_upgrade_order', publicKey: 'rzp_test_mock', amountInr: 39999 } })
  }

  if ((p = matchPath(url, '/billing/subscriptions/:id/cancel')) && m === 'POST') {
    const s = state.subscriptions.find((x) => x.id === p!.id)
    if (s) s.status = 'cancelled'
    return ok(s)
  }

  if ((p = matchPath(url, '/billing/subscriptions/:id/retry')) && m === 'POST') {
    return ok({ orderId: 'mock_retry_order', publicKey: 'rzp_test_mock', amountInr: 14999 })
  }

  if ((p = matchPath(url, '/billing/subscriptions/by-tenant/:tenantId')) && m === 'GET') {
    return ok(state.subscriptions.find((x) => x.tenantId === p!.tenantId) ?? state.subscriptions[0])
  }

  if ((p = matchPath(url, '/billing/subscriptions/:id')) && m === 'GET') {
    return ok(state.subscriptions.find((x) => x.id === p!.id) ?? state.subscriptions[0])
  }

  // ── Billing: Invoices ───────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/billing/invoices')) {
    const result = paginate(state.invoices, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if ((p = matchPath(url, '/billing/invoices/:id/download')) && m === 'GET') {
    return new Blob([`MOCK INVOICE PDF\n\nInvoice ID: ${p!.id}\nAmount: ₹14,999\nStatus: Paid\n\nDezolver Platform — Demo Invoice`], { type: 'application/pdf' })
  }

  if ((p = matchPath(url, '/billing/invoices/:id')) && m === 'GET') {
    return ok(state.invoices.find((x) => x.id === p!.id) ?? state.invoices[0])
  }

  // ── Billing: Payments ───────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/billing/payments')) {
    const result = paginate(state.payments, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if ((p = matchPath(url, '/billing/payments/:id')) && m === 'GET') {
    return ok(state.payments.find((x) => x.id === p!.id) ?? state.payments[0])
  }

  // ── Admin Billing: Payouts ──────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/admin/v1/billing/payouts')) {
    const result = paginate(mockPayouts, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  if ((p = matchPath(url, '/admin/v1/billing/payouts/:id/download')) && m === 'GET') {
    return new Blob(['MOCK PAYOUT REPORT — Demo Only'], { type: 'application/pdf' })
  }

  if ((p = matchPath(url, '/admin/v1/billing/payouts/:id/initiate')) && m === 'POST') {
    const payout = mockPayouts.find((x) => x.id === p!.id)
    if (payout) payout.status = 'processing'
    return ok(payout)
  }

  if ((p = matchPath(url, '/admin/v1/billing/payouts/:id')) && m === 'GET') {
    return ok(mockPayouts.find((x) => x.id === p!.id) ?? mockPayouts[0])
  }

  // ── Admin Billing: Refunds ──────────────────────────────────────────────────

  if (m === 'POST' && matchPath(url, '/admin/v1/billing/payments/refund')) {
    return ok({ refundId: newId('refund'), status: 'processing', amount: body.amount })
  }

  // ── Curriculum: Domains ─────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/curriculum/domains')) {
    return ok(mockDomains)
  }

  // ── Curriculum: Syllabi ─────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/curriculum/syllabi')) {
    return ok(state.syllabi)
  }

  if (m === 'POST' && matchPath(url, '/curriculum/syllabi')) {
    const s = { id: newId('syl'), tenantId: 'tenant-college-iitm-001', status: 'draft', createdByUserId: 'user-college-admin-001', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), nodes: [], ...body }
    state.syllabi.push(s as never)
    return ok(s)
  }

  if ((p = matchPath(url, '/curriculum/syllabi/:id/publish')) && m === 'POST') {
    const s = state.syllabi.find((x) => x.id === p!.id)
    if (s) s.status = 'published'
    return ok(s)
  }

  if ((p = matchPath(url, '/curriculum/syllabi/:id/archive')) && m === 'POST') {
    const s = state.syllabi.find((x) => x.id === p!.id)
    if (s) s.status = 'archived'
    return ok(s)
  }

  if ((p = matchPath(url, '/curriculum/syllabi/:id/effective')) && m === 'GET') {
    return ok(state.syllabi.find((x) => x.id === p!.id) ?? state.syllabi[0])
  }

  if ((p = matchPath(url, '/curriculum/syllabi/:id/nodes')) && m === 'POST') {
    return ok({ id: newId('node'), syllabusId: p!.id, parentId: body.parentId ?? null, title: body.title, kind: body.kind, contentRef: body.contentRef ?? null, position: body.position ?? 0, metadata: {} })
  }

  if ((p = matchPath(url, '/curriculum/syllabi/:id/nodes/:nodeId')) && m === 'PATCH') {
    return ok({ id: p!.nodeId, syllabusId: p!.id, ...body })
  }

  if ((p = matchPath(url, '/curriculum/syllabi/:id/nodes/:nodeId')) && m === 'DELETE') {
    return ok({})
  }

  if ((p = matchPath(url, '/curriculum/syllabi/:id'))) {
    if (m === 'GET') return ok(state.syllabi.find((x) => x.id === p!.id) ?? state.syllabi[0])
    if (m === 'PATCH') {
      const s = state.syllabi.find((x) => x.id === p!.id)
      if (s) Object.assign(s, body)
      return ok(s)
    }
  }

  // ── My Syllabus ─────────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/me/syllabus')) {
    return ok({ id: 'usa-001', userId: 'user-student-001', tenantId: 'tenant-college-iitm-001', syllabusId: state.syllabi[0]?.id, syllabus: state.syllabi[0] })
  }

  // ── Curriculum: Overlays ────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/curriculum/overlays')) {
    return ok(state.overlays)
  }

  if (m === 'POST' && matchPath(url, '/curriculum/overlays')) {
    const o = { id: newId('overlay'), status: 'draft', createdAt: new Date().toISOString(), operations: [], ...body }
    state.overlays.push(o as never)
    return ok(o)
  }

  if ((p = matchPath(url, '/curriculum/overlays/:id/activate')) && m === 'POST') {
    const o = state.overlays.find((x) => x.id === p!.id)
    if (o) o.status = 'active'
    return ok(o)
  }

  if ((p = matchPath(url, '/curriculum/overlays/:id/archive')) && m === 'POST') {
    const o = state.overlays.find((x) => x.id === p!.id)
    if (o) o.status = 'archived'
    return ok(o)
  }

  if ((p = matchPath(url, '/curriculum/overlays/:id/conflicts')) && m === 'GET') {
    return ok({ overlayId: p!.id, conflicts: [] })
  }

  if ((p = matchPath(url, '/curriculum/overlays/:id/preview')) && m === 'GET') {
    return ok({ overlayId: p!.id, syllabusId: 'syl-cse-001', cohortId: 'cohort-cse-2025', operations: [] })
  }

  if ((p = matchPath(url, '/curriculum/overlays/:id/upgrade')) && m === 'POST') {
    return ok({ overlayId: p!.id, status: 'upgraded', conflictsRemoved: 0 })
  }

  if ((p = matchPath(url, '/curriculum/overlays/:id/operations')) && m === 'GET') {
    const o = state.overlays.find((x) => x.id === p!.id)
    return ok(o?.operations ?? [])
  }

  if ((p = matchPath(url, '/curriculum/overlays/:id/operations')) && m === 'POST') {
    const op = { id: newId('op'), overlayId: p!.id, sequence: 1, operationType: body.operationType, targetNodeId: body.targetNodeId, payload: body.payload ?? {}, createdAt: new Date().toISOString() }
    const o = state.overlays.find((x) => x.id === p!.id)
    if (o) { if (!o.operations) o.operations = []; o.operations.push(op as never) }
    return ok(op)
  }

  if ((p = matchPath(url, '/curriculum/overlays/:id/operations/:opId')) && m === 'DELETE') {
    return ok({})
  }

  if ((p = matchPath(url, '/curriculum/overlays/:id'))) {
    if (m === 'GET') return ok(state.overlays.find((x) => x.id === p!.id) ?? state.overlays[0])
  }

  // ── Platform: Feature Flags ─────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/feature-flags')) {
    return ok(state.featureFlags)
  }

  if (m === 'PUT' && matchPath(url, '/feature-flags')) {
    const flags = body.flags as Record<string, boolean>
    for (const [key, enabled] of Object.entries(flags)) {
      const f = state.featureFlags.find((x) => x.key === key)
      if (f) f.enabled = enabled
    }
    return ok(state.featureFlags)
  }

  if ((p = matchPath(url, '/feature-flags/:key/toggle')) && m === 'POST') {
    const f = state.featureFlags.find((x) => x.key === p!.key)
    if (f) f.enabled = !f.enabled
    return ok(f)
  }

  // ── Platform: Launch & Version ──────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/platform/launch-status')) {
    return ok(mockLaunchStatus)
  }

  if (m === 'POST' && matchPath(url, '/platform/launch')) {
    return ok({ ...mockLaunchStatus, currentPhase: 'limited_ga' })
  }

  if (m === 'POST' && matchPath(url, '/platform/phase')) {
    return ok(mockLaunchStatus)
  }

  if (m === 'GET' && matchPath(url, '/platform/version')) {
    return ok(mockPlatformVersion)
  }

  if (m === 'GET' && matchPath(url, '/platform/time')) {
    return ok({ serverTime: new Date().toISOString(), timezone: 'Asia/Kolkata' })
  }

  if (m === 'GET' && matchPath(url, '/server-time')) {
    return ok({ serverTime: new Date().toISOString() })
  }

  // ── System Health ───────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/health')) {
    return ok(mockSystemHealth)
  }

  // ── Audit Logs ──────────────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/audit/entries')) {
    const entries = mockAuditEntries.filter((e) => {
      if (q.action && !e.action.includes(q.action)) return false
      if (q.tenantId && e.tenantId !== q.tenantId) return false
      return true
    })
    const result = paginate(entries, q.cursor, Number(q.limit) || 20)
    return ok(result.items, result.pagination)
  }

  // ── Roles & Permissions ─────────────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/roles')) {
    return ok(mockRoles)
  }

  if (m === 'GET' && matchPath(url, '/permissions')) {
    return ok(mockPermissions)
  }

  // ── Settings (User preferences) ─────────────────────────────────────────────

  if (m === 'GET' && matchPath(url, '/settings')) {
    return ok({ theme: 'system', language: 'en', notifications: { email: true, inApp: true }, privacy: { showActivity: true } })
  }

  if (m === 'PATCH' && matchPath(url, '/settings')) {
    return ok(body)
  }

  // ── Admin URLs (platform.service uses /admin/v1/) ───────────────────────────

  if (m === 'GET' && url.startsWith('/admin/v1/')) {
    return ok({ status: 'ok', data: [] })
  }

  if (m === 'POST' && url.startsWith('/admin/v1/')) {
    return ok({ status: 'ok' })
  }

  // ── Catchall ─────────────────────────────────────────────────────────────────

  console.warn('[MockAdapter] Unhandled:', m, url)
  return ok({})
}

// ─── Axios Custom Adapter ─────────────────────────────────────────────────────

export async function mockAxiosAdapter(config: AxiosRequestConfig): Promise<AxiosResponse> {
  const delay = 150 + Math.random() * 250
  await new Promise((r) => setTimeout(r, delay))

  const url = config.url ?? ''
  const method = config.method ?? 'GET'
  const data = config.data

  try {
    const responseData = await handleRequest(method, url, data)

    if (responseData instanceof Blob) {
      return {
        data: responseData,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/pdf' },
        config,
        request: {},
      } as AxiosResponse
    }

    return {
      data: responseData,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
      request: {},
    } as AxiosResponse
  } catch (err) {
    // Re-throw to trigger axios error interceptors
    throw err
  }
}
