import { GraduationCap } from 'lucide-react'
import type { Certificate } from '@/types/certificate.types'
import { formatDate } from '@/lib/utils/format'

interface CertificatePreviewProps {
  certificate: Certificate
}

/**
 * Visual certificate preview card.
 * The actual PDF preview is available via the download endpoint.
 * This is a frontend-rendered representation using the certificate metadata.
 */
export function CertificatePreview({ certificate }: CertificatePreviewProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-8 text-center"
      role="figure"
      aria-label={`Certificate: ${certificate.achievementTitle}`}
    >
      {/* Decorative corners */}
      <div className="absolute top-3 left-3 h-8 w-8 border-l-2 border-t-2 border-violet-400 dark:border-violet-600 rounded-tl-sm" aria-hidden="true" />
      <div className="absolute top-3 right-3 h-8 w-8 border-r-2 border-t-2 border-violet-400 dark:border-violet-600 rounded-tr-sm" aria-hidden="true" />
      <div className="absolute bottom-3 left-3 h-8 w-8 border-l-2 border-b-2 border-violet-400 dark:border-violet-600 rounded-bl-sm" aria-hidden="true" />
      <div className="absolute bottom-3 right-3 h-8 w-8 border-r-2 border-b-2 border-violet-400 dark:border-violet-600 rounded-br-sm" aria-hidden="true" />

      {/* Content */}
      <div className="space-y-4">
        <GraduationCap className="h-12 w-12 text-violet-600 mx-auto" aria-hidden="true" />

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            Certificate of Achievement
          </p>
          <h2 className="text-xl font-bold text-foreground mt-1">
            {certificate.achievementTitle ?? 'Achievement'}
          </h2>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Awarded to</p>
          <p className="text-lg font-semibold text-violet-700 dark:text-violet-300">
            {certificate.recipientName ?? 'Recipient'}
          </p>
        </div>

        {certificate.issuedAt && (
          <p className="text-sm text-muted-foreground">
            Issued on {formatDate(certificate.issuedAt)}
          </p>
        )}

        <p className="text-xs font-mono text-muted-foreground/70">
          {certificate.certificateId}
        </p>
      </div>
    </div>
  )
}
