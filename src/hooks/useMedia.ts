import { useState, useCallback } from 'react'
import { mediaService } from '@/services/api/media.service'
import type { MediaAsset } from '@/types/content.types'

export type UploadState = 'idle' | 'uploading' | 'success' | 'error'

export interface UseMediaUploadReturn {
  uploadFile: (file: File) => Promise<MediaAsset | null>
  progress: number
  state: UploadState
  asset: MediaAsset | null
  error: string | null
  reset: () => void
}

export function useMediaUpload(): UseMediaUploadReturn {
  const [progress, setProgress] = useState(0)
  const [state, setState] = useState<UploadState>('idle')
  const [asset, setAsset] = useState<MediaAsset | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(async (file: File): Promise<MediaAsset | null> => {
    setState('uploading')
    setProgress(0)
    setError(null)
    setAsset(null)

    try {
      const result = await mediaService.upload(file, (pct) => setProgress(pct))
      setAsset(result)
      setState('success')
      setProgress(100)
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setError(msg)
      setState('error')
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setProgress(0)
    setAsset(null)
    setError(null)
  }, [])

  return { uploadFile, progress, state, asset, error, reset }
}
