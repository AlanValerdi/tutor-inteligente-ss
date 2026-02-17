"use client"

import { useState } from "react"
import { TeacherSidebar } from "./teacher-sidebar"
import { StudentAnalytics } from "./student-analytics"
import { CourseManager } from "./course-manager"
import { TopicCreator } from "./topic-creator"

type TeacherView = "analytics" | "courses" | "create"

interface TeacherPortalProps {
  onExit: () => void
}

export function TeacherPortal({ onExit }: TeacherPortalProps) {
  const [currentView, setCurrentView] = useState<TeacherView>("analytics")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <TeacherSidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onExit={onExit}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {currentView === "analytics" && <StudentAnalytics />}
      {currentView === "courses" && <CourseManager />}
      {currentView === "create" && <TopicCreator />}
    </div>
  )
}
