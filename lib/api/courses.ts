// Client-side helper functions for fetching data with GET requests

export interface Course {
  id: string
  title: string
  description: string | null
  enrollKey: string
  isPublished: boolean
  teacher: {
    id: string
    name: string | null
    image: string | null
  }
  _count: {
    enrollments: number
    topics: number
  }
}

export interface DashboardStats {
  enrolledCourses: number
  totalTopics: number
  averageProgress: number
  completedCourses: number
}

export interface CourseWithProgress {
  id: string
  course: {
    id: string
    title: string
    description: string | null
    teacher: {
      id: string
      name: string | null
      image: string | null
    }
    topics: {
      id: string
      title: string
      order: number
    }[]
    topicsCount: number
    studentsEnrolled: number
  }
  progress: number
  enrolledAt: Date
}

export async function fetchPublishedCourses(): Promise<Course[]> {
  const response = await fetch('/api/courses/published', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch courses')
  }

  const courses = await response.json()
  return courses
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/student/dashboard-stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats')
  }

  const stats = await response.json()
  return stats
}

export async function fetchEnrolledCourses(): Promise<CourseWithProgress[]> {
  const response = await fetch('/api/student/enrolled-courses', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch enrolled courses')
  }

  const courses = await response.json()
  return courses
}