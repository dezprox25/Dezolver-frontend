import type { DashboardStats, ActivityItem } from '@/types/dashboard.types'
import type { UserRole } from '@/types/auth.types'
import {
  BookOpen,
  CheckCircle2,
  Trophy,
  GraduationCap,
  Users,
  LayoutDashboard,
  FileText,
  Building2,
} from 'lucide-react'

// ─── Role-aware mock KPI data ─────────────────────────────────────────────────
// Replace each block with a real API call once the endpoint exists.

function buildStats(role: UserRole): DashboardStats {
  const now = new Date().toISOString()

  const maps: Partial<Record<UserRole, DashboardStats>> = {
    student: {
      kpis: [
        { label: 'Paths In Progress', value: 3, icon: BookOpen, changeType: 'positive', change: '+1 this week' },
        { label: 'Problems Solved', value: 142, icon: CheckCircle2, change: '+12', changeType: 'positive' },
        { label: 'Upcoming Events', value: 2, icon: Trophy },
        { label: 'Certificates Earned', value: 5, icon: GraduationCap, changeType: 'positive', change: '+1' },
      ],
      updatedAt: now,
    },
    faculty: {
      kpis: [
        { label: 'Active Assessments', value: 8, icon: FileText },
        { label: 'Pending Reviews', value: 24, icon: CheckCircle2, changeType: 'negative', change: '+6' },
        { label: 'Cohort Students', value: 186, icon: Users },
        { label: 'Events Hosted', value: 3, icon: Trophy },
      ],
      updatedAt: now,
    },
    coordinator: {
      kpis: [
        { label: 'Cohorts Managed', value: 4, icon: Users },
        { label: 'Open Invitations', value: 12, icon: FileText, changeType: 'neutral' },
        { label: 'Active Assessments', value: 11, icon: CheckCircle2 },
        { label: 'Upcoming Events', value: 2, icon: Trophy },
      ],
      updatedAt: now,
    },
    college_admin: {
      kpis: [
        { label: 'Total Students', value: 1240, icon: Users, change: '+32', changeType: 'positive' },
        { label: 'Active Cohorts', value: 14, icon: LayoutDashboard },
        { label: 'Assessments', value: 48, icon: FileText },
        { label: 'Pending Invitations', value: 63, icon: GraduationCap, changeType: 'neutral' },
      ],
      updatedAt: now,
    },
    content_manager: {
      kpis: [
        { label: 'Published Rooms', value: 312, icon: BookOpen, change: '+8', changeType: 'positive' },
        { label: 'Draft Rooms', value: 14, icon: FileText, changeType: 'neutral' },
        { label: 'Active Problems', value: 504, icon: CheckCircle2 },
        { label: 'Published Courses', value: 28, icon: GraduationCap },
      ],
      updatedAt: now,
    },
    platform_moderator: {
      kpis: [
        { label: 'Active Tenants', value: 48, icon: Building2 },
        { label: 'Events This Month', value: 14, icon: Trophy },
        { label: 'Feature Flags', value: 22, icon: LayoutDashboard },
        { label: 'Audit Entries Today', value: 1842, icon: FileText },
      ],
      updatedAt: now,
    },
    platform_admin: {
      kpis: [
        { label: 'Total Tenants', value: 52, icon: Building2, change: '+3', changeType: 'positive' },
        { label: 'Total Users', value: 18_430, icon: Users, change: '+248', changeType: 'positive' },
        { label: 'Active Subscriptions', value: 48, icon: CheckCircle2 },
        { label: 'MRR', value: '₹4.2L', icon: Trophy, change: '+12%', changeType: 'positive' },
      ],
      updatedAt: now,
    },
  }

  return maps[role] ?? maps.student!
}

// ─── Role-aware mock activity feed ───────────────────────────────────────────

function buildActivity(role: UserRole): ActivityItem[] {
  const base = new Date()
  const ago = (minutes: number) =>
    new Date(base.getTime() - minutes * 60_000).toISOString()

  const studentActivity: ActivityItem[] = [
    { id: '1', type: 'submission', title: 'Submitted Two Sum', description: 'Verdict: Accepted', timestamp: ago(5) },
    { id: '2', type: 'completion', title: 'Completed Room: Intro to Graphs', timestamp: ago(45) },
    { id: '3', type: 'enrollment', title: 'Enrolled in DSA Fundamentals path', timestamp: ago(120) },
    { id: '4', type: 'submission', title: 'Submitted Binary Search', description: 'Verdict: Wrong Answer', timestamp: ago(300) },
    { id: '5', type: 'certificate', title: 'Earned certificate: Python Basics', timestamp: ago(2880) },
  ]

  const adminActivity: ActivityItem[] = [
    { id: '1', type: 'invite', title: 'Sent 24 invitations to CSE 2025 cohort', timestamp: ago(10) },
    { id: '2', type: 'system', title: 'Assessment "Mid-Sem DSA" activated', description: '186 students eligible', timestamp: ago(60) },
    { id: '3', type: 'event', title: 'Workshop "Cloud Computing Basics" published', timestamp: ago(180) },
    { id: '4', type: 'enrollment', title: 'Dr. Priya Sharma added to Faculty', timestamp: ago(480) },
    { id: '5', type: 'system', title: 'Syllabus overlay activated for CSE 2025', timestamp: ago(1440) },
  ]

  const platformActivity: ActivityItem[] = [
    { id: '1', type: 'enrollment', title: 'New tenant: SRM University Chennai', description: 'Trial plan activated', timestamp: ago(30) },
    { id: '2', type: 'system', title: 'Feature flag "sso_v1" enabled for VIT Vellore', timestamp: ago(90) },
    { id: '3', type: 'submission', title: 'Subscription upgraded: KL University → Professional', timestamp: ago(240) },
    { id: '4', type: 'system', title: 'Emergency lockdown tested and cleared', timestamp: ago(480) },
    { id: '5', type: 'certificate', title: 'Bulk certificates issued: MEC Hackathon 2026', description: '142 students', timestamp: ago(1440) },
  ]

  if (role === 'platform_admin' || role === 'platform_moderator') return platformActivity
  if (role === 'college_admin' || role === 'coordinator') return adminActivity
  return studentActivity
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const dashboardService = {
  /**
   * Returns role-aware KPI stats.
   * Replace with a real aggregation endpoint when available.
   */
  async getStats(role: UserRole): Promise<DashboardStats> {
    await new Promise((r) => setTimeout(r, 300))
    return buildStats(role)
  },

  /**
   * Returns recent activity items for the current user's role.
   * Replace with GET /me/activity or equivalent when available.
   */
  async getActivity(role: UserRole): Promise<ActivityItem[]> {
    await new Promise((r) => setTimeout(r, 200))
    return buildActivity(role)
  },
}
