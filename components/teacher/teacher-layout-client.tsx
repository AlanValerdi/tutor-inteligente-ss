"use client"

import { TeacherSidebar } from "@/components/teacher/teacher-sidebar"
import { useState } from "react"
import { handleSignOut } from "@/lib/actions/auth"
import { useRouter } from "next/navigation"

interface TeacherLayoutProps {
  children: React.ReactNode
  teacherName: string
}

export function TeacherLayoutClient({ children, teacherName }: TeacherLayoutProps) {
  const [currentView, setCurrentView] = useState<"dashboard" | "courses" | "create-course" | "students" | "reports">("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()

  const handleExit = async () => {
    try {
      await handleSignOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      router.push("/login")
    }
  }

  const handleNavigate = (view: "dashboard" | "courses" | "create-course" | "students" | "reports") => {
    setCurrentView(view)
    // TODO: Implement navigation logic for different teacher views
    console.log("Navigate to:", view)
  }

  return (
    <div className="flex h-screen bg-background">
      <TeacherSidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onExit={handleExit}
        teacherName={teacherName}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}