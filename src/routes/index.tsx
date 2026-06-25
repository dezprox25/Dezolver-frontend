import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from '@/components/layouts/AppLayout'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { GuestGuard } from '@/components/guards/GuestGuard'
import { RoleGate } from '@/components/guards/RoleGate'

// ── Auth pages ────────────────────────────────────────────────────────────────
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { MfaVerifyPage } from '@/pages/auth/MfaVerifyPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { InvitationAcceptPage } from '@/pages/auth/InvitationAcceptPage'

// ── App shell pages ───────────────────────────────────────────────────────────
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

// ── Platform admin: Hub pages ─────────────────────────────────────────────────
import { PlatformDashboardPage } from '@/pages/platform/PlatformDashboardPage'
import { AuditLogsPage } from '@/pages/platform/audit/AuditLogsPage'
import { FeatureFlagsPage } from '@/pages/platform/flags/FeatureFlagsPage'
import { PlatformAnalyticsPage } from '@/pages/platform/analytics/PlatformAnalyticsPage'
import { SystemHealthPage } from '@/pages/platform/health/SystemHealthPage'

// ── Platform admin: Tenant management ────────────────────────────────────────
import { TenantsListPage } from '@/pages/platform/tenants/TenantsListPage'
import { TenantCreatePage } from '@/pages/platform/tenants/TenantCreatePage'
import { TenantDetailPage } from '@/pages/platform/tenants/TenantDetailPage'
import { TenantTransitionPage } from '@/pages/platform/tenants/TenantTransitionPage'
import { TenantConfigPage } from '@/pages/platform/tenants/TenantConfigPage'

// ── Platform admin: Persons ───────────────────────────────────────────────────
import { PersonsPage } from '@/pages/platform/persons/PersonsPage'
import { PersonDetailPage } from '@/pages/platform/persons/PersonDetailPage'

// ── College admin: Tenant + Cohorts + Invitations + Users ────────────────────
import { TenantOverviewPage } from '@/pages/tenant/TenantOverviewPage'
import { CohortsPage } from '@/pages/tenant/cohorts/CohortsPage'
import { InvitationsPage } from '@/pages/tenant/invitations/InvitationsPage'
import { UsersPage } from '@/pages/tenant/users/UsersPage'
import { UserDetailPage } from '@/pages/tenant/users/UserDetailPage'

// ── Roles & Permissions ───────────────────────────────────────────────────────
import { RolesPage } from '@/pages/roles/RolesPage'
import { PermissionsPage } from '@/pages/permissions/PermissionsPage'

// ── Learning Paths & Progress ─────────────────────────────────────────────────
import { PathsPage } from '@/pages/paths/PathsPage'
import { PathDetailPage } from '@/pages/paths/PathDetailPage'
import { PathCreatePage } from '@/pages/paths/PathCreatePage'
import { PathEditPage } from '@/pages/paths/PathEditPage'
import { MyProgressPage } from '@/pages/paths/MyProgressPage'
import { MyPathProgressPage } from '@/pages/paths/MyPathProgressPage'
import { CareerMapsPage } from '@/pages/paths/CareerMapsPage'
import { CareerMapDetailPage } from '@/pages/paths/CareerMapDetailPage'
import { FacultyProgressPage } from '@/pages/paths/FacultyProgressPage'

// ── Credentials & Certificates ───────────────────────────────────────────────
import { MyCertificatesPage } from '@/pages/credentials/MyCertificatesPage'
import { CertificateDetailPage } from '@/pages/credentials/CertificateDetailPage'
import { PublicVerificationPage } from '@/pages/credentials/PublicVerificationPage'
import { CertificateTemplatesPage } from '@/pages/credentials/CertificateTemplatesPage'
import { CertificateTemplateEditorPage } from '@/pages/credentials/CertificateTemplateEditorPage'
import { IssuanceRulesPage } from '@/pages/credentials/IssuanceRulesPage'
import { CertificatesAdminPage } from '@/pages/credentials/CertificatesAdminPage'

// ── Events & Leaderboard ──────────────────────────────────────────────────────
import { EventsPage } from '@/pages/events/EventsPage'
import { EventDetailPage } from '@/pages/events/EventDetailPage'
import { EventCreatePage } from '@/pages/events/EventCreatePage'
import { EventEditPage } from '@/pages/events/EventEditPage'
import { EventLivePage } from '@/pages/events/EventLivePage'
import { EventLeaderboardPage } from '@/pages/events/EventLeaderboardPage'
import { EventResultsPage } from '@/pages/events/EventResultsPage'
import { EventManagePage } from '@/pages/events/EventManagePage'
import { EventAnalyticsPage } from '@/pages/events/EventAnalyticsPage'
import { GlobalLeaderboardPage } from '@/pages/leaderboard/GlobalLeaderboardPage'

