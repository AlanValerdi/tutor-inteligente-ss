"use client"

import { GraduationCap, LayoutGrid, BarChart3, BookPlus, LogOut, Users } from "lucide-react"
import { cn } from "@/lib/utils"

type TeacherView = "analytics" | "courses" | "create"

interface TeacherSidebarProps {
  currentView: TeacherView
  onNavigate: (view: TeacherView) => void
  onExit: () => void
}

export function TeacherSidebar({ currentView, onNavigate, onExit }: TeacherSidebarProps) {
  const navItems = [
    { id: "analytics" as const, label: "Student Analytics", icon: BarChart3 },
    { id: "courses" as const, label: "Manage Courses", icon: LayoutGrid },
    { id: "create" as const, label: "Create Topic", icon: BookPlus },
  ]

  return (
    <aside className="flex h-screen w-64 flex-col bg-foreground text-background">
      <div className="flex items-center gap-3 border-b border-background/10 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <GraduationCap className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold text-background">LearnFlow</h2>
          <p className="text-xs text-background/50">Teacher Portal</p>
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
                    ? "bg-background/15 text-background"
                    : "text-background/60 hover:bg-background/10 hover:text-background"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-background/10 px-3 py-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-background">Dr. Smith</p>
            <p className="text-xs text-background/50">Instructor</p>
          </div>
        </div>
        <button
          onClick={onExit}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-background/50 transition-colors hover:bg-background/10 hover:text-background"
        >
          <LogOut className="h-4 w-4" />
          Exit Portal
        </button>
      </div>
    </aside>
  )
}
