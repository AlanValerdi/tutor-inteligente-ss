import { useEnhancedSWR } from './use-swr-utils'
import { cacheKeys } from '@/lib/swr-config'
import type { PublishedCourse } from '@/types/swr'

export function useTestSWR() {
  return useEnhancedSWR<PublishedCourse[]>(
    cacheKeys.publishedCourses()
  )
}