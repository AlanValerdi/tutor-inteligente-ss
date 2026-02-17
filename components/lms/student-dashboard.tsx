"use client"

import { BookOpen, TrendingUp, Clock, Award, Calculator, Code, Atom, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { courses, type StudyProfile } from "@/lib/lms-data"

const iconMap: Record<string, React.ElementType> = {
  Calculator,
  Code,
  Atom,
}

interface StudentDashboardProps {
  profile: StudyProfile
  onSelectCourse: (courseId: string) => void
}

export function StudentDashboard({ profile, onSelectCourse }: StudentDashboardProps) {
  const enrolledCourses = courses

  const completedTopics = enrolledCourses.reduce(
    (acc, c) => acc + c.topics.filter((t) => t.status === "completed").length,
    0
  )
  const totalTopics = enrolledCourses.reduce((acc, c) => acc + c.topics.length, 0)
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  const stats = [
    {
      label: "Cursos Inscritos",
      value: enrolledCourses.length,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Progreso General",
      value: `${overallProgress}%`,
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Temas Completados",
      value: `${completedTopics}/${totalTopics}`,
      icon: Award,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Perfil de Estudio",
      value: profile,
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ]

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">
            Bienvenido de vuelta
          </h1>
          <p className="text-muted-foreground">
            Continua tu camino de aprendizaje. Tu contenido esta personalizado para aprendizaje{" "}
            <span className="font-medium text-primary">{profile}</span>.
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

        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Mis Cursos</h2>
          <span className="text-sm text-muted-foreground">{enrolledCourses.length} cursos</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => {
            const completed = course.topics.filter((t) => t.status === "completed").length
            const courseProgress = Math.round((completed / course.topics.length) * 100)
            const IconComponent = iconMap[course.icon] || BookOpen

            return (
              <Card
                key={course.id}
                className="group cursor-pointer border-0 shadow-sm transition-all hover:shadow-md"
                onClick={() => onSelectCourse(course.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {course.category}
                    </span>
                  </div>
                  <CardTitle className="mt-3 font-display text-base">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {completed}/{course.topics.length} temas
                    </span>
                    <span className="font-medium text-primary">{courseProgress}%</span>
                  </div>
                  <Progress value={courseProgress} className="h-2" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-full gap-2 text-primary hover:text-primary hover:bg-primary/5 group-hover:gap-3 transition-all"
                  >
                    Continuar Aprendiendo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
