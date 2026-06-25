import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { certificateTemplateService } from '@/services/api/certificate-template.service'
import type { CreateTemplateDto, UpdateTemplateDto, PreviewTemplateDto } from '@/types/certificate.types'
import { QUERY_KEYS } from '@/lib/constants'

export function useCertificateTemplates() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.CERT_TEMPLATES,
    queryFn: ({ pageParam }) =>
      certificateTemplateService.list({ cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCertificateTemplate(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CERT_TEMPLATES, id],
    queryFn: () => certificateTemplateService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCertificateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateTemplateDto) => certificateTemplateService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.CERT_TEMPLATES }),
  })
}

export function useUpdateCertificateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTemplateDto }) =>
      certificateTemplateService.update(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.CERT_TEMPLATES, updated.id], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CERT_TEMPLATES })
    },
  })
}

export function usePreviewTemplate() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PreviewTemplateDto }) =>
      certificateTemplateService.preview(id, dto),
  })
}

export function usePublishTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => certificateTemplateService.publish(id),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.CERT_TEMPLATES, updated.id], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CERT_TEMPLATES })
    },
  })
}
