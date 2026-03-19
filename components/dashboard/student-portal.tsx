"use client"

import { useState } from "react"
import { StudentSidebar } from "../lms/student-sidebar"
import { StudentDashboard } from "./student-dashboard"
import { CourseExplorer } from "./course-explorer"
import { CourseViewAdapter } from "./course-view-adapter"
import { TopicDetailAdapter } from "./topic-detail-adapter"
import { DashboardSkeleton } from "../ui/dashboard-skeletons"
import { SWRDebugPanel } from "../debug/swr-debug-panel"
import { 
  useDashboardData, 
  usePublishedCourses, 
  useCourseDetails
} from "@/hooks/use-dashboard-data"
import { useMutations } from "@/hooks/use-mutations"
import { toast } from "sonner"

interface StudentPortalProps {
  onExit: () => void
  studentName: string
  studentId: string
}

type StudentView = "dashboard" | "browse" | "course" | "topic"

export function StudentPortal({ onExit, studentName, studentId }: StudentPortalProps) {
  const [currentView, setCurrentView] = useState<StudentView>("dashboard")
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // SWR hooks for data management
  const dashboardData = useDashboardData()
  const publishedCoursesResult = usePublishedCourses(currentView === "browse")
  const selectedCourseResult = useCourseDetails(selectedCourseId)
  
  // Optimistic mutation hooks
  const mutations = useMutations()

  // Extract data from SWR hooks
  const {
    stats: dashboardStats,
    enrolledCourses,
    isLoading: isDashboardLoading,
    hasError: hasDashboardError,
    error: dashboardError,
    retry: retryDashboard,
    refresh: refreshDashboard
  } = dashboardData

  const {
    data: availableCourses,
    isLoading: isCoursesLoading,
    hasError: hasCoursesError,
    error: coursesError
  } = publishedCoursesResult

  const {
    data: selectedCourse,
    isLoading: isCourseLoading,
    hasError: hasCourseError,
    error: courseError
  } = selectedCourseResult

  // Extract mutation states
  const { isEnrolling } = mutations

  // Load initial data
  // SWR handles data loading automatically - no useEffect needed!

  const handleSelectCourse = async (courseId: string) => {
    if (courseId === "browse") {
      setCurrentView("browse")
      // publishedCoursesResult will automatically start fetching when enabled
      return
    }

    setSelectedCourseId(courseId)
    setCurrentView("course")
    // selectedCourseResult will automatically start fetching with the new courseId
  }

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId)
    setCurrentView("topic")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedCourseId(null)
    setSelectedTopicId(null)
    // SWR automatically manages data - no manual state reset needed
  }

  const handleBackToCourse = () => {
    setCurrentView("course")
    setSelectedTopicId(null)
  }

  const handleEnrollInCourse = async (courseId: string, enrollKey: string) => {
    try {
      // Use optimistic mutation - UI updates instantly, with rollback on error
      await mutations.enroll({ courseId, enrollKey })
      toast.success("¡Inscripción exitosa!")
    } catch (error) {
      console.error("Error enrolling in course:", error)
      toast.error("Error al inscribirse en el curso")
      // Optimistic hook automatically handles rollback on error
    }
  }

  const handleTopicComplete = () => {
    handleBackToCourse()
  }

  // Compute derived state
  const selectedTopicData = selectedCourse && selectedTopicId
    ? selectedCourse.topics.find(t => t.id === selectedTopicId)
    : null

  const topicIndex = selectedCourse && selectedTopicId
    ? selectedCourse.topics.findIndex(t => t.id === selectedTopicId)
    : 0

  // Loading state - show loading skeleton if dashboard is loading on first load
  if (isDashboardLoading) {
    return (
      <div className="flex h-screen bg-background">
        <StudentSidebar
          currentView={currentView}
          onNavigate={() => {}}
          onExit={onExit}
          studentName={studentName}
          studentProfile="Estudiante"
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <DashboardSkeleton />
      </div>
    )
  }

  // Error state for critical dashboard data
  if (hasDashboardError && !dashboardStats && !enrolledCourses) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar datos del dashboard</p>
          <button 
            onClick={retryDashboard}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Reintentar
          </button>
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

      {currentView === "dashboard" && dashboardStats && enrolledCourses && (
        <StudentDashboard 
          stats={dashboardStats as any}
          enrolledCourses={enrolledCourses as any}
          onSelectCourse={handleSelectCourse}
          studentName={studentName}
        />
      )}

      {currentView === "browse" && (
        <CourseExplorer
          availableCourses={availableCourses?.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description || "",
            enrollKey: "", // This will need to be handled properly - maybe from enrollment action
            isPublished: true,
            teacher: {
              id: course.teacher.id,
              name: course.teacher.name,
              image: null // PublishedCourse doesn't have image, set to null
            },
            topics: Array(course._count.topics).fill(0).map((_, i) => ({ id: `topic-${i}` })),
            studentsEnrolled: course._count.enrollments,
          })) || []}
          onEnroll={handleEnrollInCourse}
          onBack={handleBackToDashboard}
          isLoading={isCoursesLoading}
          isEnrolling={isEnrolling}
        />
      )}

      {currentView === "course" && selectedCourse && (
        <CourseViewAdapter
          course={{
            ...selectedCourse,
            teacher: {
              ...selectedCourse.teacher,
              image: null // Add missing image property
            },
            topics: selectedCourse.topics.map(topic => ({
              id: topic.id,
              title: topic.title,
              content: topic.description || "", // Map description to content
              order: topic.position // Map position to order
            }))
          }}
          onBack={handleBackToDashboard}
          onSelectTopic={handleSelectTopic}
        />
      )}

      {currentView === "topic" && selectedTopicData && selectedCourse && (
        <TopicDetailAdapter
          topic={{
            id: selectedTopicData.id,
            title: selectedTopicData.title,
            content: selectedTopicData.description || "", // Map description to content
            order: selectedTopicData.position // Map position to order
          }}
          topicIndex={topicIndex}
          totalTopics={selectedCourse.topics.length}
          profile="Visual" // Esto también podría venir del perfil del usuario
          onBack={handleBackToCourse}
          onComplete={handleTopicComplete}
        />
      )}
      
      {/* Debug Panel - only shows in development */}
      <SWRDebugPanel />
    </div>
  )
}