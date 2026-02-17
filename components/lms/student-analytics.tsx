"use client"

import { useState } from "react"
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
  Search,
  Eye,
  Ear,
  Hand,
  ArrowUpDown,
  SquareArrowOutUpRightIcon,
} from "lucide-react"
import {
  Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { students, courses, sessionLabels, type Student, type StudyProfile, type AnxietyLevel } from "@/lib/lms-data"

const profileIcons: Record<StudyProfile, React.ElementType> = {
  Visual: Eye,
  Auditivo: Ear,
  Kinestesico: Hand,
}

const profileColors: Record<StudyProfile, string> = {
  Visual: "bg-accent/10 text-accent",
  Auditivo: "bg-primary/10 text-primary",
  Kinestesico: "bg-warning/10 text-warning-foreground",
}

const anxietyColors: Record<AnxietyLevel, { bg: string; text: string; dot: string }> = {
  Bajo: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  Medio: { bg: "bg-warning/10", text: "text-warning-foreground", dot: "bg-warning" },
  Alto: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
}

type SortKey = "name" | "score" | "progress" | "anxiety"

// Compute CSS variable colors in JS for Recharts
const CHART_COLORS = {
  primary: "#2a9d7c",
  accent: "#2596be",
  warning: "#e6a817",
  destructive: "#e53935",
  success: "#35a06e",
  muted: "#9ca3af",
}

export function StudentAnalytics() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortAsc, setSortAsc] = useState(true)

  // Profile dialog state
  const [profileDialogStudent, setProfileDialogStudent] = useState<Student | null>(null)
  const [pendingProfileChange, setPendingProfileChange] = useState<StudyProfile | null>(null)
  const [showProfileAlert, setShowProfileAlert] = useState(false)

  // Anxiety dialog state
  const [anxietyDialogStudent, setAnxietyDialogStudent] = useState<Student | null>(null)

  // Local student overrides for profile changes
  const [profileOverrides, setProfileOverrides] = useState<Record<string, StudyProfile>>({})

  const getStudentProfile = (student: Student): StudyProfile => {
    return profileOverrides[student.id] ?? student.profile
  }

  const filteredStudents = students
    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1
      switch (sortKey) {
        case "name":
          return dir * a.name.localeCompare(b.name)
        case "score":
          return dir * (a.averageScore - b.averageScore)
        case "progress":
          return dir * (a.progress - b.progress)
        case "anxiety": {
          const order: Record<AnxietyLevel, number> = { Bajo: 0, Medio: 1, Alto: 2 }
          return dir * (order[a.anxietyLevel] - order[b.anxietyLevel])
        }
        default:
          return 0
      }
    })

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const totalStudents = students.length
  const avgScore = Math.round(students.reduce((acc, s) => acc + s.averageScore, 0) / totalStudents)
  const highAnxiety = students.filter((s) => s.anxietyLevel === "Alto").length
  const avgProgress = Math.round(students.reduce((acc, s) => acc + s.progress, 0) / totalStudents)

  const stats = [
    { label: "Total Estudiantes", value: totalStudents, icon: Users, color: "text-accent", bg: "bg-accent/10" },
    { label: "Prom. Puntaje", value: `${avgScore}%`, icon: Award, color: "text-primary", bg: "bg-primary/10" },
    { label: "Ansiedad Alta", value: highAnxiety, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Prom. Progreso", value: `${avgProgress}%`, icon: TrendingUp, color: "text-success", bg: "bg-success/10" },
  ]

  const handleConfirmProfileChange = () => {
    if (profileDialogStudent && pendingProfileChange) {
      setProfileOverrides((prev) => ({ ...prev, [profileDialogStudent.id]: pendingProfileChange }))
    }
    setShowProfileAlert(false)
    setPendingProfileChange(null)
  }

  // Build radar data for profile dialog
  const getProfileRadarData = (student: Student) => [
    { profile: "Visual", value: student.profileScores.Visual },
    { profile: "Auditivo", value: student.profileScores.Auditivo },
    { profile: "Kinestesico", value: student.profileScores.Kinestesico },
  ]

  // Build bar data for profile comparison
  const getProfileBarData = (student: Student) => [
    { name: "Visual", puntaje: student.profileScores.Visual, fill: CHART_COLORS.accent },
    { name: "Auditivo", puntaje: student.profileScores.Auditivo, fill: CHART_COLORS.primary },
    { name: "Kinestesico", puntaje: student.profileScores.Kinestesico, fill: CHART_COLORS.warning },
  ]

  // Build line data for anxiety metrics
  const getAnxietyLineData = (student: Student) =>
    sessionLabels.map((label, i) => ({
      session: label,
      cambiosPestana: student.anxietyMetrics.tabSwitches[i],
      clicsConsecutivos: student.anxietyMetrics.consecutiveClicks[i],
      clicsFallidos: student.anxietyMetrics.missedClicks[i],
      tiempoPorPregunta: student.anxietyMetrics.timePerQuestion[i],
      tiempoInactivo: student.anxietyMetrics.idleTime[i],
      reversasScroll: student.anxietyMetrics.scrollReversals[i],
    }))

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">Analitica de Estudiantes</h1>
          <p className="text-muted-foreground">
            Monitorea el rendimiento estudiantil, perfiles de aprendizaje y metricas de interaccion.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-xl font-bold text-card-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="font-display text-lg">Estudiantes Inscritos</CardTitle>
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar estudiantes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-3" onClick={() => toggleSort("name")}>
                        Estudiante <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Perfil</span>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-3" onClick={() => toggleSort("anxiety")}>
                        Nv. Ansiedad <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-3" onClick={() => toggleSort("score")}>
                        Prom. Puntaje <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-3" onClick={() => toggleSort("progress")}>
                        Progreso <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cursos</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const currentProfile = getStudentProfile(student)
                    const ProfileIcon = profileIcons[currentProfile]
                    const anxiety = anxietyColors[student.anxietyLevel]

                    return (
                      <tr key={student.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {student.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-card-foreground">{student.name}</span>
                          </div>
                        </td>

                        {/* Profile Badge with "show more" icon */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${profileColors[currentProfile]}`}>
                            <ProfileIcon className="h-3 w-3" />
                            {currentProfile}
                            <button
                              onClick={() => setProfileDialogStudent(student)}
                              className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                              aria-label="Ver detalle de perfil"
                            >
                              <SquareArrowOutUpRightIcon className="h-3 w-3" />
                            </button>
                          </span>
                        </td>

                        {/* Anxiety Level with "show more" icon */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${anxiety.bg} ${anxiety.text}`}>
                            <span className={`h-2 w-2 rounded-full ${anxiety.dot}`} />
                            {student.anxietyLevel}
                            <button
                              onClick={() => setAnxietyDialogStudent(student)}
                              className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                              aria-label="Ver metricas de ansiedad"
                            >
                              <SquareArrowOutUpRightIcon className="h-3 w-3" />
                            </button>
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${student.averageScore >= 85 ? "text-success" : student.averageScore >= 70 ? "text-warning-foreground" : "text-destructive"
                            }`}>
                            {student.averageScore}%
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Progress value={student.progress} className="h-2 w-24" />
                            <span className="text-sm text-muted-foreground">{student.progress}%</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {student.enrolledCourses.map((courseId) => {
                              const course = courses.find((c) => c.id === courseId)
                              return course ? (
                                <span key={courseId} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  {course.title.split(" ")[0]}
                                </span>
                              ) : null
                            })}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- PROFILE DIALOG ---- */}
      <Dialog open={!!profileDialogStudent} onOpenChange={(open) => { if (!open) setProfileDialogStudent(null) }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Perfil de Aprendizaje &mdash; {profileDialogStudent?.name}
            </DialogTitle>
            <DialogDescription>
              Estadisticas de rendimiento por perfil y opcion de cambio manual.
            </DialogDescription>
          </DialogHeader>

          {profileDialogStudent && (
            <Tabs defaultValue="estadisticas" className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="estadisticas">Estadisticas</TabsTrigger>
                <TabsTrigger value="cambiar">Cambiar Perfil</TabsTrigger>
              </TabsList>

              <TabsContent value="estadisticas" className="mt-4 flex flex-col gap-6">
                {/* Radar chart */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Distribucion de Puntajes por Perfil
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        value: { label: "Puntaje", color: CHART_COLORS.primary },
                      }}
                      className="h-[260px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getProfileRadarData(profileDialogStudent)}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="profile" tick={{ fontSize: 12 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Radar
                            name="Puntaje"
                            dataKey="value"
                            stroke={CHART_COLORS.primary}
                            fill={CHART_COLORS.primary}
                            fillOpacity={0.25}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Bar chart comparison */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Comparacion de Puntajes entre Perfiles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        puntaje: { label: "Puntaje", color: CHART_COLORS.primary },
                      }}
                      className="h-[220px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getProfileBarData(profileDialogStudent)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="puntaje" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>

                    <div className="mt-4 rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-card-foreground">Perfil asignado actual: </span>
                        {getStudentProfile(profileDialogStudent)}
                        {" "}&mdash;{" "}
                        El puntaje mas alto determina el perfil recomendado. Si necesitas cambiarlo manualmente, usa la pestana &quot;Cambiar Perfil&quot;.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cambiar" className="mt-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Cambiar Perfil Manualmente</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Selecciona un nuevo perfil de aprendizaje para este estudiante. Esta accion sobreescribe el perfil detectado automaticamente.
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {(["Visual", "Auditivo", "Kinestesico"] as StudyProfile[]).map((p) => {
                      const Icon = profileIcons[p]
                      const isCurrent = getStudentProfile(profileDialogStudent) === p
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            if (!isCurrent) {
                              setPendingProfileChange(p)
                              setShowProfileAlert(true)
                            }
                          }}
                          className={`flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${isCurrent
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30 hover:bg-primary/5"
                            }`}
                        >
                          <Icon className={`h-5 w-5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${isCurrent ? "text-primary" : "text-card-foreground"}`}>
                              {p}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p === "Visual" && "Aprende mejor con imagenes, diagramas y videos."}
                              {p === "Auditivo" && "Aprende mejor escuchando explicaciones y audios."}
                              {p === "Kinestesico" && "Aprende mejor con practica e interaccion directa."}
                            </p>
                          </div>
                          {isCurrent && (
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              Actual
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert for profile change confirmation */}
      <AlertDialog open={showProfileAlert} onOpenChange={setShowProfileAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Cambio de Perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Estas a punto de cambiar el perfil de aprendizaje de <span className="font-semibold">{profileDialogStudent?.name}</span> de{" "}
              <span className="font-semibold">{profileDialogStudent && getStudentProfile(profileDialogStudent)}</span> a{" "}
              <span className="font-semibold">{pendingProfileChange}</span>.
              Esto afectara el tipo de contenido que el estudiante recibira. Esta accion puede deshacerse cambiando el perfil nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingProfileChange(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmProfileChange}>
              Confirmar Cambio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ---- ANXIETY METRICS DIALOG ---- */}
      <Dialog open={!!anxietyDialogStudent} onOpenChange={(open) => { if (!open) setAnxietyDialogStudent(null) }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Metricas de Ansiedad &mdash; {anxietyDialogStudent?.name}
            </DialogTitle>
            <DialogDescription>
              Todas las metricas de interaccion del estudiante a lo largo de las ultimas 10 sesiones.
            </DialogDescription>
          </DialogHeader>

          {anxietyDialogStudent && (
            <div className="mt-2 flex flex-col gap-6">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Prom. Cambios de Pestana</p>
                  <p className="font-display text-lg font-bold text-card-foreground">
                    {(anxietyDialogStudent.anxietyMetrics.tabSwitches.reduce((a, b) => a + b, 0) / 10).toFixed(1)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Prom. Clics Consecutivos</p>
                  <p className="font-display text-lg font-bold text-card-foreground">
                    {(anxietyDialogStudent.anxietyMetrics.consecutiveClicks.reduce((a, b) => a + b, 0) / 10).toFixed(1)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Prom. Clics Fallidos</p>
                  <p className="font-display text-lg font-bold text-card-foreground">
                    {(anxietyDialogStudent.anxietyMetrics.missedClicks.reduce((a, b) => a + b, 0) / 10).toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Tab switches + Consecutive clicks (line chart) */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cambios de Pestana y Clics Consecutivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      cambiosPestana: { label: "Cambios de Pestana", color: CHART_COLORS.accent },
                      clicsConsecutivos: { label: "Clics Consecutivos", color: CHART_COLORS.destructive },
                    }}
                    className="h-[200px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getAnxietyLineData(anxietyDialogStudent)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="cambiosPestana" stroke={CHART_COLORS.accent} strokeWidth={2} dot={{ r: 3 }} name="Cambios de Pestana" />
                        <Line type="monotone" dataKey="clicsConsecutivos" stroke={CHART_COLORS.destructive} strokeWidth={2} dot={{ r: 3 }} name="Clics Consecutivos" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Missed clicks + Scroll reversals (bar chart) */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Clics Fallidos y Reversas de Scroll
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      clicsFallidos: { label: "Clics Fallidos", color: CHART_COLORS.warning },
                      reversasScroll: { label: "Reversas de Scroll", color: CHART_COLORS.muted },
                    }}
                    className="h-[200px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getAnxietyLineData(anxietyDialogStudent)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="clicsFallidos" fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} name="Clics Fallidos" />
                        <Bar dataKey="reversasScroll" fill={CHART_COLORS.muted} radius={[4, 4, 0, 0]} name="Reversas de Scroll" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Time per question + Idle time (line chart) */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tiempo por Pregunta y Tiempo Inactivo (segundos)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      tiempoPorPregunta: { label: "Tiempo por Pregunta", color: CHART_COLORS.primary },
                      tiempoInactivo: { label: "Tiempo Inactivo", color: CHART_COLORS.success },
                    }}
                    className="h-[200px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getAnxietyLineData(anxietyDialogStudent)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="session" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="tiempoPorPregunta" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ r: 3 }} name="Tiempo por Pregunta" />
                        <Line type="monotone" dataKey="tiempoInactivo" stroke={CHART_COLORS.success} strokeWidth={2} dot={{ r: 3 }} name="Tiempo Inactivo" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
