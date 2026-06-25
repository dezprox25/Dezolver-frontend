import { BookOpen, RefreshCw } from 'lucide-react'
import { useMySyllabus, useEffectiveSyllabus } from '@/hooks/useCurriculum'
import { buildNodeTree } from '@/types/curriculum.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { SyllabusTree } from '@/components/curriculum/SyllabusTree'
import { SyllabusStatusBadge } from '@/components/curriculum/SyllabusStatusBadge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function EffectiveView({ syllabusId }: { syllabusId: string }) {
  const { data: nodes, isLoading, isError, refetch } = useEffectiveSyllabus(syllabusId)

  if (isLoading) return <Skeleton className="h-48 rounded-lg" />
  if (isError) {
    return (
      <EmptyState
        title="Could not load effective syllabus"
        description="Your cohort overlay may not be configured yet."
        action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
      />
    )
  }

  const tree = buildNodeTree(nodes ?? [])
  return <SyllabusTree nodes={tree} className="rounded-lg border p-2" />
}

export function MySyllabusPage() {
  const { data: assignment, isLoading, isError, refetch } = useMySyllabus()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={<BookOpen className="h-8 w-8 text-muted-foreground/50" />}
        title="No syllabus assigned"
        description="Your coordinator hasn't assigned a syllabus to your account yet."
        action={<Button variant="outline" onClick={() => refetch()}>Check again</Button>}
      />
    )
  }

  if (!assignment) {
    return (
      <EmptyState
        icon={<BookOpen className="h-8 w-8 text-muted-foreground/50" />}
        title="No syllabus assigned"
        description="Contact your coordinator to get a syllabus assigned."
      />
    )
  }

  const syllabus = assignment.syllabus
  const rawTree = buildNodeTree(syllabus.nodes ?? [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Syllabus"
        description="Your curriculum for this academic period."
        actions={
          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">{syllabus.title}</CardTitle>
              {syllabus.description && (
                <p className="text-sm text-muted-foreground mt-1">{syllabus.description}</p>
              )}
            </div>
            <SyllabusStatusBadge status={syllabus.status} />
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="effective">
        <TabsList>
          <TabsTrigger value="effective">My View (with overrides)</TabsTrigger>
          <TabsTrigger value="base">Full Syllabus</TabsTrigger>
        </TabsList>

        <TabsContent value="effective" className="mt-4">
          <EffectiveView syllabusId={syllabus.id} />
        </TabsContent>

        <TabsContent value="base" className="mt-4">
          {rawTree.length > 0 ? (
            <SyllabusTree nodes={rawTree} className="rounded-lg border p-2" />
          ) : (
            <EmptyState title="No content yet" description="This syllabus has no nodes." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
