import { useNavigate } from 'react-router-dom'
import { ChevronRight, GraduationCap } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { CertificateStatusBadge } from './CertificateStatusBadge'
import { formatDate } from '@/lib/utils/format'
import type { Certificate } from '@/types/certificate.types'

interface CertificateTableProps {
  certificates: Certificate[]
  showRecipient?: boolean
  onRevoke?: (cert: Certificate) => void
  onReissue?: (cert: Certificate) => void
}

export function CertificateTable({
  certificates,
  showRecipient = false,
  onRevoke,
  onReissue,
}: CertificateTableProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Certificate ID</TableHead>
            <TableHead>Achievement</TableHead>
            {showRecipient && <TableHead className="hidden sm:table-cell">Recipient</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Issued</TableHead>
            {(onRevoke || onReissue) && <TableHead className="w-24">Actions</TableHead>}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {certificates.map((cert) => (
            <TableRow
              key={cert.id}
              role={!onRevoke && !onReissue ? 'button' : undefined}
              tabIndex={!onRevoke && !onReissue ? 0 : undefined}
              className={!onRevoke && !onReissue ? 'cursor-pointer hover:bg-muted/30' : ''}
              onClick={
                !onRevoke && !onReissue
                  ? () => navigate(`/me/certificates/${cert.certificateId}`)
                  : undefined
              }
              onKeyDown={
                !onRevoke && !onReissue
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/me/certificates/${cert.certificateId}`)
                      }
                    }
                  : undefined
              }
            >
              <TableCell className="font-mono text-xs">{cert.certificateId}</TableCell>
              <TableCell className="text-sm max-w-[200px]">
                <div className="flex items-center gap-2 min-w-0">
                  <GraduationCap className="h-3.5 w-3.5 shrink-0 text-violet-600" aria-hidden="true" />
                  <span className="truncate">
                    {cert.achievementTitle ?? 'Achievement'}
                  </span>
                </div>
              </TableCell>
              {showRecipient && (
                <TableCell className="text-sm hidden sm:table-cell">
                  {cert.recipientName ?? cert.recipientUserId.slice(0, 8) + '…'}
                </TableCell>
              )}
              <TableCell>
                <CertificateStatusBadge status={cert.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                {cert.issuedAt ? formatDate(cert.issuedAt) : '—'}
              </TableCell>
              {(onRevoke || onReissue) && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    {onReissue && cert.status === 'issued' && (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={(e) => { e.stopPropagation(); onReissue(cert) }}
                      >
                        Reissue
                      </button>
                    )}
                    {onRevoke && cert.status !== 'revoked' && (
                      <button
                        className="text-xs text-destructive hover:underline ml-2"
                        onClick={(e) => { e.stopPropagation(); onRevoke(cert) }}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </TableCell>
              )}
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
