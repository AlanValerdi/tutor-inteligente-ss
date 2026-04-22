import type React from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Users, BookOpen, CheckCircle, UserCheck, FileText, GraduationCap } from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [totalUsers, totalCourses, activeCourses, totalEnrollments, newCourses, newEnrollments, newTopics] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.enrollment.count(),
    prisma.course.findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, title: true, createdAt: true, teacher: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { enrolledAt: { gte: since } },
      select: { id: true, enrolledAt: true, user: { select: { name: true } }, course: { select: { title: true } } },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.topic.findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, title: true, createdAt: true, course: { select: { title: true, teacher: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ])

  type ActivityType = "course_created" | "enrollment" | "topic_added"

  const activities = [
    ...newCourses.map((c) => ({
      id: `course-${c.id}`,
      type: "course_created" as ActivityType,
      actor: c.teacher.name ?? "Un profesor",
      message: `creó el curso`,
      subject: c.title,
      timestamp: c.createdAt,
    })),
    ...newEnrollments.map((e) => ({
      id: `enrollment-${e.id}`,
      type: "enrollment" as ActivityType,
      actor: e.user.name ?? "Un estudiante",
      message: `se inscribió al curso`,
      subject: e.course.title,
      timestamp: e.enrolledAt,
    })),
    ...newTopics.map((t) => ({
      id: `topic-${t.id}`,
      type: "topic_added" as ActivityType,
      actor: t.course.teacher.name ?? "Un profesor",
      message: `agregó el tema`,
      subject: `${t.title} → ${t.course.title}`,
      timestamp: t.createdAt,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  function relativeTime(date: Date): string {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60_000)
    if (minutes < 1) return "hace un momento"
    if (minutes < 60) return `hace ${minutes} min`
    const hours = Math.floor(minutes / 60)
    return `hace ${hours}h`
  }

  const activityConfig: Record<ActivityType, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
    course_created: { icon: BookOpen,      iconBg: "bg-blue-100",   iconColor: "text-blue-600"   },
    enrollment:     { icon: GraduationCap, iconBg: "bg-green-100",  iconColor: "text-green-600"  },
    topic_added:    { icon: FileText,      iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  }

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
            <p className="text-sm text-muted-foreground mt-0.5">Últimas 24 horas</p>
          </div>
          <div className="px-6 py-4">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">Sin actividad en las últimas 24 horas</p>
            ) : (
              <ul className="space-y-4">
                {activities.map((activity) => {
                  const { icon: Icon, iconBg, iconColor } = activityConfig[activity.type]
                  return (
                    <li key={activity.id} className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">{activity.actor}</span>
                          {" "}{activity.message}{" "}
                          <span className="font-medium">"{activity.subject}"</span>
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                        {relativeTime(activity.timestamp)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
