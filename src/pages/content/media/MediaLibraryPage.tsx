import { useState } from 'react'
import { Copy, ExternalLink, Film, FileText, Music, Image, Upload, Search } from 'lucide-react'
import { toast } from 'sonner'
import { mediaService } from '@/services/api/media.service'
import { usePermissions } from '@/hooks/usePermissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { MediaUploader } from '@/components/content/MediaUploader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { MediaAsset, MediaKind } from '@/types/content.types'
import { formatDate } from '@/lib/utils/format'

// ─── Kind icon ────────────────────────────────────────────────────────────────

function KindIcon({ kind }: { kind: MediaKind }) {
  switch (kind) {
    case 'image': return <Image className="h-4 w-4" />
    case 'video': return <Film className="h-4 w-4" />
    case 'audio': return <Music className="h-4 w-4" />
    default: return <FileText className="h-4 w-4" />
  }
}

function formatBytes(bytes?: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// ─── Asset card ───────────────────────────────────────────────────────────────

function AssetCard({ asset, onSelect }: { asset: MediaAsset; onSelect: () => void }) {
  const copyId = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(asset.id)
    toast.success('Asset ID copied.')
  }

  return (
    <div
      className="group flex flex-col gap-2 rounded-lg border bg-card p-3 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
      onClick={onSelect}
    >
      {/* Preview area */}
      <div className="aspect-video rounded-md bg-muted/40 flex items-center justify-center overflow-hidden">
        {asset.kind === 'image' && asset.cdnUrl ? (
          <img
            src={asset.cdnUrl}
            alt={asset.filename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <KindIcon kind={asset.kind} />
        )}
      </div>

      {/* Meta */}
      <div className="space-y-1">
        <p className="text-xs font-medium truncate" title={asset.filename}>
          {asset.filename}
        </p>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 capitalize">
            {asset.kind}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{formatBytes(asset.sizeBytes)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={copyId}
          title="Copy asset ID"
        >
          <Copy className="h-3 w-3" />
        </Button>
        {asset.cdnUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); window.open(asset.cdnUrl!, '_blank') }}
            title="Open in new tab"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Asset detail sheet ───────────────────────────────────────────────────────

function AssetSheet({
  asset,
  onClose,
}: {
  asset: MediaAsset | null
  onClose: () => void
}) {
  const [loadingUrl, setLoadingUrl] = useState(false)

  const copyId = () => {
    if (!asset) return
    navigator.clipboard.writeText(asset.id)
    toast.success('Asset ID copied.')
  }

  const fetchSignedUrl = async () => {
    if (!asset) return
    setLoadingUrl(true)
    try {
      const { url } = await mediaService.getSignedUrl(asset.id)
      window.open(url, '_blank')
    } catch {
      toast.error('Failed to get signed URL.')
    } finally {
      setLoadingUrl(false)
    }
  }

  return (
    <Sheet open={!!asset} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base truncate">{asset?.filename}</SheetTitle>
        </SheetHeader>

        {asset && (
          <div className="mt-4 space-y-4">
            {/* Preview */}
            <div className="aspect-video rounded-lg bg-muted/40 flex items-center justify-center overflow-hidden">
              {asset.kind === 'image' && asset.cdnUrl ? (
                <img src={asset.cdnUrl} alt={asset.filename} className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <KindIcon kind={asset.kind} />
                  <p className="text-xs">{asset.mimeType}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Details */}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Kind</dt>
                <dd className="capitalize">{asset.kind}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Size</dt>
                <dd>{formatBytes(asset.sizeBytes)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="capitalize">{asset.status}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Uploaded</dt>
                <dd>{formatDate(asset.createdAt)}</dd>
              </div>
              {asset.width && asset.height && (
                <div>
                  <dt className="text-xs text-muted-foreground">Dimensions</dt>
                  <dd>{asset.width}×{asset.height}</dd>
                </div>
              )}
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground mb-1">Asset ID</dt>
                <dd className="font-mono text-xs text-muted-foreground break-all">{asset.id}</dd>
              </div>
            </dl>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyId} className="flex-1">
                <Copy className="mr-2 h-3.5 w-3.5" /> Copy ID
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loadingUrl}
                onClick={fetchSignedUrl}
                className="flex-1"
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                {loadingUrl ? 'Loading…' : 'Open URL'}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ─── Upload panel ─────────────────────────────────────────────────────────────

function UploadPanel({ onUploaded }: { onUploaded: (asset: MediaAsset) => void }) {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div>
      <Button variant="outline" size="sm" onClick={() => setShowUpload((v) => !v)}>
        <Upload className="mr-2 h-4 w-4" />
        {showUpload ? 'Hide Uploader' : 'Upload File'}
      </Button>
      {showUpload && (
        <div className="mt-4">
          <MediaUploader
            onUploaded={(asset) => {
              onUploaded(asset)
              toast.success(`Uploaded: ${asset.filename}`)
              setShowUpload(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function MediaLibraryPage() {
  const canUpload = usePermissions('upload:media')
  const [search, setSearch] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const [recentUploads, setRecentUploads] = useState<MediaAsset[]>([])

  // Note: The backend doesn't expose GET /media (list) — only initiate/complete/url endpoints.
  // Media assets are discovered via asset IDs embedded in content blocks.
  // Recent uploads are tracked client-side in this session.

  const handleUploaded = (asset: MediaAsset) => {
    setRecentUploads((prev) => [asset, ...prev])
  }

  const filtered = recentUploads.filter((a) =>
    !search || a.filename.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Upload and manage media assets for content blocks."
        actions={canUpload ? <UploadPanel onUploaded={handleUploaded} /> : undefined}
      />

      {/* Search */}
      {recentUploads.length > 0 && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Filter by filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Recent uploads grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <Film className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">No media assets yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            {canUpload
              ? 'Upload a file using the button above.'
              : 'Media assets will appear here once uploaded.'}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-3 max-w-xs mx-auto">
            Note: The backend does not expose a media list endpoint. Assets uploaded in this session are shown here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onSelect={() => setSelectedAsset(asset)}
            />
          ))}
        </div>
      )}

      <AssetSheet asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </div>
  )
}
