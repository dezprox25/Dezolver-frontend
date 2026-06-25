export interface ApiSuccess<T> {
  data: T
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  nextCursor: string | null
  hasMore: boolean
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
    requestId?: string
    documentation?: string
  }
}

export interface AsyncJobResponse {
  jobId: string
  kind: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  pollUrl: string
  subscribeChannel: string
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  container: string
  version: string
  gitSha: string
}
