"use client"

import {
  Shield,
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { path: "/admin", label: "Panel Principal", icon: LayoutDashboard, exact: true },
  { path: "/admin/users", label: "Usuarios", icon: Users, exact: false },
  { path: "/admin/courses", label: "Cursos", icon: BookOpen, exact: false },
  { path: "/admin/reports", label: "Reportes", icon: BarChart3, exact: false },
  { path: "/admin/settings", label: "Configuración", icon: Settings, exact: false },
]

interface AdminSidebarProps {
  currentPath: string
  onNavigate: (path: string) => void
  onExit: () => void
  adminName: string
  collapsed: boolean
  onToggle: () => void
  isMobile?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({
  currentPath,
  onNavigate,
  onExit,
  adminName,
  collapsed,
  onToggle,
  isMobile = false,
  onMobileClose,
}: AdminSidebarProps) {
  const isActive = (item: (typeof navItems)[0]) =>
    item.exact ? currentPath === item.path : currentPath.startsWith(item.path)

  const expanded = isMobile || !collapsed

  const handleNavigate = (path: string) => {
    onNavigate(path)
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
          "flex h-screen flex-col bg-violet-900 text-white transition-all duration-300",
          expanded ? "w-64" : "w-16"
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-violet-700 px-3 py-5",
            expanded ? "gap-3 px-5" : "justify-center"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-700">
            <Shield className="h-5 w-5 text-violet-100" />
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-semibold text-white">TutorIA Admin</h2>
              <p className="text-xs text-violet-300">Panel Administrativo</p>
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
              className="h-8 w-8 text-violet-300 hover:bg-violet-800 hover:text-white"
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              <span className="sr-only">{collapsed ? "Expandir menu" : "Colapsar menu"}</span>
            </Button>
          </div>
        )}

        <nav className="flex-1 px-3 py-2">
          <ul className="flex flex-col gap-1" role="list">
            {navItems.map((item) => {
              const active = isActive(item)
              const btn = (
                <button
                  type="button"
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    !expanded && "justify-center px-0",
                    active
                      ? "bg-violet-700 text-white"
                      : "text-violet-200 hover:bg-violet-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {expanded && item.label}
                </button>
              )

              return (
                <li key={item.path}>
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

        <div className="border-t border-violet-700 px-3 py-4">
          {expanded && (
            <div className="mb-3 flex items-center gap-3 px-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-700 text-xs font-semibold text-white">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{adminName}</p>
                <p className="text-xs text-violet-300">Administrador</p>
              </div>
            </div>
          )}
          {!expanded && !isMobile ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleExit}
                  className="flex w-full items-center justify-center rounded-lg py-2 text-sm text-violet-300 transition-colors hover:bg-violet-800 hover:text-white"
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
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-violet-300 transition-colors hover:bg-violet-800 hover:text-white"
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
