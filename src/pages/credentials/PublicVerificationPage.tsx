/**
 * Public Certificate Verification Page
 *
 * Route: /verify/c/:certificateId
 * Authentication: NOT required — this route is public.
 * CloudFront edge caches this page for 5 minutes.
 *
 * Privacy rules (enforced by backend):
 * - Valid + public: shows recipient name, achievement, issue date
 * - Valid + private: shows status=private only (no PII)
 * - Revoked: shows "issued in error" (no reason detail)
 * - Not found: 404 from backend → UI shows not-found state
 */
import { useParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Lock, HelpCircle, GraduationCap, ExternalLink } from 'lucide-react'
import { useVerifyCertificate } from '@/hooks/useCertificates'
import { VerificationStatusBadge } from '@/components/credentials/VerificationStatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/format'

export function PublicVerificationPage() {
  const { id } = useParams<{ id: string }>()

  const { data: result, isLoading, isError } = useVerifyCertificate(id)

  if (isLoading) {
    return (
      <VerifyLayout>
        <Skeleton className="h-16 w-64 mx-auto" />
        <Skeleton className="h-32 w-full max-w-md mx-auto" />
      </VerifyLayout>
    )
  }

  if (isError || !result) {
    return (
      <VerifyLayout>
        <div className="text-center space-y-4">
          <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto" aria-hidden="true" />
          <h1 className="text-xl font-bold">Certificate Not Found</h1>
          <p className="text-sm text-muted-foreground">
            No certificate with ID <code className="font-mono">{id?.toUpperCase()}</code> was found.
          </p>
        </div>
      </VerifyLayout>
    )
  }

  return (
    <VerifyLayout>
      <div className="text-center space-y-2">
        <h1 className="text-lg font-semibold text-muted-foreground">Certificate Verification</h1>
        <p className="font-mono text-xs text-muted-foreground">{result.certificateId}</p>
      </div>

      {/* Status card */}
      {result.status === 'valid' && (
        <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-8 text-center max-w-md mx-auto space-y-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" aria-hidden="true" />
          <VerificationStatusBadge status="valid" className="text-base px-3 py-1" />
          <div className="space-y-1">
            <p className="text-2xl font-bold">{result.achievementTitle}</p>
            <p className="text-sm text-muted-foreground">Awarded to</p>
            <p className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
              {result.recipientName}
            </p>
          </div>
          {result.issuedOn && (
            <p className="text-sm text-muted-foreground">
              Issued on{' '}
              <strong>{formatDate(result.issuedOn)}</strong>
            </p>
          )}
          {result.issuingEntity && (
            <Badge variant="secondary" className="text-xs">
              {result.issuingEntity}
            </Badge>
          )}
        </div>
      )}

      {result.status === 'revoked' && (
        <div className="rounded-xl border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center max-w-md mx-auto space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" aria-hidden="true" />
          <VerificationStatusBadge status="revoked" className="text-base px-3 py-1" />
          <p className="text-sm text-muted-foreground">
            This certificate has been revoked.
          </p>
          {result.revokedOn && (
            <p className="text-xs text-muted-foreground">
              Revoked on {formatDate(result.revokedOn)}
            </p>
          )}
        </div>
      )}

      {result.status === 'private' && (
        <div className="rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-8 text-center max-w-md mx-auto space-y-4">
          <Lock className="h-12 w-12 text-slate-500 mx-auto" aria-hidden="true" />
          <VerificationStatusBadge status="private" className="text-base px-3 py-1" />
          <p className="text-sm text-muted-foreground">
            This certificate has been marked private by the recipient.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('https://dezolver.com', '_blank', 'noopener')}
        >
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
          Dezolver Platform
        </Button>
      </div>
    </VerifyLayout>
  )
}

function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold">Dezolver</span>
        </div>
        {children}
      </div>
    </div>
  )
}
