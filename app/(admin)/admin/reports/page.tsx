import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Users, Star, CheckCircle, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

type AnxietyLevel = "Bajo" | "Medio" | "Alto"

const anxietyColor: Record<AnxietyLevel, string> = {
  Bajo:  "bg-green-100 text-green-700 border-0",
  Medio: "bg-yellow-100 text-yellow-700 border-0",
  Alto:  "bg-red-100 text-red-700 border-0",
}

export default async function AdminReportsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const [
    totalStudents,
    scoreAgg,
    totalAttempts,
    passedAttempts,
    totalSessions,
    visualCount,
    auditivoCount,
    kinestesicoCount,
    bajoCount,
    medioCount,
    altoCount,
    publishedCourses,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.enrollment.aggregate({ _avg: { averageScore: true } }),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.count({ where: { passed: true } }),
    prisma.interactionSession.count(),
    prisma.enrollment.count({ where: { studyProfile: "Visual" } }),
    prisma.enrollment.count({ where: { studyProfile: "Auditivo" } }),
    prisma.enrollment.count({ where: { studyProfile: "Kinestesico" } }),
    prisma.enrollment.count({ where: { anxietyLevel: "Bajo" } }),
    prisma.enrollment.count({ where: { anxietyLevel: "Medio" } }),
    prisma.enrollment.count({ where: { anxietyLevel: "Alto" } }),
    prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        enrollments: {
          select: { progress: true, averageScore: true, anxietyLevel: true },
        },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 10,
    }),
  ])

  const avgScore = Math.round(scoreAgg._avg.averageScore ?? 0)
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0

  const stats = [
    { label: "Total Estudiantes", value: totalStudents,  icon: Users,        color: "violet" },
    { label: "Promedio General",  value: `${avgScore}%`, icon: Star,         color: "blue"   },
    { label: "Tasa de Aprobación",value: `${passRate}%`, icon: CheckCircle,  color: "green"  },
    { label: "Sesiones",          value: totalSessions,  icon: Activity,     color: "yellow" },
  ] as const

  const colorMap = {
    violet: { bg: "bg-violet-100", icon: "text-violet-600" },
    blue:   { bg: "bg-blue-100",   icon: "text-blue-600"   },
    green:  { bg: "bg-green-100",  icon: "text-green-600"  },
    yellow: { bg: "bg-yellow-100", icon: "text-yellow-600" },
  }

  const totalProfiles = visualCount + auditivoCount + kinestesicoCount
  const studyProfiles = [
    { label: "Visual",       count: visualCount,       color: "bg-violet-500" },
    { label: "Auditivo",     count: auditivoCount,     color: "bg-blue-500"   },
    { label: "Kinestésico",  count: kinestesicoCount,  color: "bg-green-500"  },
  ]

  const totalAnxiety = bajoCount + medioCount + altoCount
  const anxietyLevels = [
    { label: "Bajo",  count: bajoCount,  color: "bg-green-500"  },
    { label: "Medio", count: medioCount, color: "bg-yellow-500" },
    { label: "Alto",  count: altoCount,  color: "bg-red-500"    },
  ]

  const coursePerf = publishedCourses.map((course) => {
    const n = course.enrollments.length
    if (n === 0) return { id: course.id, title: course.title, inscritos: 0, progreso: 0, score: 0, ansiedad: null }

    const progreso = Math.round(course.enrollments.reduce((s, e) => s + e.progress, 0) / n)
    const score    = Math.round(course.enrollments.reduce((s, e) => s + e.averageScore, 0) / n)

    const counts: Record<AnxietyLevel, number> = { Bajo: 0, Medio: 0, Alto: 0 }
    course.enrollments.forEach((e) => counts[e.anxietyLevel as AnxietyLevel]++)
    const ansiedad = (Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0]) as AnxietyLevel

    return { id: course.id, title: course.title, inscritos: n, progreso, score, ansiedad }
  })

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">Analíticas generales de la plataforma</p>
        </div>

        {/* Stats cards */}
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

        {/* Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Study profiles */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Perfiles de Estudio</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Distribución por inscripción — {totalProfiles} registros
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              {studyProfiles.map(({ label, count, color }) => {
                const pct = totalProfiles > 0 ? Math.round((count / totalProfiles) * 100) : 0
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{label}</span>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-2 ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {totalProfiles === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Sin datos de perfiles aún</p>
              )}
            </div>
          </div>

          {/* Anxiety levels */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Niveles de Ansiedad</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Distribución por inscripción — {totalAnxiety} registros
              </p>
            </div>
            <div className="px-6 py-5 space-y-4">
              {anxietyLevels.map(({ label, count, color }) => {
                const pct = totalAnxiety > 0 ? Math.round((count / totalAnxiety) * 100) : 0
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{label}</span>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-2 ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {totalAnxiety === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Sin datos de ansiedad aún</p>
              )}
            </div>
          </div>
        </div>

        {/* Course performance table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Rendimiento por Curso</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Solo cursos publicados — top 10 por inscripciones</p>
          </div>
          <div className="px-6 py-4">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead className="text-center">Inscritos</TableHead>
                    <TableHead>Progreso prom.</TableHead>
                    <TableHead className="text-center">Score prom.</TableHead>
                    <TableHead>Ansiedad dom.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coursePerf.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No hay cursos publicados con inscripciones
                      </TableCell>
                    </TableRow>
                  )}
                  {coursePerf.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell className="text-center">{c.inscritos}</TableCell>
                      <TableCell>
                        {c.inscritos > 0 ? (
                          <div className="flex items-center gap-2">
                            <Progress value={c.progreso} className="h-2 w-24" />
                            <span className="text-sm text-muted-foreground">{c.progreso}%</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {c.inscritos > 0 ? `${c.score}%` : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {c.ansiedad ? (
                          <Badge className={anxietyColor[c.ansiedad]}>{c.ansiedad}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
