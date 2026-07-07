"use client"

import {
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  Users,
  BarChart3,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type TeacherView = "dashboard" | "courses" | "create-course" | "students" | "reports"

interface TeacherSidebarProps {
  currentView: TeacherView
  onNavigate: (view: TeacherView) => void
  onExit: () => void
  teacherName: string
  collapsed: boolean
  onToggle: () => void
  isMobile?: boolean
  onMobileClose?: () => void
}

export function TeacherSidebar({
  currentView,
  onNavigate,
  onExit,
  teacherName,
  collapsed,
  onToggle,
  isMobile = false,
  onMobileClose,
}: TeacherSidebarProps) {
  const navItems = [
    { id: "dashboard" as const, label: "Panel Principal", icon: LayoutDashboard },
    { id: "create-course" as const, label: "Crear Curso", icon: PlusCircle },
    { id: "students" as const, label: "Estudiantes", icon: Users },
    { id: "reports" as const, label: "Reportes", icon: BarChart3 },
  ]

  const expanded = isMobile || !collapsed

  const handleNavigate = (view: TeacherView) => {
    onNavigate(view)
    onMobileClose?.()
  }

  const handleExit = () => {
    onExit()
    onMobileClose?.()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col bg-blue-900 text-white transition-all duration-300",
          expanded ? "w-64" : "w-16"
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-blue-700 px-3 py-5",
            expanded ? "gap-3 px-5" : "justify-center"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700">
            <GraduationCap className="h-5 w-5 text-blue-100" />
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-semibold text-white">Gestor inteligente</h2>
              <p className="text-xs text-blue-300">Portal Docente</p>
            </div>
          )}
        </div>

        {!isMobile && (
          <div className={cn("hidden px-3 pt-3 md:flex", expanded ? "justify-end" : "justify-center")}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 text-blue-300 hover:bg-blue-800 hover:text-white"
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              <span className="sr-only">{collapsed ? "Expandir menu" : "Colapsar menu"}</span>
            </Button>
          </div>
        )}

        <nav className="flex-1 px-3 py-2">
          <ul className="flex flex-col gap-1" role="list">
            {navItems.map((item) => {
              const btn = (
                <button
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    !expanded && "justify-center px-0",
                    currentView === item.id
                      ? "bg-blue-700 text-white"
                      : "text-blue-200 hover:bg-blue-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {expanded && item.label}
                </button>
              )

              return (
                <li key={item.id}>
                  {!expanded && !isMobile ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    btn
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-blue-700 px-3 py-4">
          {expanded && (
            <div className="mb-3 flex items-center gap-3 px-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{teacherName}</p>
                <p className="text-xs text-blue-300">Profesor</p>
              </div>
            </div>
          )}
          {!expanded && !isMobile ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleExit}
                  className="flex w-full items-center justify-center rounded-lg py-2 text-sm text-blue-300 transition-colors hover:bg-blue-800 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Cerrar Sesión</TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={handleExit}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-blue-300 transition-colors hover:bg-blue-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
