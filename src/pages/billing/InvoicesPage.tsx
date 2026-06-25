import { RefreshCw } from 'lucide-react'
import { useInvoices } from '@/hooks/useInvoices'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { InvoiceTable } from '@/components/billing/InvoiceTable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function InvoicesPage() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInvoices()

  const invoices = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Your billing invoices and payment records."
        actions={
          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : isError ? (
        <EmptyState
          title="Failed to load invoices"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : (
        <InvoiceTable invoices={invoices} />
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
