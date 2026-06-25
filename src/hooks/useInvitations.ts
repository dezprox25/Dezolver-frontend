import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantsService } from '@/services/api/tenants.service'
import type { ListInvitationsParams } from '@/services/api/tenants.service'
import type { CreateInvitationDto } from '@/types/tenancy.types'
import { QUERY_KEYS } from '@/lib/constants'

export function useInvitations(
  tenantId: string | undefined,
  params: Omit<ListInvitationsParams, 'cursor'> = {}
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.TENANTS, tenantId, 'invitations', params],
    queryFn: () => tenantsService.listInvitations(tenantId!, params),
    enabled: !!tenantId,
    staleTime: 60 * 1000,
  })
}

export function useCreateInvitation(tenantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateInvitationDto) =>
      tenantsService.createInvitation(tenantId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.TENANTS, tenantId, 'invitations'],
      })
    },
  })
}

export function useRevokeInvitation(tenantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (invId: string) => tenantsService.revokeInvitation(tenantId, invId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.TENANTS, tenantId, 'invitations'],
      })
    },
  })
}