// ── Assessments & Submissions ─────────────────────────────────────────────────
import { AssessmentsPage } from '@/pages/assessments/AssessmentsPage'
import { AssessmentDetailPage } from '@/pages/assessments/AssessmentDetailPage'
import { AssessmentCreatePage } from '@/pages/assessments/AssessmentCreatePage'
import { AssessmentEditPage } from '@/pages/assessments/AssessmentEditPage'
import { AssessmentWorkspacePage } from '@/pages/assessments/AssessmentWorkspacePage'
import { MCQWorkspacePage } from '@/pages/assessments/MCQWorkspacePage'
import { AssessmentAnalyticsPage } from '@/pages/assessments/AssessmentAnalyticsPage'
import { SubmissionsPage } from '@/pages/submissions/SubmissionsPage'
import { SubmissionDetailPage } from '@/pages/submissions/SubmissionDetailPage'
import { FlaggedSubmissionsPage } from '@/pages/submissions/FlaggedSubmissionsPage'

// ── Content Catalog ───────────────────────────────────────────────────────────
import { RoomsPage } from '@/pages/content/rooms/RoomsPage'
import { RoomDetailPage } from '@/pages/content/rooms/RoomDetailPage'
import { RoomCreatePage } from '@/pages/content/rooms/RoomCreatePage'
import { RoomEditPage } from '@/pages/content/rooms/RoomEditPage'
import { CoursesPage } from '@/pages/content/courses/CoursesPage'
import { CourseDetailPage } from '@/pages/content/courses/CourseDetailPage'
import { CourseCreatePage } from '@/pages/content/courses/CourseCreatePage'
import { ProblemsPage } from '@/pages/content/problems/ProblemsPage'
import { ProblemDetailPage } from '@/pages/content/problems/ProblemDetailPage'
import { ProblemCreatePage } from '@/pages/content/problems/ProblemCreatePage'
import { MediaLibraryPage } from '@/pages/content/media/MediaLibraryPage'
import { SearchPage } from '@/pages/content/search/SearchPage'

// ── Curriculum & Syllabus ─────────────────────────────────────────────────────
import { MySyllabusPage } from '@/pages/curriculum/MySyllabusPage'
import { SyllabiListPage } from '@/pages/curriculum/SyllabiListPage'
import { SyllabusDetailPage } from '@/pages/curriculum/SyllabusDetailPage'
import { OverlaysListPage } from '@/pages/curriculum/OverlaysListPage'
import { OverlayDetailPage } from '@/pages/curriculum/OverlayDetailPage'
import { OverlayPreviewPage } from '@/pages/curriculum/OverlayPreviewPage'
import { OverlayConflictsPage } from '@/pages/curriculum/OverlayConflictsPage'
import { OverlayUpgradePage } from '@/pages/curriculum/OverlayUpgradePage'

// ── Billing ───────────────────────────────────────────────────────────────────
import { BillingDashboardPage } from '@/pages/billing/BillingDashboardPage'
import { PlansPage } from '@/pages/billing/PlansPage'
import { SubscriptionPage } from '@/pages/billing/SubscriptionPage'
import { InvoicesPage } from '@/pages/billing/InvoicesPage'
import { InvoiceDetailPage } from '@/pages/billing/InvoiceDetailPage'
import { PaymentsPage } from '@/pages/billing/PaymentsPage'
import { PaymentDetailPage } from '@/pages/billing/PaymentDetailPage'
import { AdminBillingPage } from '@/pages/billing/AdminBillingPage'

// ── Error pages ───────────────────────────────────────────────────────────────
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'

