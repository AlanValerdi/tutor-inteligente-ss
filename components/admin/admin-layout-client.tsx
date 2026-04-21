"use client"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
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

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar
        currentPath={pathname}
        onNavigate={(path) => router.push(path)}
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
