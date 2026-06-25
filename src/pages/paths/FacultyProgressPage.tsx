import { AlertCircle, RefreshCw } from 'lucide-react'
import { usePaths } from '@/hooks/usePaths'
import { useMyPaths } from '@/hooks/useProgress'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProgressTable } from '@/components/paths/ProgressTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FacultyProgressPage() {
  const { data: allPathsData, isLoading: allLoading, refetch } = usePaths({ kind: 'curated', limit: 50 })
  const { data: myPathsData, isLoading: myLoading } = useMyPaths()

  const allPaths = allPathsData?.pages.flatMap((p) => p.items) ?? []
  const myPaths = myPathsData?.items ?? []

  // Build a progress table from myPaths (what we have accessible)
  const progressRows = myPaths
    .filter((p) => p.myProgress)
    .map((p) => ({
      userId: 'me',
      displayName: 'My Progress',
      path: { title: p.title },
      percentageComplete: p.myProgress?.percentageComplete ?? 0,
      stepsCompleted: p.myProgress?.stepsCompleted ?? 0,
      stepsTotal: p.myProgress?.stepsTotal ?? p.stepCount ?? 0,
      lastActivityAt: p.myProgress?.lastActivityAt,
    }))

  const isLoading = allLoading || myLoading

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Analytics"
        description="Monitor path enrollment and completion across your cohorts."
        actions={
          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {/* Backend limitation notice */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700 space-y-1">
          <p><strong>Backend Limitation:</strong> The paths module is in skeleton state.</p>
          <p>
            Cohort-level progress analytics (enrollment counts, completion rates by cohort)
            require a service layer that has not yet been implemented.
            This page shows path data visible to the current user only.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-lg" />
        </div>
      ) : (
        <>
          {/* Path overview */}
          {allPaths.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{allPaths.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Published Paths</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">
                    {allPaths.reduce((s, p) => s + (p.stepCount ?? 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Steps</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">
                    {myPaths.filter((p) => p.myProgress?.isCompleted).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Completions</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* My progress table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {progressRows.length > 0 ? (
                <ProgressTable rows={progressRows} />
              ) : (
                <EmptyState
                  title="No progress data"
                  description="No active path enrollments found."
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
