import { apiClient } from './client'
import type { ApiSuccess } from '@/types/api.types'
import type { MediaAsset, UploadInitiateResponse, MediaKind } from '@/types/content.types'

export interface InitiateUploadDto {
  kind: MediaKind
  filename: string
  sizeBytes: number
  mimeType: string
}

export const mediaService = {
  /** POST /media/uploads/initiate — returns a presigned S3 PUT URL */
  async initiateUpload(dto: InitiateUploadDto): Promise<UploadInitiateResponse> {
    const res = await apiClient.post<ApiSuccess<UploadInitiateResponse>>(
      '/media/uploads/initiate',
      dto
    )
    return res.data.data
  },

  /**
   * Upload bytes directly to S3 using the presigned URL.
   * Uses XMLHttpRequest so we can track progress.
   */
  uploadToS3(
    uploadUrl: string,
    file: File,
    headers: Record<string, string> = {},
    onProgress?: (pct: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadUrl)

      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v))

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`S3 upload failed: HTTP ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => reject(new Error('S3 upload network error')))
      xhr.addEventListener('abort', () => reject(new Error('S3 upload aborted')))

      xhr.send(file)
    })
  },

  /** POST /media/uploads/complete — notify API that the upload finished */
  async completeUpload(assetId: string): Promise<MediaAsset> {
    const res = await apiClient.post<ApiSuccess<MediaAsset>>('/media/uploads/complete', {
      assetId,
    })
    return res.data.data
  },

  /** GET /media/:assetId/url — get a signed CloudFront URL for the asset */
  async getSignedUrl(assetId: string): Promise<{ url: string; expiresAt: string }> {
    const res = await apiClient.get<ApiSuccess<{ url: string; expiresAt: string }>>(
      `/media/${encodeURIComponent(assetId)}/url`
    )
    return res.data.data
  },

  /**
   * Full upload pipeline: initiate → S3 PUT → complete.
   * Returns the finalized MediaAsset.
   */
  async upload(
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<MediaAsset> {
    const kind = deriveKind(file.type)

    const initRes = await mediaService.initiateUpload({
      kind,
      filename: file.name,
      sizeBytes: file.size,
      mimeType: file.type,
    })

    await mediaService.uploadToS3(
      initRes.uploadUrl,
      file,
      {},
      onProgress
    )

    return mediaService.completeUpload(initRes.assetId)
  },
}

function deriveKind(mimeType: string): MediaKind {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'document'
}