export const router = createBrowserRouter([
  // ── Public auth routes (redirect authenticated users away) ──────────────
  {
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // ── Semi-public auth routes ─────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: '/mfa/verify', element: <MfaVerifyPage /> },
      { path: '/invitations/accept/:token', element: <InvitationAcceptPage /> },
    ],
  },

  // ── Public certificate verification (no auth, no app shell) ─────────────
  {
    path: '/verify/c/:id',
    element: <PublicVerificationPage />,
  },

  // ── Protected app routes ────────────────────────────────────────────────
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'search', element: <SearchPage /> },

      // Roles & Permissions — visible to all authenticated users
      { path: 'roles', element: <RolesPage /> },
      { path: 'permissions', element: <PermissionsPage /> },

      // ── My Syllabus (all authenticated) ──────────────────────────────
      { path: 'me/syllabus', element: <MySyllabusPage /> },

      // ── Curriculum management (content_manager, college_admin, platform_admin) ──
      {
        path: 'curriculum',
        element: (
          <RoleGate
            roles={['content_manager', 'college_admin', 'platform_admin']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <Outlet />
          </RoleGate>
        ),
        children: [
          {
            path: 'syllabi',
            element: <Outlet />,
            children: [
              { index: true, element: <SyllabiListPage /> },
              { path: ':id', element: <SyllabusDetailPage /> },
            ],
          },
        ],
      },

      // ── Tenant curriculum overlays (college_admin, coordinator) ───────
      {
        path: 'tenant/curriculum',
        element: (
          <RoleGate
            roles={['college_admin', 'coordinator']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <Outlet />
          </RoleGate>
        ),
        children: [
          {
            path: 'overlays',
            element: <Outlet />,
            children: [
              { index: true, element: <OverlaysListPage /> },
              { path: ':id', element: <OverlayDetailPage /> },
              { path: ':id/preview', element: <OverlayPreviewPage /> },
              { path: ':id/conflicts', element: <OverlayConflictsPage /> },
              { path: ':id/upgrade', element: <OverlayUpgradePage /> },
            ],
          },
        ],
      },

      // ── Events ───────────────────────────────────────────────────────
      {
        path: 'events',
        element: <Outlet />,
        children: [
          // Event catalog — all authenticated
          { index: true, element: <EventsPage /> },

          // Create event — faculty, coordinator, college_admin, platform_admin
          {
            path: 'create',
            element: (
              <RoleGate
                roles={['faculty', 'coordinator', 'college_admin', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <EventCreatePage />
              </RoleGate>
            ),
          },

          // Event detail — all authenticated
          { path: ':id', element: <EventDetailPage /> },

          // Edit — same as create (draft only, enforced in page)
          {
            path: ':id/edit',
            element: (
              <RoleGate
                roles={['faculty', 'coordinator', 'college_admin', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <EventEditPage />
              </RoleGate>
            ),
          },

          // Competition workspace — all authenticated (backend enforces registration)
          { path: ':id/live', element: <EventLivePage /> },

          // Live leaderboard — all authenticated (backend enforces visibility)
          { path: ':id/leaderboard', element: <EventLeaderboardPage /> },

          // Results — all authenticated
          { path: ':id/results', element: <EventResultsPage /> },

          // Organizer dashboard — faculty, college_admin, platform_admin
          {
            path: ':id/manage',
            element: (
              <RoleGate
                roles={['faculty', 'coordinator', 'college_admin', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <EventManagePage />
              </RoleGate>
            ),
          },

          // Event analytics — organizer only
          {
            path: ':id/analytics',
            element: (
              <RoleGate
                roles={['faculty', 'coordinator', 'college_admin', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <EventAnalyticsPage />
              </RoleGate>
            ),
          },
        ],
      },

      // ── Global Leaderboard ────────────────────────────────────────────
      { path: 'leaderboard', element: <GlobalLeaderboardPage /> },

      // ── Learning Paths ────────────────────────────────────────────────
      {
        path: 'paths',
        element: <Outlet />,
        children: [
          { index: true, element: <PathsPage /> },
          {
            path: 'create',
            element: (
              <RoleGate
                roles={['faculty', 'coordinator', 'college_admin', 'content_manager', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <PathCreatePage />
              </RoleGate>
            ),
          },
          { path: ':id', element: <PathDetailPage /> },
          {
            path: ':id/edit',
            element: (
              <RoleGate
                roles={['faculty', 'coordinator', 'college_admin', 'content_manager', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <PathEditPage />
              </RoleGate>
            ),
          },
        ],
      },

      // ── Career Maps ───────────────────────────────────────────────────
      {
        path: 'career-maps',
        element: <Outlet />,
        children: [
          { index: true, element: <CareerMapsPage /> },
          { path: ':id', element: <CareerMapDetailPage /> },
        ],
      },

      // ── My Progress ───────────────────────────────────────────────────
      {
        path: 'me/progress',
        element: <Outlet />,
        children: [
          { index: true, element: <MyProgressPage /> },
          { path: ':pathId', element: <MyPathProgressPage /> },
        ],
      },

      // ── Faculty / Admin Progress Analytics ───────────────────────────
      {
        path: 'platform/progress',
        element: (
          <RoleGate
            roles={['faculty', 'coordinator', 'college_admin', 'platform_admin']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <FacultyProgressPage />
          </RoleGate>
        ),
      },

      // ── My Certificates (all authenticated) ───────────────────────────
      {
        path: 'me/certificates',
        element: <Outlet />,
        children: [
          { index: true, element: <MyCertificatesPage /> },
          { path: ':id', element: <CertificateDetailPage /> },
        ],
      },

      // ── Platform Credentials Admin ────────────────────────────────────
      {
        path: 'platform/credentials',
        element: (
          <RoleGate
            roles={['content_manager', 'college_admin', 'platform_admin']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <Outlet />
          </RoleGate>
        ),
        children: [
          // Admin certificate list — college_admin, platform_admin
          {
            index: true,
            element: (
              <RoleGate
                roles={['college_admin', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <CertificatesAdminPage />
              </RoleGate>
            ),
          },
          // Template management — content_manager, college_admin, platform_admin
          { path: 'templates', element: <CertificateTemplatesPage /> },
          { path: 'templates/new', element: <CertificateTemplateEditorPage /> },
          { path: 'templates/:id/edit', element: <CertificateTemplateEditorPage /> },
          // Issuance rules
          { path: 'rules', element: <IssuanceRulesPage /> },
        ],
      },

      // ── Assessments ──────────────────────────────────────────────────
      {
        path: 'assessments',
        element: <Outlet />,
        children: [
          // Assessment list — all authenticated users
          { index: true, element: <AssessmentsPage /> },

          // Authoring routes — faculty, coordinator, college_admin, content_manager, platform_admin
          {
            path: 'create',
            element: (
              <RoleGate
                roles={['faculty', 'coordinator', 'college_admin', 'content_manager', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <AssessmentCreatePage />
              </RoleGate>
            ),
          },

          // Assessment detail — all authenticated (backend enforces visibility)
          { path: ':id', element: <AssessmentDetailPage /> },

          // Edit — faculty, coordinator, college_admin, content_manager, platform_admin
          {
            path: ':id/edit',
            element: (
              <RoleGate
                roles={['faculty', 'coordinator', 'college_admin', 'content_manager', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <AssessmentEditPage />
              </RoleGate>
            ),
          },

          // Coding workspace — all authenticated (student submits, others view)
          { path: ':id/take', element: <AssessmentWorkspacePage /> },

          // MCQ/quiz workspace — all authenticated
          { path: ':id/quiz', element: <MCQWorkspacePage /> },

          // Per-assessment analytics
          {
            path: ':id/analytics',
            element: (
              <RoleGate
                roles={['faculty', 'coordinator', 'college_admin', 'content_manager', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <AssessmentAnalyticsPage />
              </RoleGate>
            ),
          },
        ],
      },

      // ── Submissions ───────────────────────────────────────────────────
      {
        path: 'submissions',
        element: <Outlet />,
        children: [
          // My submissions history — all authenticated
          { index: true, element: <SubmissionsPage /> },

          // Flagged submissions review — faculty, college_admin, platform_admin
          {
            path: 'flagged',
            element: (
              <RoleGate
                roles={['faculty', 'college_admin', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <FlaggedSubmissionsPage />
              </RoleGate>
            ),
          },

          // Submission detail — authenticated (backend enforces ownership/role access)
          { path: ':id', element: <SubmissionDetailPage /> },
        ],
      },

      // ── Content Catalog ───────────────────────────────────────────────
      {
        path: 'content',
        element: <Outlet />,
        children: [
          // ── Read-only catalog pages (all authenticated users) ─────────
          { path: 'rooms', element: <RoomsPage /> },
          { path: 'rooms/:slug', element: <RoomDetailPage /> },
          { path: 'courses', element: <CoursesPage /> },
          { path: 'courses/:slug', element: <CourseDetailPage /> },
          { path: 'problems', element: <ProblemsPage /> },
          { path: 'problems/:slug', element: <ProblemDetailPage /> },
          { path: 'media', element: <MediaLibraryPage /> },

          // ── Authoring routes (content_manager + platform_admin only) ──
          // Wrapped in a pathless layout route so a PermissionGate guards
          // the entire authoring surface without individual page checks.
          {
            element: (
              <RoleGate
                roles={['content_manager', 'platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <Outlet />
              </RoleGate>
            ),
            children: [
              { path: 'rooms/create', element: <RoomCreatePage /> },
              { path: 'rooms/:slug/edit', element: <RoomEditPage /> },
              { path: 'courses/create', element: <CourseCreatePage /> },
              { path: 'problems/create', element: <ProblemCreatePage /> },
            ],
          },
        ],
      },

      // ── Platform admin: Hub ───────────────────────────────────────────
      {
        path: 'platform',
        element: (
          <RoleGate
            roles={['platform_admin', 'platform_moderator']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <PlatformDashboardPage />
          </RoleGate>
        ),
      },
      {
        path: 'platform/audit',
        element: (
          <RoleGate
            roles={['platform_admin', 'platform_moderator']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <AuditLogsPage />
          </RoleGate>
        ),
      },
      {
        path: 'platform/flags',
        element: (
          <RoleGate
            roles={['platform_admin']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <FeatureFlagsPage />
          </RoleGate>
        ),
      },
      {
        path: 'platform/analytics',
        element: (
          <RoleGate
            roles={['platform_admin', 'platform_moderator']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <PlatformAnalyticsPage />
          </RoleGate>
        ),
      },
      {
        path: 'platform/health',
        element: (
          <RoleGate
            roles={['platform_admin']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <SystemHealthPage />
          </RoleGate>
        ),
      },

      // ── Platform admin: Tenant management ────────────────────────────
      {
        path: 'platform/tenants',
        element: (
          <RoleGate
            roles={['platform_admin', 'platform_moderator']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <Outlet />
          </RoleGate>
        ),
        children: [
          { index: true, element: <TenantsListPage /> },
          {
            path: 'new',
            element: (
              <RoleGate
                roles={['platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <TenantCreatePage />
              </RoleGate>
            ),
          },
          { path: ':id', element: <TenantDetailPage /> },
          {
            path: ':id/config',
            element: (
              <RoleGate
                roles={['platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <TenantConfigPage />
              </RoleGate>
            ),
          },
          {
            path: ':id/transition',
            element: (
              <RoleGate
                roles={['platform_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <TenantTransitionPage />
              </RoleGate>
            ),
          },
        ],
      },

      // ── Platform admin: Persons ───────────────────────────────────────
      {
        path: 'platform/persons',
        element: (
          <RoleGate
            roles={['platform_admin']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <Outlet />
          </RoleGate>
        ),
        children: [
          { index: true, element: <PersonsPage /> },
          { path: ':id', element: <PersonDetailPage /> },
        ],
      },

      // ── Billing (college_admin + student self-service) ────────────────
      {
        path: 'billing',
        element: <Outlet />,
        children: [
          { index: true, element: <BillingDashboardPage /> },
          { path: 'plans', element: <PlansPage /> },
          { path: 'subscription/:id', element: <SubscriptionPage /> },
          {
            path: 'invoices',
            element: <Outlet />,
            children: [
              { index: true, element: <InvoicesPage /> },
              { path: ':id', element: <InvoiceDetailPage /> },
            ],
          },
          {
            path: 'payments',
            element: <Outlet />,
            children: [
              { index: true, element: <PaymentsPage /> },
              { path: ':id', element: <PaymentDetailPage /> },
            ],
          },
        ],
      },

      // ── Platform admin: Billing admin ─────────────────────────────────
      {
        path: 'platform/billing',
        element: (
          <RoleGate
            roles={['platform_admin']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <AdminBillingPage />
          </RoleGate>
        ),
      },

      // ── College admin / coordinator: Tenant ops ───────────────────────
      {
        path: 'tenant',
        element: (
          <RoleGate
            roles={['college_admin', 'coordinator']}
            fallback={<Navigate to="/unauthorized" replace />}
          >
            <Outlet />
          </RoleGate>
        ),
        children: [
          {
            path: 'overview',
            element: (
              <RoleGate
                roles={['college_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <TenantOverviewPage />
              </RoleGate>
            ),
          },
          { path: 'cohorts', element: <CohortsPage /> },
          { path: 'invitations', element: <InvitationsPage /> },
          {
            path: 'users',
            element: (
              <RoleGate
                roles={['college_admin']}
                fallback={<Navigate to="/unauthorized" replace />}
              >
                <Outlet />
              </RoleGate>
            ),
            children: [
              { index: true, element: <UsersPage /> },
              { path: ':id', element: <UserDetailPage /> },
            ],
          },
        ],
      },
    ],
  },

  // ── Utility routes ──────────────────────────────────────────────────────
  {
    element: <Outlet />,
    children: [
      { path: '/unauthorized', element: <UnauthorizedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
