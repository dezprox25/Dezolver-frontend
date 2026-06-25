import { useState } from 'react'
import { Flag, AlertCircle, RefreshCw, Search } from 'lucide-react'
import { useFeatureFlags, useUpdateFeatureFlags } from '@/hooks/usePlatform'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { FeatureFlag, FeatureFlagMap } from '@/types/platform.types'

// ─── Flag row ─────────────────────────────────────────────────────────────────

interface FlagRowProps {
  flag: FeatureFlag
  pending: boolean
  onChange: (key: string, enabled: boolean) => void
}

function FlagRow({ flag, pending, onChange }: FlagRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium font-mono">{flag.key}</p>
          <Badge
            variant="outline"
            className={`text-[10px] ${
              flag.scope === 'global'
                ? 'border-blue-400 text-blue-700'
                : 'border-purple-400 text-purple-700'
            }`}
          >
            {flag.scope}
          </Badge>
          {flag.enabled && (
            <Badge
              variant="outline"
              className="text-[10px] border-emerald-400 text-emerald-700"
            >
              enabled
            </Badge>
          )}
        </div>
        {flag.name && flag.name !== flag.key && (
          <p className="text-sm text-muted-foreground mt-0.5">{flag.name}</p>
        )}
        {flag.description && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">{flag.description}</p>
        )}
      </div>
      <Switch
        checked={flag.enabled}
        disabled={pending}
        onCheckedChange={(checked) => onChange(flag.key, checked)}
        aria-label={`Toggle ${flag.key}`}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FeatureFlagsPage() {
  const [search, setSearch] = useState('')
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set())

  const { data: flags = [], isLoading, isError, refetch } = useFeatureFlags()
  const { mutateAsync: updateFlags } = useUpdateFeatureFlags()

  const filtered = search
    ? flags.filter(
        (f) =>
          f.key.toLowerCase().includes(search.toLowerCase()) ||
          (f.name && f.name.toLowerCase().includes(search.toLowerCase())) ||
          (f.description && f.description.toLowerCase().includes(search.toLowerCase()))
      )
    : flags

  const globalFlags = filtered.filter((f) => f.scope === 'global')
  const tenantFlags = filtered.filter((f) => f.scope === 'tenant')

  async function handleToggle(key: string, enabled: boolean) {
    setPendingKeys((prev) => new Set(prev).add(key))
    try {
      const patch: FeatureFlagMap = { [key]: enabled }
      await updateFlags(patch)
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Flags"
        description="Enable or disable platform-wide features. Changes take effect immediately."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {/* Backend capability notice */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Tenant-specific feature overrides require per-tenant API support (not yet available).
          Global flags apply platform-wide. Toggle changes are applied via PUT
          /api/v1/platform/feature-flags.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search flags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : isError ? (
        <EmptyState
          title="Failed to load feature flags"
          description="Could not reach the platform flags API."
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
          icon={<Flag className="h-8 w-8 text-muted-foreground/30" />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No flags found"
          description={search ? 'Try a different search term.' : 'No feature flags configured.'}
          icon={<Flag className="h-8 w-8 text-muted-foreground/30" />}
        />
      ) : (
        <div className="space-y-6">
          {/* Global flags */}
          {globalFlags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Global Flags</CardTitle>
                <CardDescription>
                  Apply platform-wide to all tenants ({globalFlags.filter((f) => f.enabled).length}/
                  {globalFlags.length} enabled)
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y">
                {globalFlags.map((flag) => (
                  <FlagRow
                    key={flag.key}
                    flag={flag}
                    pending={pendingKeys.has(flag.key)}
                    onChange={handleToggle}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tenant-scoped flags */}
          {tenantFlags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tenant Flags</CardTitle>
                <CardDescription>
                  Scoped to specific tenants ({tenantFlags.filter((f) => f.enabled).length}/
                  {tenantFlags.length} enabled)
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y">
                {tenantFlags.map((flag) => (
                  <FlagRow
                    key={flag.key}
                    flag={flag}
                    pending={pendingKeys.has(flag.key)}
                    onChange={handleToggle}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <div className="flex items-center gap-4 rounded-lg border px-4 py-3 bg-muted/30">
            <Flag className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {flags.filter((f) => f.enabled).length} of {flags.length} flags enabled
            </p>
            <Separator orientation="vertical" className="h-4" />
            <p className="text-sm text-muted-foreground">
              {globalFlags.length} global · {tenantFlags.length} tenant-scoped
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
