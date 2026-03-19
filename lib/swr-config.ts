import { SWRConfiguration } from 'swr'
import { toast } from 'sonner'

// Custom fetcher function with error handling
export const fetcher = async (url: string) => {
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
    
    // Add more context to the error
    try {
      const errorData = await response.json()
      error.message = errorData.message || error.message
    } catch {
      // If response is not JSON, use the status text
    }
    
    throw error
  }
  
  return response.json()
}

// Global SWR configuration
export const swrConfig: SWRConfiguration = {
  // Data fetching
  fetcher,
  
  // Revalidation settings
  revalidateOnFocus: true,          // Revalidate when window gets focus
  revalidateOnReconnect: true,      // Revalidate when network reconnects
  revalidateIfStale: true,          // Revalidate if data is stale
  
  // Cache settings
  dedupingInterval: 2000,           // Deduping interval in milliseconds
  focusThrottleInterval: 5000,      // Throttle revalidation on focus
  
  // Error handling and retry
  errorRetryCount: 3,               // Number of retry attempts
  errorRetryInterval: 5000,         // Delay between retries in milliseconds
  shouldRetryOnError: (error) => {
    // Don't retry on 4xx errors (client errors)
    if (error.status && error.status >= 400 && error.status < 500) {
      return false
    }
    return true
  },
  
  // Loading and error states
  loadingTimeout: 10000,            // Show error after 10 seconds
  
  // Global error handler
  onError: (error, key) => {
    console.error('SWR Error:', { error, key })
    
    // Show user-friendly error messages
    if (error.status === 401) {
      toast.error('Session expired. Please log in again.')
    } else if (error.status === 403) {
      toast.error('Access denied.')
    } else if (error.status === 404) {
      toast.error('Resource not found.')
    } else if (error.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else {
      toast.error('Something went wrong. Please try again.')
    }
  },
  
  // Success handler for debugging (remove in production)
  onSuccess: (data, key, config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('SWR Success:', { key, dataLength: Array.isArray(data) ? data.length : 'object' })
    }
  },
}

// Cache key generators for consistent naming
export const cacheKeys = {
  // Student-related data
  studentDashboard: (userId?: string) => `/api/student/dashboard-stats${userId ? `?userId=${userId}` : ''}`,
  studentCourses: (userId?: string) => `/api/student/enrolled-courses${userId ? `?userId=${userId}` : ''}`,
  
  // Course-related data
  publishedCourses: () => '/api/courses/published',
  course: (courseId: string) => `/api/courses/${courseId}`,
  courseEnrollment: (courseId: string, userId?: string) => 
    `/api/courses/${courseId}/enrollment${userId ? `?userId=${userId}` : ''}`,
  
  // Topic-related data
  topicProgress: (courseId: string, topicId: string, userId?: string) => 
    `/api/courses/${courseId}/topics/${topicId}/progress${userId ? `?userId=${userId}` : ''}`,
} as const

// Helper function to invalidate related cache entries
export const invalidateRelated = async (mutate: any, pattern: string) => {
  // This will be used to invalidate multiple related cache entries
  // For example, when enrolling in a course, we want to invalidate:
  // - Student dashboard stats
  // - Student enrolled courses
  // - Course enrollment status
  
  const keysToInvalidate = [
    cacheKeys.studentDashboard(),
    cacheKeys.studentCourses(),
    cacheKeys.publishedCourses(),
  ]
  
  await Promise.all(
    keysToInvalidate.map(key => mutate(key))
  )
}

// Predefined revalidation intervals for different data types
export const revalidateIntervals = {
  // Real-time data (progress, notifications)
  realtime: 10 * 1000,        // 10 seconds
  
  // Frequently changing data (dashboard stats, enrollment status)
  frequent: 5 * 60 * 1000,    // 5 minutes
  
  // Moderately changing data (course list, user info)
  moderate: 15 * 60 * 1000,   // 15 minutes
  
  // Rarely changing data (course content, system settings)
  rare: 60 * 60 * 1000,       // 1 hour
} as const