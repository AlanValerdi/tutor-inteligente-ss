import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Users, BookOpen, CheckCircle, UserCheck } from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const [totalUsers, totalCourses, activeCourses, totalEnrollments] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.enrollment.count(),
  ])

  const stats = [
    { label: "Total Usuarios",   value: totalUsers,       icon: Users,       color: "violet" },
    { label: "Total Cursos",     value: totalCourses,     icon: BookOpen,    color: "blue"   },
    { label: "Cursos Activos",   value: activeCourses,    icon: CheckCircle, color: "green"  },
    { label: "Inscripciones",    value: totalEnrollments, icon: UserCheck,   color: "yellow" },
  ] as const

  const colorMap = {
    violet: { bg: "bg-violet-100", icon: "text-violet-600" },
    blue:   { bg: "bg-blue-100",   icon: "text-blue-600"   },
    green:  { bg: "bg-green-100",  icon: "text-green-600"  },
    yellow: { bg: "bg-yellow-100", icon: "text-yellow-600" },
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">Panel Administrativo</h1>
          <p className="text-muted-foreground">Bienvenido, {session.user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorMap[color].bg}`}>
                  <Icon className={`h-5 w-5 ${colorMap[color].icon}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-500">Panel de actividad en desarrollo...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
