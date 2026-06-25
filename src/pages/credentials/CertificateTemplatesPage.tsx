import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, Eye, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCertificateTemplates, usePublishTemplate } from '@/hooks/useCertificateTemplates'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TEMPLATE_STATUS_LABELS } from '@/types/certificate.types'
import { formatRelativeTime } from '@/lib/utils/format'

export function CertificateTemplatesPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useCertificateTemplates()
  const { mutateAsync: publish, isPending: publishing } = usePublishTemplate()

  const templates = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificate Templates"
        description="Manage HTML/CSS templates for certificate generation."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate('/platform/credentials/templates/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded" />)}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load templates"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : templates.length === 0 ? (
        <EmptyState
          title="No templates"
          description="Create your first certificate template."
          action={
            <Button onClick={() => navigate('/platform/credentials/templates/new')}>
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border divide-y">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{t.name}</p>
                  <Badge
                    variant={t.status === 'published' ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {TEMPLATE_STATUS_LABELS[t.status]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                    {t.pageSize} {t.pageOrientation}
                  </Badge>
                </div>
                {t.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.description}</p>
                )}
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Updated {formatRelativeTime(t.updatedAt ?? t.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/platform/credentials/templates/${t.id}/edit`)}
                >
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Button>
                {t.status === 'draft' && (
                  <Button
                    size="sm"
                    disabled={publishing}
                    onClick={async () => {
                      try {
                        await publish(t.id)
                        toast.success('Template published.')
                      } catch {
                        toast.error('Publish failed.')
                      }
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                    Publish
                  </Button>
                )}
              </div>
            </div>
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
