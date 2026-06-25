import { useNavigate } from 'react-router-dom'
import { RefreshCw, BookOpen, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useMyPaths, useProgressUpdates } from '@/hooks/useProgress'
import { useMyCertificates } from '@/hooks/useCertificates'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { EnrollmentCard } from '@/components/paths/EnrollmentCard'
import { AchievementCard } from '@/components/paths/AchievementCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function MyProgressPage() {
  const navigate = useNavigate()
  const { data: pathsData, isLoading: pathsLoading, isError: pathsError, refetch: refetchPaths } =
    useMyPaths()
  const { data: certsData } = useMyCertificates()

  // WS progress events
  useProgressUpdates((event) => {
    toast.success('🎉 Path completed!', {
      action: { label: 'View', onClick: () => navigate(`/paths/${event.pathId}`) },
    })
    refetchPaths()
  })

  const paths = pathsData?.items ?? []
  const certs = certsData?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Progress"
        description="Track your learning journey across all active paths."
        actions={
          <Button variant="ghost" size="icon" onClick={() => refetchPaths()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      <Tabs defaultValue="paths">
        <TabsList>
          <TabsTrigger value="paths">Active Paths ({paths.length})</TabsTrigger>
          <TabsTrigger value="achievements">Achievements ({certs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="mt-4 space-y-4">
          {pathsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
            </div>
          ) : pathsError ? (
            <EmptyState
              title="Failed to load paths"
              action={<Button variant="outline" onClick={() => refetchPaths()}>Retry</Button>}
            />
          ) : paths.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-8 w-8 text-muted-foreground/50" />}
              title="No active paths"
              description="Browse paths and start learning."
              action={
                <Button onClick={() => navigate('/paths')}>
                  Browse Paths
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paths.map((p) => <EnrollmentCard key={p.id} path={p} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="mt-4 space-y-3">
          {certs.length === 0 ? (
            <EmptyState
              title="No achievements yet"
              description="Complete paths, assessments, and events to earn certificates."
            />
          ) : (
            certs.map((cert) => (
              <AchievementCard
                key={cert.id}
                type="certificate"
                title={cert.achievementTitle ?? 'Certificate of Achievement'}
                subtitle={`Certificate ID: ${cert.certificateId}`}
                earnedAt={cert.issuedAt ?? undefined}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Backend notice */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        Progress data is computed asynchronously. Updates may take a few seconds to reflect.
      </div>
    </div>
  )
}
