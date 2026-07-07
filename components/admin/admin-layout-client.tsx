"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { PortalShell } from "@/components/layout/portal-shell"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
  adminName: string
}

export function AdminLayoutClient({ children, adminName }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleExit = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      router.push("/login")
    }
  }

  const sidebarProps = {
    currentPath: pathname ?? "",
    onNavigate: (path: string) => router.push(path),
    onExit: handleExit,
    adminName,
  }

  return (
    <PortalShell
      portalTitle="TutorIA Admin"
      desktopSidebar={
        <AdminSidebar
          {...sidebarProps}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      }
      renderMobileSidebar={(onClose) => (
        <AdminSidebar
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
