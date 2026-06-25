import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAllCertificates,
  useRevokeCertificate,
  useReissueCertificate,
} from '@/hooks/useCertificates'
import { usePermissions } from '@/hooks/usePermissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { CertificateTable } from '@/components/credentials/CertificateTable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import type { Certificate } from '@/types/certificate.types'

const revokeSchema = z.object({
  reason: z.string().min(3, 'Reason is required').max(500),
})
type RevokeFormValues = z.infer<typeof revokeSchema>

export function CertificatesAdminPage() {
  const canRevoke = usePermissions('revoke:certificate')

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useAllCertificates()

  const { mutateAsync: revoke, isPending: revoking } = useRevokeCertificate()
  const { mutateAsync: reissue } = useReissueCertificate()

  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null)

  const form = useForm<RevokeFormValues>({
    resolver: zodResolver(revokeSchema),
    defaultValues: { reason: '' },
  })

  const certificates = data?.pages.flatMap((p) => p.items) ?? []

  const onRevoke = async (values: RevokeFormValues) => {
    if (!revokeTarget) return
    try {
      await revoke({ id: revokeTarget.id, dto: { reason: values.reason } })
      toast.success('Certificate revoked.')
      setRevokeTarget(null)
      form.reset()
    } catch {
      toast.error('Revoke failed.')
    }
  }

  const handleReissue = async (cert: Certificate) => {
    try {
      await reissue(cert.id)
      toast.success('Reissue queued.')
    } catch {
      toast.error('Reissue failed.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="View and manage all issued certificates."
        actions={
          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {/* Backend limitations notice */}
      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700 space-y-1">
          <p><strong>Backend Limitations:</strong></p>
          <ul className="list-disc ml-4 space-y-0.5">
            <li>Certificate PDF generation may produce HTML files (Puppeteer not fully wired).</li>
            <li>Reissue does NOT automatically revoke the old certificate — multiple versions may temporarily exist.</li>
            <li>Admin certificate list endpoint may not be documented — shows empty if unavailable.</li>
          </ul>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load certificates"
          description="The admin certificate list endpoint may not be available yet."
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : certificates.length === 0 ? (
        <EmptyState
          title="No certificates"
          description="No certificates have been issued yet."
        />
      ) : (
        <CertificateTable
          certificates={certificates}
          showRecipient
          onRevoke={canRevoke ? (cert) => { setRevokeTarget(cert); form.reset() } : undefined}
          onReissue={canRevoke ? handleReissue : undefined}
        />
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}

      {/* Revoke dialog */}
      <Dialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke Certificate</DialogTitle>
            <DialogDescription>
              This will revoke{' '}
              <code className="font-mono text-xs">{revokeTarget?.certificateId}</code>.
              Verification will show "issued in error".
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onRevoke)} className="space-y-4">
              <FormField control={form.control} name="reason" render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Reason for revocation (internal, not shown publicly)…"
                      disabled={revoking}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRevokeTarget(null)} disabled={revoking}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={revoking}>
                  {revoking ? 'Revoking…' : 'Revoke Certificate'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
