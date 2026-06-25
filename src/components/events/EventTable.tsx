import { useNavigate } from 'react-router-dom'
import { ChevronRight, Calendar } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { EventStatusBadge } from './EventStatusBadge'
import { EventTypeBadge } from './EventTypeBadge'
import { formatDateTime } from '@/lib/utils/format'
import type { Event } from '@/types/event.types'

interface EventTableProps {
  events: Event[]
}

export function EventTable({ events }: EventTableProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Starts</TableHead>
            <TableHead className="hidden lg:table-cell">Capacity</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow
              key={event.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer hover:bg-muted/30"
              onClick={() => navigate(`/events/${event.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/events/${event.id}`)
                }
              }}
            >
              <TableCell className="font-medium text-sm max-w-[200px]">
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" aria-hidden="true" />
                  <span className="truncate">{event.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <EventTypeBadge kind={event.kind} />
              </TableCell>
              <TableCell>
                <EventStatusBadge status={event.status} />
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                {formatDateTime(event.startsAt)}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                {event.capacity
                  ? `${event.registrationCount ?? 0}/${event.capacity}`
                  : 'Unlimited'}
              </TableCell>
              <TableCell>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" aria-hidden="true" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
