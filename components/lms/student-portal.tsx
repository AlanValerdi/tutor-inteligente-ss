"use client"

import { useState } from "react"
import { StudentSidebar } from "./student-sidebar"
import { StudentDashboard } from "./student-dashboard"
import { DiagnosticWizard } from "./diagnostic-wizard"
import { CourseView } from "./course-view"
import { TopicDetail } from "./topic-detail"
import { courses, type StudyProfile } from "@/lib/lms-data"

interface StudentPortalProps {
  onExit: () => void
}

type StudentView = "dashboard" | "course" | "topic"

export function StudentPortal({ onExit }: StudentPortalProps) {
  const [completedDiagnostic, setCompletedDiagnostic] = useState(false)
  const [profile, setProfile] = useState<StudyProfile>("Visual")
  const [currentView, setCurrentView] = useState<StudentView>("dashboard")
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)

  const handleDiagnosticComplete = (detectedProfile: StudyProfile) => {
    setProfile(detectedProfile)
    setCompletedDiagnostic(true)
  }

  const handleSelectCourse = (courseId: string) => {
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

  const handleTopicComplete = () => {
    // In a real app, this would update the database
    handleBackToCourse()
  }

  if (!completedDiagnostic) {
    return (
      <div className="min-h-screen bg-background">
        <DiagnosticWizard onComplete={handleDiagnosticComplete} />
      </div>
    )
  }

  const selectedCourse = selectedCourseId
    ? courses.find((c) => c.id === selectedCourseId)
    : null

  const selectedTopic = selectedCourse && selectedTopicId
    ? selectedCourse.topics.find((t) => t.id === selectedTopicId)
    : null

  const topicIndex = selectedCourse && selectedTopicId
    ? selectedCourse.topics.findIndex((t) => t.id === selectedTopicId)
    : 0

  return (
    <div className="flex h-screen bg-background">
      <StudentSidebar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === "dashboard") handleBackToDashboard()
          else setCurrentView(view)
        }}
        onExit={onExit}
        studentName="Student User"
        studentProfile={profile}
      />

      {currentView === "dashboard" && (
        <StudentDashboard profile={profile} onSelectCourse={handleSelectCourse} />
      )}

      {currentView === "course" && selectedCourse && (
        <CourseView
          course={selectedCourse}
          onBack={handleBackToDashboard}
          onSelectTopic={handleSelectTopic}
        />
      )}

      {currentView === "topic" && selectedTopic && selectedCourse && (
        <TopicDetail
          topic={selectedTopic}
          topicIndex={topicIndex}
          totalTopics={selectedCourse.topics.length}
          profile={profile}
          onBack={handleBackToCourse}
          onComplete={handleTopicComplete}
        />
      )}
    </div>
  )
}
