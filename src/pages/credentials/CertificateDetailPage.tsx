import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, ExternalLink, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useCertificate, useToggleCertificatePrivacy } from '@/hooks/useCertificates'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { CertificateStatusBadge } from '@/components/credentials/CertificateStatusBadge'
import { CertificatePreview } from '@/components/credentials/CertificatePreview'
import { CertificateDownloadButton } from '@/components/credentials/CertificateDownloadButton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { formatDate, formatDateTime } from '@/lib/utils/format'

const VERIFY_BASE = 'https://verify.dezolver.com/c'

export function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: certificate, isLoading, isError } = useCertificate(id)
  const { mutateAsync: togglePrivacy, isPending: toggling } = useToggleCertificatePrivacy()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (isError || !certificate) {
    return (
      <EmptyState
        title="Certificate not found"
        action={
          <Button variant="outline" onClick={() => navigate('/me/certificates')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  const verifyUrl = `${VERIFY_BASE}/${certificate.certificateId}`
  const isIssued = certificate.status === 'issued'

  const handleCopyVerifyUrl = () => {
    navigator.clipboard?.writeText(verifyUrl)
    toast.success('Verification URL copied!')
  }

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader
        title="Certificate Detail"
        description={certificate.achievementTitle ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/me/certificates')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {isIssued && (
              <CertificateDownloadButton
                certificateId={certificate.certificateId}
                size="sm"
              />
            )}
          </div>
        }
      />

      {/* Status */}
      <div className="flex flex-wrap items-center gap-2">
        <CertificateStatusBadge status={certificate.status} />
        {certificate.isPublic ? (
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Eye className="h-3 w-3" /> Public
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs flex items-center gap-1 text-muted-foreground">
            <EyeOff className="h-3 w-3" /> Private
          </Badge>
        )}
      </div>

      {/* Certificate visual */}
      <CertificatePreview certificate={certificate} />

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Certificate ID</dt>
              <dd className="font-mono text-xs">{certificate.certificateId}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Status</dt>
              <dd><CertificateStatusBadge status={certificate.status} /></dd>
            </div>
            {certificate.issuedAt && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Issued</dt>
                <dd>{formatDate(certificate.issuedAt)}</dd>
              </div>
            )}
            {certificate.revokedAt && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Revoked</dt>
                <dd className="text-destructive">{formatDateTime(certificate.revokedAt)}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Verification */}
      {isIssued && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Share this URL to allow anyone to verify the authenticity of this certificate.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-muted px-2 py-1.5 rounded truncate">
                {verifyUrl}
              </code>
              <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopyVerifyUrl} aria-label="Copy verification URL">
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => window.open(verifyUrl, '_blank', 'noopener')}
                aria-label="Open verification page"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Privacy toggle */}
      {isIssued && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="privacy-toggle" className="text-sm font-medium">
              Public visibility
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              When public, anyone with the verification URL can view this certificate.
            </p>
          </div>
          <Switch
            id="privacy-toggle"
            checked={certificate.isPublic}
            disabled={toggling}
            onCheckedChange={async (checked) => {
              try {
                await togglePrivacy({
                  certificateId: certificate.certificateId,
                  dto: { isPublic: checked },
                })
                toast.success(checked ? 'Certificate is now public.' : 'Certificate is now private.')
              } catch {
                toast.error('Failed to update visibility.')
              }
            }}
          />
        </div>
      )}

      {/* Backend limitation notice */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground rounded-md border p-3">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          Certificate PDF generation may return HTML content in the current backend version.
          This is a known backend limitation (Puppeteer worker not fully wired).
        </span>
      </div>
    </div>
  )
}
