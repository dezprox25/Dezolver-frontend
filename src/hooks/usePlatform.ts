import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { platformService } from '@/services/api/platform.service'
import type { FeatureFlagMap } from '@/types/platform.types'
import { QUERY_KEYS } from '@/lib/constants'

// ─── Feature Flags ────────────────────────────────────────────────────────────

export function useFeatureFlags() {
  return useQuery({
    queryKey: QUERY_KEYS.FEATURE_FLAGS,
    queryFn: () => platformService.listFeatureFlags(),
    staleTime: 60 * 1000,
  })
}

export function useUpdateFeatureFlags() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (flags: FeatureFlagMap) => platformService.updateFeatureFlags(flags),
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEYS.FEATURE_FLAGS, updated)
    },
  })
}

// ─── Launch ───────────────────────────────────────────────────────────────────

export function useLaunchStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.LAUNCH_STATUS,
    queryFn: () => platformService.getLaunchStatus(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdvanceLaunchPhase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: { notes?: string }) => platformService.advanceLaunchPhase(dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEYS.LAUNCH_STATUS, updated)
    },
  })
}

// ─── Version & Time ───────────────────────────────────────────────────────────

export function usePlatformVersion() {
  return useQuery({
    queryKey: QUERY_KEYS.PLATFORM_VERSION,
    queryFn: () => platformService.getVersion(),
    staleTime: 10 * 60 * 1000,
  })
}

export function usePlatformTime() {
  return useQuery({
    queryKey: QUERY_KEYS.PLATFORM_TIME,
    queryFn: () => platformService.getServerTime(),
    staleTime: 0,
    refetchInterval: 60 * 1000,
  })
}
