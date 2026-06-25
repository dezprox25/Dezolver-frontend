import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EventStatusBadge } from './EventStatusBadge'
import { EventTypeBadge } from './EventTypeBadge'
import { RegistrationStatusBadge } from './RegistrationStatusBadge'
import { formatDateTime } from '@/lib/utils/format'
import type { Event } from '@/types/event.types'
import { canRegister } from '@/types/event.types'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate()
  const isLive = event.status === 'live'
  const problemCount = event.config?.problems?.length ?? 0

  return (
    <Card
      role="button"
      tabIndex={0}
      className={`cursor-pointer transition-shadow hover:shadow-md ${
        isLive ? 'ring-2 ring-rose-400 ring-offset-2' : ''
      }`}
      onClick={() => navigate(`/events/${event.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/events/${event.id}`)
        }
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
            {event.title}
          </CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            <EventTypeBadge kind={event.kind} />
          </div>
        </div>
        <EventStatusBadge status={event.status} className="w-fit" />
      </CardHeader>
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
        )}

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{formatDateTime(event.startsAt)}</span>
          </div>
          {event.capacity && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>
                {event.registrationCount ?? 0} / {event.capacity} registered
              </span>
            </div>
          )}
          {event.kind === 'competition' && problemCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{problemCount} problem{problemCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {event.myRegistration && (
            <RegistrationStatusBadge status={event.myRegistration.status} />
          )}
          {canRegister(event) && !event.myRegistration && (
            <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-600">
              Open for Registration
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
