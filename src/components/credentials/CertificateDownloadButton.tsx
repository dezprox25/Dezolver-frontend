import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDownloadCertificate } from '@/hooks/useCertificates'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface CertificateDownloadButtonProps {
  certificateId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
  className?: string
}

/**
 * Downloads the certificate PDF by calling GET /me/certificates/:id/download.
 * NOTE: Backend may currently return HTML instead of PDF (audit finding — Chromium
 * worker not fully wired). The downloaded file will be named .pdf regardless.
 */
export function CertificateDownloadButton({
  certificateId,
  variant = 'outline',
  size = 'sm',
  className,
}: CertificateDownloadButtonProps) {
  const { mutateAsync: download, isPending } = useDownloadCertificate()

  const handleDownload = async () => {
    try {
      await download(certificateId)
    } catch {
      toast.error('Download failed. Please try again.')
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleDownload}
      disabled={isPending}
      aria-label={`Download certificate ${certificateId}`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download
        </>
      )}
    </Button>
  )
}
