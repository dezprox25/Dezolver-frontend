import { useNavigate } from 'react-router-dom'
import { GraduationCap, RefreshCw } from 'lucide-react'
import { useMyCertificates, useCertificateUpdates } from '@/hooks/useCertificates'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { CertificateCard } from '@/components/credentials/CertificateCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function MyCertificatesPage() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useMyCertificates()

  // WS: invalidate list when a new certificate is issued
  useCertificateUpdates((event) => {
    toast.success(`Certificate ${event.certificateId} is ready!`, {
      action: {
        label: 'View',
        onClick: () => navigate(`/me/certificates/${event.certificateId}`),
      },
    })
  })

  const navigate = useNavigate()

  const certificates = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Certificates"
        description="Your earned certificates and credentials."
        actions={
          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load certificates"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-8 w-8 text-muted-foreground/50" />}
          title="No certificates yet"
          description="Complete a learning path, assessment, or event to earn your first certificate."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
