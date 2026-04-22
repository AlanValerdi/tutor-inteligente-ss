"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { AlertTriangle, Users, BookOpen, TrendingUp } from "lucide-react"

interface QuizAttempt {
  id: string
  score: number
  passed: boolean
  tabSwitches: number
  consecutiveClicks: number
  missedClicks: number
  idleTimeSeconds: number
  scrollReversals: number
  quiz: {
    title: string
    topic: { id: string; courseId: string }
  }
  user: { id: string; name: string; email: string }
  startedAt: Date
}

interface Course {
  id: string
  title: string
  enrollments: Array<{ user: { id: string; name: string; email: string; studyProfile: string } }>
  topics: Array<{ id: string }>
}

interface ReportsSummaryProps {
  courses: Course[]
  quizAttempts: QuizAttempt[]
}

export function ReportsSummary({ courses, quizAttempts }: ReportsSummaryProps) {
  // Calculate anxiety level
  const getAnxietyLevel = (attempt: QuizAttempt) => {
    const { tabSwitches, consecutiveClicks, missedClicks, scrollReversals } = attempt
    const score = 
      (tabSwitches > 5 ? 2 : tabSwitches > 2 ? 1 : 0) +
      (consecutiveClicks > 3 ? 2 : consecutiveClicks > 1 ? 1 : 0) +
      (missedClicks > 5 ? 2 : missedClicks > 2 ? 1 : 0) +
      (scrollReversals > 10 ? 2 : scrollReversals > 5 ? 1 : 0)

    if (score >= 6) return { level: "Alto", color: "text-red-600", bgColor: "bg-red-100" }
    if (score >= 3) return { level: "Medio", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    return { level: "Bajo", color: "text-green-600", bgColor: "bg-green-100" }
  }

  // Calculate statistics
  const totalAttempts = quizAttempts.length
  const passedAttempts = quizAttempts.filter(a => a.passed).length
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0
  
  const anxietyLevels = quizAttempts.map(a => getAnxietyLevel(a))
  const highAnxiety = anxietyLevels.filter(a => a.level === "Alto").length
  const mediumAnxiety = anxietyLevels.filter(a => a.level === "Medio").length
  const lowAnxiety = anxietyLevels.filter(a => a.level === "Bajo").length

  // Data for anxiety distribution chart
  const anxietyDistribution = [
    { name: "Alto", value: highAnxiety, fill: "#dc2626" },
    { name: "Medio", value: mediumAnxiety, fill: "#eab308" },
    { name: "Bajo", value: lowAnxiety, fill: "#16a34a" }
  ]

  // Data for anxiety metrics chart (average per metric)
  const avgMetrics = {
    tabSwitches: Math.round(quizAttempts.reduce((a, b) => a + b.tabSwitches, 0) / totalAttempts),
    consecutiveClicks: Math.round(quizAttempts.reduce((a, b) => a + b.consecutiveClicks, 0) / totalAttempts),
    missedClicks: Math.round(quizAttempts.reduce((a, b) => a + b.missedClicks, 0) / totalAttempts),
    idleTimeSeconds: Math.round(quizAttempts.reduce((a, b) => a + b.idleTimeSeconds, 0) / totalAttempts),
    scrollReversals: Math.round(quizAttempts.reduce((a, b) => a + b.scrollReversals, 0) / totalAttempts)
  }

  const metricsData = [
    { name: "C. Pestaña", value: avgMetrics.tabSwitches },
    { name: "C. Consecutivos", value: avgMetrics.consecutiveClicks },
    { name: "C. Perdidos", value: avgMetrics.missedClicks },
    { name: "T. Inactivo (s)", value: avgMetrics.idleTimeSeconds },
    { name: "Rev. Scroll", value: avgMetrics.scrollReversals }
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Intentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAttempts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {passedAttempts} aprobados ({passRate}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(quizAttempts.map(a => a.user.id)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estudiantes evaluados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Ansiedad Alta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{highAnxiety}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalAttempts > 0 ? Math.round((highAnxiety / totalAttempts) * 100) : 0}% de intentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tasa de Aprobación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{passRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {passedAttempts} de {totalAttempts} aprobados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anxiety Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Niveles de Ansiedad</CardTitle>
            <CardDescription>
              Proporción de intentos por nivel de ansiedad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={anxietyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                >
                  {anxietyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend
                  formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Ansiedad Promedio</CardTitle>
            <CardDescription>
              Valores promedio en todos los intentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricsData} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} interval={0} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* High Anxiety Students Alert */}
      {highAnxiety > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Estudiantes con Ansiedad Alta Detectada
            </CardTitle>
            <CardDescription className="text-red-600">
              {highAnxiety} intentos muestran indicadores de ansiedad alta. Considera proporcionar apoyo adicional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizAttempts
                .map((attempt, i) => ({ ...attempt, anxiety: getAnxietyLevel(attempt) }))
                .filter(a => a.anxiety.level === "Alto")
                .slice(0, 5)
                .map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                    <div>
                      <p className="font-medium">{attempt.user.name}</p>
                      <p className="text-sm text-muted-foreground">{attempt.quiz.title}</p>
                    </div>
                    <Badge className={attempt.anxiety.bgColor + " " + attempt.anxiety.color}>
                      {attempt.anxiety.level}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
