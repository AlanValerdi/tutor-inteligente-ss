"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings,
  LogOut,
  PlusCircle
} from "lucide-react"

interface SidebarProps {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const studentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/courses", label: "Mis Cursos", icon: BookOpen },
  ]

  const teacherLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/courses", label: "Mis Cursos", icon: BookOpen },
    { href: "/dashboard/courses/create", label: "Crear Curso", icon: PlusCircle },
  ]

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/admin", label: "Admin", icon: Users },
  ]

  const getLinks = () => {
    if (user.role === "ADMIN") return adminLinks
    if (user.role === "TEACHER") return teacherLinks
    return studentLinks
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Tutor IA</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {getLinks().map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || "Usuario"}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{user.role.toLowerCase()}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
