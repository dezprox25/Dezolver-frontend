import { RegistrationStatusBadge } from './RegistrationStatusBadge'
import { formatDateTime } from '@/lib/utils/format'
import type { EventParticipant } from '@/services/api/registration.service'
import type { RegistrationStatus } from '@/types/event.types'

interface ParticipantTableProps {
  participants: EventParticipant[]
}

export function ParticipantTable({ participants }: ParticipantTableProps) {
  if (participants.length === 0) {
    return (
      <p className="text-center py-8 text-sm text-muted-foreground">No registrations yet.</p>
    )
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Email</th>
            <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Registered At</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {participants.map((p) => (
            <tr key={p.userId} className="hover:bg-muted/30">
              <td className="px-4 py-2.5 text-sm font-medium">
                {p.displayName ?? 'Unknown'}
              </td>
              <td className="px-4 py-2.5 text-sm text-muted-foreground hidden sm:table-cell">
                {p.email ?? '—'}
              </td>
              <td className="px-4 py-2.5 text-center">
                <RegistrationStatusBadge status={(p.status ?? 'registered') as RegistrationStatus} />
              </td>
              <td className="px-4 py-2.5 text-sm text-muted-foreground hidden md:table-cell whitespace-nowrap">
                {p.registeredAt ? formatDateTime(p.registeredAt) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
