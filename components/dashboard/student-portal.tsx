"use client"

import { useState, useEffect } from "react"
import { StudentSidebar } from "../lms/student-sidebar"
import { StudentDashboard } from "./student-dashboard"
import { CourseExplorer } from "./course-explorer"
import { CourseViewAdapter } from "./course-view-adapter"
import { TopicDetailAdapter } from "./topic-detail-adapter"
import { enrollInCourse } from "@/lib/actions/enrollments"
import { getCourseById } from "@/lib/actions/courses"
import { 
  fetchPublishedCourses, 
  fetchDashboardStats, 
  fetchEnrolledCourses,
  type DashboardStats,
  type CourseWithProgress
} from "@/lib/api/courses"
import { toast } from "sonner"

interface StudentPortalProps {
  onExit: () => void
  studentName: string
  studentId: string
}

type StudentView = "dashboard" | "browse" | "course" | "topic"

interface EnrolledCourse {
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

interface AvailableCourse {
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
    topics: number
    enrollments: number
  }
}

interface CourseDetails {
  id: string
  title: string
  description: string | null
  topics: {
    id: string
    title: string
    content: string
    order: number
  }[]
  teacher: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  _count?: {
    enrollments: number
  }
}

export function StudentPortal({ onExit, studentName, studentId }: StudentPortalProps) {
  const [currentView, setCurrentView] = useState<StudentView>("dashboard")
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Data states with proper typing
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    totalTopics: 0,
    averageProgress: 0,
    completedCourses: 0,
  })
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithProgress[]>([])
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([])
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(null)
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [stats, courses] = await Promise.all([
        fetchDashboardStats(),
        fetchEnrolledCourses()
      ])
      setDashboardStats(stats)
      setEnrolledCourses(courses)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("Error al cargar los datos del dashboard")
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableCourses = async () => {
    try {
      const courses = await fetchPublishedCourses()
      
      // Transform the data to match our interface
      const transformedCourses: AvailableCourse[] = courses.map((course: any) => ({
        ...course,
        topics: { id: course._count.topics } as any, // We only need the count for available courses
        studentsEnrolled: course._count.enrollments,
      }))
      setAvailableCourses(transformedCourses)
    } catch (error) {
      console.error("Error loading available courses:", error)
      toast.error("Error al cargar cursos disponibles")
    }
  }

  const loadCourseDetails = async (courseId: string) => {
    try {
      const course = await getCourseById(courseId)
      setSelectedCourse(course)
    } catch (error) {
      console.error("Error loading course details:", error)
      toast.error("Error al cargar detalles del curso")
    }
  }

  const handleSelectCourse = async (courseId: string) => {
    if (courseId === "browse") {
      await loadAvailableCourses()
      setCurrentView("browse")
      return
    }

    setSelectedCourseId(courseId)
    await loadCourseDetails(courseId)
    setCurrentView("course")
  }

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId)
    setCurrentView("topic")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedCourseId(null)
    setSelectedTopicId(null)
    setSelectedCourse(null)
    // Don't reload data unnecessarily - only reload after enrollment or when data is empty
  }

  const handleBackToCourse = () => {
    setCurrentView("course")
    setSelectedTopicId(null)
  }

  const handleEnrollInCourse = async (courseId: string, enrollKey: string) => {
    await enrollInCourse({ courseId, enrollKey })
    // Reload dashboard data after successful enrollment
    await loadDashboardData()
  }

  const refreshDashboard = () => {
    loadDashboardData()
  }

  const handleTopicComplete = () => {
    handleBackToCourse()
  }

  const selectedTopicData = selectedCourse && selectedTopicId
    ? selectedCourse.topics.find(t => t.id === selectedTopicId)
    : null

  const topicIndex = selectedCourse && selectedTopicId
    ? selectedCourse.topics.findIndex(t => t.id === selectedTopicId)
    : 0

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <StudentSidebar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === "dashboard") handleBackToDashboard()
          else if (view === "course") setCurrentView("browse")
        }}
        onExit={onExit}
        studentName={studentName}
        studentProfile="Estudiante" // Esto podría venir de la sesión del usuario
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {currentView === "dashboard" && (
        <StudentDashboard 
          stats={dashboardStats}
          enrolledCourses={enrolledCourses}
          onSelectCourse={handleSelectCourse}
          studentName={studentName}
        />
      )}

      {currentView === "browse" && (
        <CourseExplorer
          availableCourses={availableCourses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            enrollKey: course.enrollKey,
            isPublished: course.isPublished,
            teacher: course.teacher,
            topics: Array(course._count.topics).fill(0).map((_, i) => ({ id: `topic-${i}` })),
            studentsEnrolled: course._count.enrollments,
          }))}
          onEnroll={handleEnrollInCourse}
          onBack={handleBackToDashboard}
        />
      )}

      {currentView === "course" && selectedCourse && (
        <CourseViewAdapter
          course={selectedCourse}
          onBack={handleBackToDashboard}
          onSelectTopic={handleSelectTopic}
        />
      )}

      {currentView === "topic" && selectedTopicData && selectedCourse && (
        <TopicDetailAdapter
          topic={selectedTopicData}
          topicIndex={topicIndex}
          totalTopics={selectedCourse.topics.length}
          profile="Visual" // Esto también podría venir del perfil del usuario
          onBack={handleBackToCourse}
          onComplete={handleTopicComplete}
        />
      )}
    </div>
  )
}