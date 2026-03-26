"use client"

import { useState } from "react"
import { StudentSidebar } from "../lms/student-sidebar"
import { StudentDashboard } from "./student-dashboard"
import { EnrollByKey } from "../student/enroll-by-key"
import { CourseViewAdapter } from "./course-view-adapter"
import { TopicDetailAdapter } from "./topic-detail-adapter"
import { DashboardSkeleton } from "../ui/dashboard-skeletons"
import { SWRDebugPanel } from "../debug/swr-debug-panel"
import { 
  useDashboardData, 
  useCourseDetails
} from "@/hooks/use-dashboard-data"
import { toast } from "sonner"

interface StudentPortalProps {
  onExit: () => void
  studentName: string
  studentId: string
}

type StudentView = "dashboard" | "enroll" | "course" | "topic"

export function StudentPortal({ onExit, studentName, studentId }: StudentPortalProps) {
  const [currentView, setCurrentView] = useState<StudentView>("dashboard")
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // SWR hooks for data management
  const dashboardData = useDashboardData()
  const selectedCourseResult = useCourseDetails(selectedCourseId)

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
    data: selectedCourse,
    isLoading: isCourseLoading,
    hasError: hasCourseError,
    error: courseError
  } = selectedCourseResult

  const handleSelectCourse = async (courseId: string) => {
    if (courseId === "enroll") {
      setCurrentView("enroll")
      return
    }

    setSelectedCourseId(courseId)
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
  }

  const handleBackToCourse = () => {
    setCurrentView("course")
    setSelectedTopicId(null)
  }

  const handleEnrollSuccess = () => {
    // Refresh dashboard data to show new enrollment
    refreshDashboard()
    handleBackToDashboard()
    toast.success("¡Inscripción exitosa!")
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
          else if (view === "course") setCurrentView("enroll")
        }}
        onExit={onExit}
        studentName={studentName}
        studentProfile="Estudiante"
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

      {currentView === "enroll" && (
        <EnrollByKey
          onEnrollSuccess={handleEnrollSuccess}
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
            content: selectedTopicData.description || "",
            order: selectedTopicData.position
          }}
          topicIndex={topicIndex}
          totalTopics={selectedCourse.topics.length}
          profile="Visual"
          courseId={selectedCourse.id}
          quizzes={[]} // TODO: Fetch quizzes for this topic
          onBack={handleBackToCourse}
          onComplete={handleTopicComplete}
        />
      )}
      
      {/* Debug Panel - only shows in development */}
      <SWRDebugPanel />
    </div>
  )
}