import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, GripVertical, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCourse, useRemoveRoomFromCourse } from '@/hooks/useCourses'
import { usePermissions } from '@/hooks/usePermissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { ContentStatusBadge } from '@/components/content/ContentStatusBadge'
import { DifficultyBadge } from '@/components/content/DifficultyBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const canAuthor = usePermissions('publish:content')

  const { data: course, isLoading, isError } = useCourse(slug)
  const { mutateAsync: removeRoom, isPending: removing } = useRemoveRoomFromCourse()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Course not found.{' '}
        <button className="underline" onClick={() => navigate('/content/courses')}>Back</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={course.title}
        description={course.summary ?? undefined}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/content/courses')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Meta strip */}
      <div className="flex flex-wrap items-center gap-2">
        <ContentStatusBadge status={course.status} />
        <DifficultyBadge difficulty={course.difficulty} />
        <Badge variant="secondary" className="gap-1 text-xs">
          <BookOpen className="h-3 w-3" />
          {course.rooms.length} rooms
        </Badge>
        {course.estimatedMinutes && (
          <Badge variant="secondary" className="gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {course.estimatedMinutes} min total
          </Badge>
        )}
      </div>

      {/* Room list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {course.rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rooms in this course yet.</p>
          ) : (
            <div className="divide-y rounded-lg border">
              {course.rooms
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((room, idx) => (
                  <div
                    key={room.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <span className="w-6 text-xs text-muted-foreground tabular-nums">{idx + 1}</span>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/content/rooms/${room.slug}`)}
                    >
                      <p className="text-sm font-medium hover:underline">{room.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <DifficultyBadge difficulty={room.difficulty} />
                        {room.estimatedMinutes && (
                          <span className="text-xs text-muted-foreground">{room.estimatedMinutes}m</span>
                        )}
                      </div>
                    </div>
                    {canAuthor && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        disabled={removing}
                        onClick={() => {
                          removeRoom({ courseId: course.id, roomId: room.id })
                            .then(() => toast.success('Room removed from course.'))
                            .catch(() => toast.error('Failed to remove room.'))
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />
      <p className="text-xs text-muted-foreground">ID: <span className="font-mono">{course.id}</span></p>
    </div>
  )
}
