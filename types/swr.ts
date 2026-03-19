import { KeyedMutator } from 'swr'

// Base SWR response interface
export interface SWRResponse<T> {
  data: T | undefined
  error: Error | undefined
  isLoading: boolean
  isValidating: boolean
  mutate: KeyedMutator<T>
}

// Extended SWR response with additional helper states
export interface ExtendedSWRResponse<T> extends SWRResponse<T> {
  isEmpty: boolean
  isFirstLoad: boolean
  hasError: boolean
  retry: () => void
}

// Dashboard statistics interface
export interface DashboardStats {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  totalHours: number
  completionPercentage: number
  recentActivity: Array<{
    courseId: string
    courseName: string
    lastAccessed: string
    progress: number
  }>
}

// Course with progress interface  
export interface CourseWithProgress {
  id: string
  title: string
  description: string
  slug: string
  imageUrl?: string
  price: number
  isPublished: boolean
  categoryId?: string
  userId: string
  createdAt: string
  updatedAt: string
  teacher: {
    id: string
    name: string
    email: string
  }
  topics: Array<{
    id: string
    title: string
    description?: string
    position: number
    isPublished: boolean
    isFree: boolean
  }>
  enrollment?: {
    id: string
    userId: string
    courseId: string
    enrolledAt: string
    progress: number
    completedTopics: number
    totalTopics: number
    lastAccessedAt?: string
  }
  _count: {
    topics: number
    enrollments: number
  }
}

// Published course interface (for browsing/enrollment)
export interface PublishedCourse {
  id: string
  title: string
  description: string
  slug: string
  imageUrl?: string
  price: number
  categoryId?: string
  userId: string
  createdAt: string
  updatedAt: string
  teacher: {
    id: string
    name: string
    email: string
  }
  category?: {
    id: string
    name: string
  }
  _count: {
    topics: number
    enrollments: number
  }
  isEnrolled?: boolean
}

// Course details interface
export interface CourseDetails extends CourseWithProgress {
  topics: Array<{
    id: string
    title: string
    description?: string
    videoUrl?: string
    position: number
    isPublished: boolean
    isFree: boolean
    duration?: number
    isCompleted?: boolean
  }>
}

// Enrollment status interface
export interface EnrollmentStatus {
  isEnrolled: boolean
  enrollment?: {
    id: string
    userId: string
    courseId: string
    enrolledAt: string
    progress: number
    completedTopics: number
    totalTopics: number
    lastAccessedAt?: string
  }
}

// Topic progress interface
export interface TopicProgress {
  topicId: string
  userId: string
  courseId: string
  isCompleted: boolean
  watchedDuration?: number
  totalDuration?: number
  lastWatchedAt?: string
  completedAt?: string
}

// Combined dashboard data interface
export interface DashboardData {
  stats: DashboardStats
  enrolledCourses: CourseWithProgress[]
}

// SWR hook configuration options
export interface SWRHookOptions {
  refreshInterval?: number
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  errorRetryCount?: number
  suspense?: boolean
}

// Mutation response interface
export interface MutationResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Cache invalidation options
export interface CacheInvalidationOptions {
  revalidate?: boolean
  rollbackOnError?: boolean
  optimisticData?: any
  populateCache?: boolean
}

// Search and filter interfaces
export interface CourseSearchParams {
  query?: string
  categoryId?: string
  priceRange?: {
    min: number
    max: number
  }
  isEnrolled?: boolean
  sortBy?: 'title' | 'createdAt' | 'enrollments' | 'price'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResults<T> {
  items: T[]
  total: number
  hasMore: boolean
  page: number
}

// API Error interface
export interface APIError extends Error {
  status?: number
  code?: string
  details?: Record<string, any>
}