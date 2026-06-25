import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { certificateRuleService } from '@/services/api/certificate-rule.service'
import type { CreateIssuanceRuleDto } from '@/types/certificate.types'
import { QUERY_KEYS } from '@/lib/constants'

export function useIssuanceRules() {
  return useQuery({
    queryKey: QUERY_KEYS.ISSUANCE_RULES,
    queryFn: () => certificateRuleService.list({ limit: 100 }),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateIssuanceRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateIssuanceRuleDto) => certificateRuleService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ISSUANCE_RULES }),
  })
}

export function useDeactivateIssuanceRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => certificateRuleService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ISSUANCE_RULES }),
  })
}
