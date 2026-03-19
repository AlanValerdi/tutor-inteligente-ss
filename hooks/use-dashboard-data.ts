import { useFrequentData, useModerateData, useConditionalSWR } from './use-swr-utils'
import { cacheKeys, invalidateRelated } from '@/lib/swr-config'
import { mutate } from 'swr'
import type { 
  DashboardStats, 
  CourseWithProgress, 
  PublishedCourse,
  DashboardData,
  ExtendedSWRResponse 
} from '@/types/swr'

/**
 * Hook for fetching dashboard statistics
 * Updates every 5 minutes, revalidates on focus
 */
export function useDashboardStats(): ExtendedSWRResponse<DashboardStats> {
  return useFrequentData<DashboardStats>(cacheKeys.studentDashboard())
}

/**
 * Hook for fetching enrolled courses with progress
 * Updates every 5 minutes, revalidates on focus
 */
export function useEnrolledCourses(): ExtendedSWRResponse<CourseWithProgress[]> {
  return useFrequentData<CourseWithProgress[]>(cacheKeys.studentCourses())
}

/**
 * Combined hook for dashboard data (stats + enrolled courses)
 * This provides both datasets with synchronized loading states
 */
export function useDashboardData() {
  const statsResult = useDashboardStats()
  const coursesResult = useEnrolledCourses()

  // Combined loading state - true if either is loading on first load
  const isLoading = statsResult.isFirstLoad || coursesResult.isFirstLoad

  // Combined error state - true if either has an error
  const hasError = statsResult.hasError || coursesResult.hasError

  // Combined error object - prioritize stats error, then courses error
  const error = statsResult.error || coursesResult.error

  // Combined empty state - true if both are empty or undefined
  const isEmpty = statsResult.isEmpty && coursesResult.isEmpty

  // Background validation state - true if either is revalidating
  const isValidating = statsResult.isValidating || coursesResult.isValidating

  // Data is ready when both are loaded and not on first load
  const isReady = !isLoading && !hasError && statsResult.data && coursesResult.data

  // Combined retry function
  const retry = () => {
    statsResult.retry()
    coursesResult.retry()
  }

  // Refresh both datasets manually
  const refresh = async () => {
    await Promise.all([
      statsResult.mutate(),
      coursesResult.mutate()
    ])
  }

  return {
    // Individual data
    stats: statsResult.data,
    enrolledCourses: coursesResult.data,
    
    // Combined states
    isLoading,
    isValidating,
    hasError,
    error,
    isEmpty,
    isReady,
    
    // Actions
    retry,
    refresh,
    
    // Individual results for advanced usage
    statsResult,
    coursesResult,
  }
}

/**
 * Hook for fetching published courses (course catalog)
 * Only fetches when enabled, caches for 15 minutes
 */
export function usePublishedCourses(enabled: boolean = true): ExtendedSWRResponse<PublishedCourse[]> {
  return useConditionalSWR<PublishedCourse[]>(
    enabled ? cacheKeys.publishedCourses() : null,
    enabled,
    {
      // Longer cache time since course catalog changes less frequently
      refreshInterval: 15 * 60 * 1000, // 15 minutes
      revalidateOnFocus: false, // Don't revalidate on focus for catalog
      errorRetryCount: 2, // Fewer retries for catalog
    }
  )
}

/**
 * Hook for fetching specific course details
 * Only fetches when courseId is provided
 */
export function useCourseDetails(courseId: string | null): ExtendedSWRResponse<CourseWithProgress> {
  return useModerateData<CourseWithProgress>(
    courseId ? cacheKeys.course(courseId) : null,
    {
      // Moderate refresh interval for course details
      refreshInterval: 10 * 60 * 1000, // 10 minutes
      revalidateOnFocus: true,
    }
  )
}

/**
 * Hook for checking enrollment status of a specific course
 * Useful for enrollment buttons and access control
 */
export function useEnrollmentStatus(courseId: string | null, userId?: string) {
  return useModerateData(
    courseId ? cacheKeys.courseEnrollment(courseId, userId) : null,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: true,
    }
  )
}

/**
 * Utility function to invalidate all dashboard-related cache
 * Call this after successful enrollment, course completion, etc.
 */
export async function invalidateDashboardCache(): Promise<void> {
  await invalidateRelated(mutate, 'dashboard')
}

/**
 * Utility function to refresh dashboard data manually
 * Useful for pull-to-refresh or after mutations
 */
export async function refreshDashboardData(): Promise<void> {
  await Promise.all([
    mutate(cacheKeys.studentDashboard()),
    mutate(cacheKeys.studentCourses()),
  ])
}

/**
 * Utility function to preload course catalog
 * Call this when user is likely to browse courses
 */
export async function preloadCourseCatalog(): Promise<void> {
  // Preload in background without blocking UI
  mutate(cacheKeys.publishedCourses())
}

/**
 * Optimistic enrollment hook
 * Provides optimistic updates for better UX during enrollment
 */
export function useOptimisticEnrollment() {
  const enrollInCourse = async (courseId: string, enrollmentKey?: string) => {
    // Implementation would go here - optimistic update followed by API call
    // This will be implemented in the mutation phase
    console.log('Optimistic enrollment not yet implemented', { courseId, enrollmentKey })
  }

  const unenrollFromCourse = async (courseId: string) => {
    // Implementation would go here
    console.log('Optimistic unenrollment not yet implemented', { courseId })
  }

  return {
    enrollInCourse,
    unenrollFromCourse,
  }
}