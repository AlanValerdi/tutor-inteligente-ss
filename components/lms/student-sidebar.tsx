"use client"

import { GraduationCap, LayoutDashboard, BookOpen, User, LogOut, PanelLeftClose, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type StudentView = "dashboard" | "course" | "topic"

interface StudentSidebarProps {
  currentView: StudentView
  onNavigate: (view: StudentView) => void
  onExit: () => void
  studentName: string
  studentProfile: string
  collapsed: boolean
  onToggle: () => void
}

export function StudentSidebar({ currentView, onNavigate, onExit, studentName, studentProfile, collapsed, onToggle }: StudentSidebarProps) {
  const navItems = [
    { id: "dashboard" as const, label: "Panel Principal", icon: LayoutDashboard },
    { id: "course" as const, label: "Mis Cursos", icon: BookOpen },
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className={cn(
          "flex items-center border-b border-sidebar-border px-3 py-5",
          collapsed ? "justify-center" : "gap-3 px-5"
        )}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-semibold text-sidebar-foreground">LearnFlow</h2>
              <p className="text-xs text-sidebar-foreground/60">Portal Estudiante</p>
            </div>
          )}
        </div>

        <div className={cn("px-3 pt-3", collapsed ? "flex justify-center" : "flex justify-end")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            <span className="sr-only">{collapsed ? "Expandir menu" : "Colapsar menu"}</span>
          </Button>
        </div>

        <nav className="flex-1 px-3 py-2">
          <ul className="flex flex-col gap-1" role="list">
            {navItems.map((item) => {
              const btn = (
                <button
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    currentView === item.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </button>
              )

              return (
                <li key={item.id}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : btn}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border px-3 py-4">
          {!collapsed && (
            <div className="mb-3 flex items-center gap-3 px-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{studentName}</p>
                <p className="text-xs text-sidebar-foreground/60">Aprendiz {studentProfile}</p>
              </div>
            </div>
          )}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onExit}
                  className="flex w-full items-center justify-center rounded-lg py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Salir del Portal</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={onExit}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              Salir del Portal
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
