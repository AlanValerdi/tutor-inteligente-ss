"use client"

import { StudentLayoutSidebar } from "@/components/lms/student-layout-sidebar"
import { PortalShell } from "@/components/layout/portal-shell"
import { useState } from "react"

interface StudentLayoutClientProps {
  children: React.ReactNode
  studentName: string
  studyProfile: string
}

export function StudentLayoutClient({
  children,
  studentName,
  studyProfile,
}: StudentLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const sidebarProps = {
    studentName,
    studyProfile,
  }

  return (
    <PortalShell
      portalTitle="Portal Estudiante"
      desktopSidebar={
        <StudentLayoutSidebar
          {...sidebarProps}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      }
      renderMobileSidebar={(onClose) => (
        <StudentLayoutSidebar
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
