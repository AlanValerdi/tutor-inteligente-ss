"use client"

import { GraduationCap, LayoutDashboard, BookOpen, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

type StudentView = "dashboard" | "course" | "topic"

interface StudentSidebarProps {
  currentView: StudentView
  onNavigate: (view: StudentView) => void
  onExit: () => void
  studentName: string
  studentProfile: string
}

export function StudentSidebar({ currentView, onNavigate, onExit, studentName, studentProfile }: StudentSidebarProps) {
  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "course" as const, label: "My Courses", icon: BookOpen },
  ]

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold text-sidebar-foreground">LearnFlow</h2>
          <p className="text-xs text-sidebar-foreground/60">Student Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1" role="list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  currentView === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{studentName}</p>
            <p className="text-xs text-sidebar-foreground/60">{studentProfile} Learner</p>
          </div>
        </div>
        <button
          onClick={onExit}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          Exit Portal
        </button>
      </div>
    </aside>
  )
}
