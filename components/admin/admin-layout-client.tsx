"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
  adminName: string
}

export function AdminLayoutClient({ children, adminName }: AdminLayoutProps) {
  const [currentView, setCurrentView] = useState<"dashboard" | "users" | "courses" | "reports" | "settings">("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()

  const handleExit = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      router.push("/login")
    }
  }

  const handleNavigate = (view: "dashboard" | "users" | "courses" | "reports" | "settings") => {
    setCurrentView(view)
    // TODO: Implement navigation logic for different admin views
    console.log("Navigate to:", view)
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onExit={handleExit}
        adminName={adminName}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}