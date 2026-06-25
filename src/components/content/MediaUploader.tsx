import { useRef, useState } from 'react'
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils/cn'
import { useMediaUpload } from '@/hooks/useMedia'
import type { MediaAsset } from '@/types/content.types'

const ACCEPTED_MIME = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'application/pdf',
].join(',')

const MAX_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB

interface MediaUploaderProps {
  onUploaded?: (asset: MediaAsset) => void
  className?: string
  compact?: boolean
}

export function MediaUploader({ onUploaded, className, compact = false }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { uploadFile, progress, state, asset, error, reset } = useMediaUpload()

  const handleFile = async (file: File) => {
    setValidationError(null)
    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(`File too large (max ${MAX_SIZE_BYTES / 1024 / 1024} MB)`)
      return
    }
    const result = await uploadFile(file)
    if (result) onUploaded?.(result)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  if (state === 'success' && asset) {
    return (
      <div className={cn('rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950/30', className)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{asset.filename}</p>
              <p className="text-xs text-muted-foreground font-mono">{asset.id}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={reset}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME}
        className="sr-only"
        onChange={handleChange}
      />

      {state === 'uploading' ? (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading to S3… {progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      ) : (
        <div
          className={cn(
            'rounded-lg border-2 border-dashed transition-colors cursor-pointer',
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30',
            compact ? 'p-4' : 'p-8'
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <UploadCloud className={cn('text-muted-foreground/50', compact ? 'h-6 w-6' : 'h-10 w-10')} />
            {!compact && (
              <>
                <p className="text-sm font-medium">Drop file here or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  Images, videos, audio, PDF — up to 500 MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {(error || validationError) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{validationError ?? error}</span>
        </div>
      )}
    </div>
  )
}
