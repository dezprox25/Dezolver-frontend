import { useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CertificateStatusBadge } from './CertificateStatusBadge'
import { CertificateDownloadButton } from './CertificateDownloadButton'
import { formatDate } from '@/lib/utils/format'
import type { Certificate } from '@/types/certificate.types'

interface CertificateCardProps {
  certificate: Certificate
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const navigate = useNavigate()
  const isIssued = certificate.status === 'issued'

  return (
    <Card className="flex flex-col">
      {/* Decorative header band */}
      <div
        className="h-2 rounded-t-lg bg-gradient-to-r from-violet-500 to-indigo-500"
        aria-hidden="true"
      />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <GraduationCap className="h-8 w-8 text-violet-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex items-center gap-1">
            {certificate.isPublic ? (
              <Eye className="h-3.5 w-3.5 text-muted-foreground" aria-label="Public" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" aria-label="Private" />
            )}
            <CertificateStatusBadge status={certificate.status} />
          </div>
        </div>
        <button
          className="text-sm font-semibold text-left leading-snug hover:text-primary transition-colors mt-2"
          onClick={() => navigate(`/me/certificates/${certificate.certificateId}`)}
        >
          {certificate.achievementTitle ?? 'Certificate of Achievement'}
        </button>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="font-mono">{certificate.certificateId}</p>
          {isIssued && certificate.issuedAt && (
            <p>Issued {formatDate(certificate.issuedAt)}</p>
          )}
          {certificate.templateName && (
            <Badge variant="secondary" className="text-[10px]">
              {certificate.templateName}
            </Badge>
          )}
        </div>

        {isIssued && (
          <div className="flex items-center gap-2">
            <CertificateDownloadButton
              certificateId={certificate.certificateId}
              size="sm"
              className="flex-1"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
