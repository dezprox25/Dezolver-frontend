import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Edit2, CheckCircle2, XCircle, Clock, Trophy, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Event } from '@/types/event.types'

interface EventActionMenuProps {
  event: Event
  canManage: boolean
  onPublish?: () => void
  onCancel?: () => void
  onExtend?: () => void
  disabled?: boolean
}

export function EventActionMenu({
  event,
  canManage,
  onPublish,
  onCancel,
  onExtend,
  disabled,
}: EventActionMenuProps) {
  const navigate = useNavigate()

  if (!canManage) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          aria-label="Event actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Edit — only draft events */}
        {event.status === 'draft' && (
          <DropdownMenuItem onClick={() => navigate(`/events/${event.id}/edit`)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}

        {/* Publish — draft events */}
        {event.status === 'draft' && onPublish && (
          <DropdownMenuItem onClick={onPublish}>
            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
            Publish
          </DropdownMenuItem>
        )}

        {/* Manage / View roster */}
        <DropdownMenuItem onClick={() => navigate(`/events/${event.id}/manage`)}>
          <Users className="mr-2 h-4 w-4" />
          Manage Event
        </DropdownMenuItem>

        {/* Extend — live events */}
        {event.status === 'live' && onExtend && (
          <DropdownMenuItem onClick={onExtend}>
            <Clock className="mr-2 h-4 w-4 text-amber-600" />
            Extend Time
          </DropdownMenuItem>
        )}

        {/* View results — completed */}
        {event.status === 'completed' && (
          <DropdownMenuItem onClick={() => navigate(`/events/${event.id}/results`)}>
            <Trophy className="mr-2 h-4 w-4 text-amber-600" />
            View Results
          </DropdownMenuItem>
        )}

        {/* Cancel — cancellable states */}
        {!['completed', 'cancelled', 'grading'].includes(event.status) && onCancel && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onCancel}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Event
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
