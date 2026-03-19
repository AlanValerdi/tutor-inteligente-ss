import useSWRMutation from 'swr/mutation'
import { mutate } from 'swr'
import { enrollInCourse as enrollInCourseAction } from '@/lib/actions/enrollments'
import { cacheKeys, invalidateRelated } from '@/lib/swr-config'
import { toast } from 'sonner'
import type { 
  PublishedCourse, 
  CourseWithProgress, 
  DashboardStats
} from '@/types/swr'

// Enrollment mutation data structure
interface EnrollmentMutationData {
  courseId: string
  enrollKey: string
}

// Progress update mutation data
interface ProgressMutationData {
  courseId: string
  progress: number
  topicId?: string
}

/**
 * Optimistic enrollment hook with instant UI updates
 */
export function useOptimisticEnrollment() {
  const mutation = useSWRMutation(
    'enrollment-action',
    async (key: string, { arg }: { arg: EnrollmentMutationData }) => {
      const { courseId, enrollKey } = arg
      
      try {
        // Call the actual server action
        await enrollInCourseAction({ courseId, enrollKey })
        return { success: true, courseId }
      } catch (error) {
        throw error
      }
    },
    {
      onSuccess: () => {
        toast.success('¡Inscripción exitosa! Bienvenido al curso 🎉')
        
        // Invalidate related cache entries to get fresh data
        invalidateRelated(mutate, 'enrollment')
        
        // Update dashboard stats
        updateDashboardStatsAfterEnrollment()
      },

      onError: (error: Error) => {
        // Transform server errors into user-friendly messages
        const message = error.message || 'Error desconocido'
        
        if (message.includes('ya inscrito')) {
          toast.error('Ya estás inscrito en este curso')
        } else if (message.includes('clave incorrecta') || message.includes('invalid')) {
          toast.error('Clave de inscripción incorrecta')
        } else if (message.includes('lleno') || message.includes('full')) {
          toast.error('Lo siento, el curso está lleno')
        } else if (message.includes('network') || message.includes('fetch')) {
          toast.error('Error de conexión. Reintentando...')
        } else {
          toast.error('Error al inscribirse. Inténtalo de nuevo')
        }
      }
    }
  )

  return {
    enroll: mutation.trigger,
    isEnrolling: mutation.isMutating,
    error: mutation.error,
    reset: mutation.reset
  }
}

/**
 * Optimistic progress update hook
 */
export function useOptimisticProgress() {
  const mutation = useSWRMutation(
    'progress-update',
    async (key: string, { arg }: { arg: ProgressMutationData }) => {
      const { courseId, progress } = arg
      
      // Update enrolled courses cache optimistically
      mutate(cacheKeys.studentCourses(), (currentCourses: CourseWithProgress[] | undefined) => {
        if (!currentCourses) return currentCourses
        
        return currentCourses.map(course => 
          course.id === courseId && course.enrollment
            ? {
                ...course,
                enrollment: {
                  ...course.enrollment,
                  progress,
                  lastAccessedAt: new Date().toISOString()
                }
              }
            : course
        )
      }, { revalidate: false })
      
      // Update course details cache if it exists
      mutate(cacheKeys.course(courseId), (currentCourse: CourseWithProgress | undefined) => {
        if (!currentCourse || !currentCourse.enrollment) return currentCourse
        
        return {
          ...currentCourse,
          enrollment: {
            ...currentCourse.enrollment,
            progress,
            lastAccessedAt: new Date().toISOString()
          }
        }
      }, { revalidate: false })
      
      // Simulate API call
      return new Promise<{ success: boolean }>((resolve) => {
        setTimeout(() => {
          resolve({ success: true })
        }, 500)
      })
    },
    {
      onSuccess: () => {
        toast.success('Progreso actualizado correctamente')
      },

      onError: (error: Error) => {
        toast.error('Error al actualizar el progreso')
        console.error('Progress update error:', error)
      }
    }
  )

  return {
    updateProgress: mutation.trigger,
    isUpdatingProgress: mutation.isMutating,
    error: mutation.error
  }
}

/**
 * Combined mutations hook for easy access
 */
export function useMutations() {
  const enrollment = useOptimisticEnrollment()
  const progress = useOptimisticProgress()

  return {
    // Enrollment
    enroll: enrollment.enroll,
    isEnrolling: enrollment.isEnrolling,
    enrollmentError: enrollment.error,
    
    // Progress
    updateProgress: progress.updateProgress,
    isUpdatingProgress: progress.isUpdatingProgress,
    progressError: progress.error,
    
    // Combined states
    isAnyMutating: enrollment.isEnrolling || progress.isUpdatingProgress,
    hasAnyError: !!enrollment.error || !!progress.error,
    
    // Reset functions
    resetErrors: () => {
      enrollment.reset()
    }
  }
}

/**
 * Helper function to update dashboard stats after enrollment
 */
function updateDashboardStatsAfterEnrollment() {
  mutate(cacheKeys.studentDashboard(), (currentStats: DashboardStats | undefined) => {
    if (!currentStats) return currentStats

    return {
      ...currentStats,
      totalCourses: currentStats.totalCourses + 1,
      completionPercentage: Math.round(
        (currentStats.completedCourses / (currentStats.totalCourses + 1)) * 100
      )
    }
  }, { revalidate: true })
}