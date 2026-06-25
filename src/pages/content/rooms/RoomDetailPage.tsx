import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit2, GitBranch, Archive, CheckCircle2, Clock,
  Tag, Globe, RotateCcw, History, MoreHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRoom, useRoomVersions, useRoomLifecycle } from '@/hooks/useRooms'
import { usePermissions } from '@/hooks/usePermissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { ContentStatusBadge } from '@/components/content/ContentStatusBadge'
import { DifficultyBadge } from '@/components/content/DifficultyBadge'
import { RoomBody } from '@/components/content/BlockRenderer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format'
import { DOMAIN_CODE_LABELS } from '@/types/content.types'

export function RoomDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const canAuthor = usePermissions('publish:content')
  const canReview = usePermissions('review:content')

  const { data: room, isLoading, isError } = useRoom(slug)
  const { data: versions = [] } = useRoomVersions(slug)
  const { submitForReview, approve, archive, rollback } = useRoomLifecycle()

  const [actionLoading, setActionLoading] = useState(false)

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    setActionLoading(true)
    try {
      await fn()
      toast.success(successMsg)
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      toast.error(msg ?? 'Action failed.')
    } finally {
      setActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !room) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Room not found.{' '}
        <button className="underline" onClick={() => navigate('/content/rooms')}>
          Back to rooms
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={room.title}
        description={room.summary ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/content/rooms')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {canAuthor && room.status === 'draft' && (
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() => navigate(`/content/rooms/${room.slug}/edit`)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}

            {/* Lifecycle actions */}
            {(canAuthor || canReview) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={actionLoading}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {room.status === 'draft' && canAuthor && (
                    <DropdownMenuItem
                      onClick={() =>
                        runAction(
                          () => submitForReview.mutateAsync({ id: room.id, slug: room.slug }),
                          'Submitted for review.'
                        )
                      }
                    >
                      <GitBranch className="mr-2 h-4 w-4" />
                      Submit for Review
                    </DropdownMenuItem>
                  )}
                  {room.status === 'review' && canReview && (
                    <DropdownMenuItem
                      onClick={() =>
                        runAction(
                          () => approve.mutateAsync({ id: room.id, slug: room.slug }),
                          'Room published.'
                        )
                      }
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                      Approve & Publish
                    </DropdownMenuItem>
                  )}
                  {room.status === 'published' && canAuthor && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() =>
                          runAction(
                            () => archive.mutateAsync({ id: room.id, slug: room.slug }),
                            'Room archived.'
                          )
                        }
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          {canAuthor && (
            <TabsTrigger value="versions">
              Versions
              {versions.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0 h-4">
                  {versions.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Content */}
        <TabsContent value="content" className="mt-6">
          <div className="prose prose-sm max-w-none">
            <RoomBody blocks={room.body ?? []} />
          </div>
        </TabsContent>

        {/* Details */}
        <TabsContent value="details" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground mb-1">Status</dt>
                  <dd><ContentStatusBadge status={room.status} /></dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground mb-1">Difficulty</dt>
                  <dd><DifficultyBadge difficulty={room.difficulty} /></dd>
                </div>
                {room.estimatedMinutes && (
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Duration
                    </dt>
                    <dd>{room.estimatedMinutes} min</dd>
                  </div>
                )}
                {room.publishedAt && (
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1">Published</dt>
                    <dd>{formatDateTime(room.publishedAt)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground mb-1">Created</dt>
                  <dd>{formatRelativeTime(room.createdAt)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground mb-1">Room ID</dt>
                  <dd className="font-mono text-xs text-muted-foreground">{room.id}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {room.domainCodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" /> Domains
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {room.domainCodes.map((code) => (
                  <Badge key={code} variant="secondary">
                    {DOMAIN_CODE_LABELS[code] ?? code.toUpperCase()}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {room.skillTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" /> Skill Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {room.skillTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Versions (admin) */}
        {canAuthor && (
          <TabsContent value="versions" className="mt-4">
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No versions yet.</p>
            ) : (
              <div className="rounded-lg border divide-y">
                {versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="flex items-center gap-3">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Version {v.versionNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.publishedAt ? formatDateTime(v.publishedAt) : formatRelativeTime(v.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs capitalize"
                      >
                        {v.status.replace('_', ' ')}
                      </Badge>
                      {v.status === 'published' && room.currentVersion?.id !== v.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={actionLoading}
                          onClick={() =>
                            runAction(
                              () => rollback.mutateAsync({ id: room.id, slug: room.slug, versionId: v.id }),
                              `Rolled back to v${v.versionNumber}`
                            )
                          }
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          Rollback
                        </Button>
                      )}
                      {room.currentVersion?.id === v.id && (
                        <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <Separator />
      <p className="text-xs text-muted-foreground">Slug: <span className="font-mono">{room.slug}</span></p>
    </div>
  )
}
