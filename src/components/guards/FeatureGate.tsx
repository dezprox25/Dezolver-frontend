import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { PLAN_FEATURES } from '@/lib/constants'

interface FeatureGateProps {
  /** Feature key, e.g. 'events', 'sso', 'analytics' */
  feature: string
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Renders children only when the authenticated user's subscription plan
 * includes the requested feature.
 *
 * Falls back to PLAN_FEATURES defaults when no subscription data is loaded yet.
 * platform_admin always sees all features.
 */
export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const user = useAuthStore((s) => s.user)
  const subscription = useAuthStore((s) => s.subscription)

  // Platform admins bypass all feature gates
  if (user?.primaryRole === 'platform_admin') return <>{children}</>

  // Determine plan code: subscription planCode or 'direct' for Direct-Tenant users
  const planCode =
    subscription?.planCode ??
    (user?.tenantKind === 'direct' ? 'direct' : 'starter')

  const planMap = PLAN_FEATURES[planCode] ?? PLAN_FEATURES['starter']
  const enabled = planMap[feature] ?? false

  return enabled ? <>{children}</> : <>{fallback}</>
}
