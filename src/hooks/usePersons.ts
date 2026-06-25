import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { personsService } from '@/services/api/persons.service'
import { QUERY_KEYS } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'

export function usePerson(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PERSONS, id],
    queryFn: () => personsService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useImpersonate() {
  const queryClient = useQueryClient()
  const { user, setAccessToken, setImpersonating } = useAuthStore()

  return useMutation({
    mutationFn: ({
      userId,
      dto,
    }: {
      userId: string
      dto: { caseId?: string; justification: string }
    }) => personsService.impersonate(userId, dto),
    onSuccess: (data) => {
      const adminInfo = user ? { id: user.id, name: user.fullName } : null
      setAccessToken(data.accessToken)
      setImpersonating(true, adminInfo)
      // Invalidate /me so the session re-hydrates with the impersonated user's context
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME })
    },
  })
}
