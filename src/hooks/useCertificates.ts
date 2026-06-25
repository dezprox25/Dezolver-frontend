import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useEffect, useCallback } from 'react'
import { certificateService } from '@/services/api/certificate.service'
import type { UpdateCertificateDto, RevokeCertificateDto, ManualIssueCertificateDto } from '@/types/certificate.types'
import { QUERY_KEYS } from '@/lib/constants'
import { getSocket } from '@/services/websocket/client'

// ─── My certificates (paginated) ─────────────────────────────────────────────

export function useMyCertificates() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.MY_CERTIFICATES,
    queryFn: ({ pageParam }) =>
      certificateService.listMine({ cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Single certificate ───────────────────────────────────────────────────────

export function useCertificate(certificateId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.MY_CERTIFICATES, certificateId],
    queryFn: () => certificateService.getMine(certificateId!),
    enabled: !!certificateId,
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Public verification (no auth) ───────────────────────────────────────────

export function useVerifyCertificate(certificateId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CERTIFICATE_VERIFY, certificateId],
    queryFn: () => certificateService.verify(certificateId!),
    enabled: !!certificateId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

// ─── Toggle visibility ────────────────────────────────────────────────────────

export function useToggleCertificatePrivacy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      certificateId,
      dto,
    }: {
      certificateId: string
      dto: UpdateCertificateDto
    }) => certificateService.updatePrivacy(certificateId, dto),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.MY_CERTIFICATES, updated.certificateId], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_CERTIFICATES })
    },
  })
}

// ─── Download (side-effect, no cache update needed) ──────────────────────────

export function useDownloadCertificate() {
  return useMutation({
    mutationFn: (certificateId: string) =>
      certificateService.downloadCertificate(certificateId),
  })
}

// ─── Admin: all certificates ──────────────────────────────────────────────────

export function useAllCertificates(params: { status?: string } = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.CERTIFICATES_ADMIN, params],
    queryFn: ({ pageParam }) =>
      certificateService.listAll({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 60 * 1000,
  })
}

// ─── Admin: revoke ────────────────────────────────────────────────────────────

export function useRevokeCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RevokeCertificateDto }) =>
      certificateService.revoke(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CERTIFICATES_ADMIN })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_CERTIFICATES })
    },
  })
}

// ─── Admin: reissue ───────────────────────────────────────────────────────────

export function useReissueCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => certificateService.reissue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CERTIFICATES_ADMIN })
    },
  })
}

// ─── Admin: manual issue ──────────────────────────────────────────────────────

export function useManualIssueCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: ManualIssueCertificateDto) => certificateService.manualIssue(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CERTIFICATES_ADMIN })
    },
  })
}

// ─── WebSocket: certificate issued / failed ───────────────────────────────────
//
// Subscribes to `certificate:issued` and `certificate:issuing` WS events
// and invalidates the certificates query so the list updates live.

interface CertificateIssuedEvent {
  certificateId: string
  downloadUrl?: string
}

export function useCertificateUpdates(
  onIssued?: (event: CertificateIssuedEvent) => void
) {
  const qc = useQueryClient()

  const handleIssued = useCallback(
    (event: CertificateIssuedEvent) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_CERTIFICATES })
      onIssued?.(event)
    },
    [qc, onIssued]
  )

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    socket.on('certificate:issued', handleIssued)
    return () => {
      socket.off('certificate:issued', handleIssued)
    }
  }, [handleIssued])
}
