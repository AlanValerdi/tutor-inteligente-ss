import useSWR, { mutate } from 'swr'
import { useMemo } from 'react'
import type { 
  ExtendedSWRResponse, 
  SWRHookOptions, 
  APIError,
  CacheInvalidationOptions 
} from '@/types/swr'
import { revalidateIntervals } from '@/lib/swr-config'

/**
 * Enhanced SWR hook with additional helper properties and error handling
 */
export function useEnhancedSWR<T>(
  key: string | null,
  options: SWRHookOptions = {}
): ExtendedSWRResponse<T> {
  const {
    refreshInterval,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    errorRetryCount = 3,
    suspense = false,
  } = options

  const { data, error, isLoading, isValidating, mutate: swrMutate } = useSWR<T, APIError>(
    key,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect,
      errorRetryCount,
      suspense,
    }
  )

  const extendedResponse = useMemo((): ExtendedSWRResponse<T> => {
    const isEmpty = !data || (Array.isArray(data) && data.length === 0)
    const isFirstLoad = !data && !error && isLoading
    const hasError = !!error

    return {
      data,
      error,
      isLoading,
      isValidating,
      mutate: swrMutate,
      isEmpty,
      isFirstLoad,
      hasError,
      retry: () => swrMutate(),
    }
  }, [data, error, isLoading, isValidating, swrMutate])

  return extendedResponse
}

/**
 * Hook for data that updates frequently (dashboard stats, notifications)
 */
export function useFrequentData<T>(
  key: string | null,
  options: SWRHookOptions = {}
): ExtendedSWRResponse<T> {
  return useEnhancedSWR<T>(key, {
    refreshInterval: revalidateIntervals.frequent,
    ...options,
  })
}

/**
 * Hook for data that updates moderately (course lists, user profiles)
 */
export function useModerateData<T>(
  key: string | null,
  options: SWRHookOptions = {}
): ExtendedSWRResponse<T> {
  return useEnhancedSWR<T>(key, {
    refreshInterval: revalidateIntervals.moderate,
    ...options,
  })
}

/**
 * Hook for data that rarely changes (course content, system settings)
 */
export function useRareData<T>(
  key: string | null,
  options: SWRHookOptions = {}
): ExtendedSWRResponse<T> {
  return useEnhancedSWR<T>(key, {
    refreshInterval: revalidateIntervals.rare,
    ...options,
  })
}

/**
 * Hook for real-time data (progress updates, live notifications)
 */
export function useRealtimeData<T>(
  key: string | null,
  options: SWRHookOptions = {}
): ExtendedSWRResponse<T> {
  return useEnhancedSWR<T>(key, {
    refreshInterval: revalidateIntervals.realtime,
    ...options,
  })
}

/**
 * Utility to invalidate multiple cache keys at once
 */
export async function invalidateMultiple(
  keys: (string | null)[],
  options: CacheInvalidationOptions = {}
): Promise<void> {
  const { revalidate = true } = options
  
  const validKeys = keys.filter((key): key is string => key !== null)
  
  await Promise.all(
    validKeys.map(key => mutate(key, undefined, { revalidate }))
  )
}

/**
 * Utility to invalidate cache keys matching a pattern
 * Note: This is a simplified version - full pattern matching would require
 * a more advanced cache management solution
 */
export async function invalidateByPattern(
  pattern: RegExp,
  commonKeys: string[],
  options: CacheInvalidationOptions = {}
): Promise<void> {
  const { revalidate = true } = options
  
  const keysToInvalidate = commonKeys.filter(key => pattern.test(key))
  
  await Promise.all(
    keysToInvalidate.map(key => mutate(key, undefined, { revalidate }))
  )
}

/**
 * Optimistic update utility for mutations
 */
export async function optimisticUpdate<T>(
  key: string,
  optimisticData: T,
  mutationFn: () => Promise<T>,
  options: CacheInvalidationOptions = {}
): Promise<T> {
  const {
    rollbackOnError = true,
    populateCache = true,
    revalidate = true,
  } = options

  try {
    // Set optimistic data immediately
    await mutate(key, optimisticData, { revalidate: false, populateCache })
    
    // Perform the mutation
    const result = await mutationFn()
    
    // Update with real data
    if (populateCache) {
      await mutate(key, result, { revalidate })
    } else {
      await mutate(key, undefined, { revalidate })
    }
    
    return result
  } catch (error) {
    // Rollback on error if specified
    if (rollbackOnError) {
      await mutate(key, undefined, { revalidate: true })
    }
    throw error
  }
}

/**
 * Utility to preload data
 */
export async function preloadData<T>(key: string): Promise<T | undefined> {
  try {
    // This will trigger a fetch if not already in cache
    return await mutate(key)
  } catch (error) {
    console.warn('Failed to preload data:', { key, error })
    return undefined
  }
}

/**
 * Utility to check if data exists in cache
 * Note: This is a simplified check - actual cache inspection would require
 * additional SWR configuration or external cache management
 */
export function isCached(key: string): boolean {
  // In a real implementation, you would use a cache manager
  // For now, this is a placeholder
  return false
}

/**
 * Utility to get cached data without triggering a fetch
 * Note: This requires custom cache management or SWR devtools
 */
export function getCachedData<T>(key: string): T | undefined {
  // In a real implementation, you would access your cache store
  // For now, this returns undefined
  return undefined
}

/**
 * Clear specific cache entries by keys
 */
export async function clearCacheByKeys(keys: string[]): Promise<void> {
  await Promise.all(
    keys.map(key => mutate(key, undefined, { revalidate: false }))
  )
}

/**
 * Hook for dependent data fetching
 * Only fetches when condition is met
 */
export function useConditionalSWR<T>(
  key: string | null,
  condition: boolean,
  options: SWRHookOptions = {}
): ExtendedSWRResponse<T> {
  return useEnhancedSWR<T>(condition ? key : null, options)
}

/**
 * Hook for paginated data
 */
export function usePaginatedData<T>(
  getKey: (index: number) => string | null,
  options: SWRHookOptions = {}
) {
  // This would be implemented with useSWRInfinite in a full implementation
  // For now, we'll create a basic version
  return useEnhancedSWR<T>(getKey(0), options)
}