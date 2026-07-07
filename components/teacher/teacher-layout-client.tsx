"use client"

import { TeacherSidebar } from "@/components/teacher/teacher-sidebar"
import { PortalShell } from "@/components/layout/portal-shell"
import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"

interface TeacherLayoutProps {
  children: React.ReactNode
  teacherName: string
}

export function TeacherLayoutClient({ children, teacherName }: TeacherLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const getCurrentView = (): "dashboard" | "courses" | "create-course" | "students" | "reports" => {
    if (pathname?.includes("/analytics")) return "students"
    if (pathname?.includes("/reports")) return "reports"
    if (pathname?.includes("/courses/create")) return "create-course"
    if (pathname?.includes("/courses")) return "courses"
    return "dashboard"
  }

  const [currentView, setCurrentView] = useState(getCurrentView())

  useEffect(() => {
    setCurrentView(getCurrentView())
  }, [pathname])

  const handleExit = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      router.push("/login")
    }
  }

  const handleNavigate = (view: "dashboard" | "courses" | "create-course" | "students" | "reports") => {
    setCurrentView(view)

    switch (view) {
      case "dashboard":
        router.push("/teacher")
        break
      case "courses":
        router.push("/teacher/courses")
        break
      case "create-course":
        router.push("/teacher/courses/create")
        break
      case "students":
        router.push("/teacher/analytics")
        break
      case "reports":
        router.push("/teacher/reports")
        break
    }
  }

  const sidebarProps = {
    currentView,
    onNavigate: handleNavigate,
    onExit: handleExit,
    teacherName,
  }

  return (
    <PortalShell
      portalTitle="Portal Docente"
      desktopSidebar={
        <TeacherSidebar
          {...sidebarProps}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      }
      renderMobileSidebar={(onClose) => (
        <TeacherSidebar
          {...sidebarProps}
          collapsed={false}
          onToggle={() => {}}
          isMobile
          onMobileClose={onClose}
        />
      )}
    >
      {children}
    </PortalShell>
  )
}
