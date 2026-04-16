"use client"

import { BookOpen, TrendingUp, Award, Users, Calculator, Code, Atom, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Mapeo de iconos por categoría de curso
const iconMap: Record<string, React.ElementType> = {
  "Matematicas": Calculator,
  "Ciencias de la Computacion": Code,
  "Ciencias": Atom,
  "default": BookOpen,
}

interface CourseWithProgress {
  id: string
  course: {
    id: string
    title: string
    description: string | null
    teacher: {
      name: string | null
      image: string | null
    }
    topics: {
      id: string
      title: string
      order: number
    }[]
    topicsCount: number
    studentsEnrolled: number
  }
  progress: number
  enrolledAt: Date
}

interface DashboardStats {
  enrolledCourses: number
  totalTopics: number
  averageProgress: number
  completedCourses: number
}

interface StudentDashboardProps {
  stats: DashboardStats
  enrolledCourses: CourseWithProgress[]
  studentName: string
}

export function StudentDashboard({ 
  stats, 
  enrolledCourses,
  studentName 
}: StudentDashboardProps) {
  const router = useRouter()
  
  const handleSelectCourse = (courseId: string) => {
    router.push(`/student/courses/${courseId}`)
  }
  
  const dashboardStats = [
    {
      label: "Cursos Inscritos",
      value: stats.enrolledCourses,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Progreso Promedio",
      value: `${stats.averageProgress}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Temas Totales",
      value: stats.totalTopics,
      icon: Award,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Cursos Completados",
      value: stats.completedCourses,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ]

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">
            ¡Bienvenido de vuelta, {studentName}!
          </h1>
          <p className="text-muted-foreground">
            Continúa tu camino de aprendizaje. Revisa tu progreso y explora nuevos contenidos.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
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

        {/* Courses Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Mis Cursos</h2>
          <span className="text-sm text-muted-foreground">{enrolledCourses.length} cursos</span>
        </div>

        {/* Courses Grid */}
        {enrolledCourses.length === 0 ? (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No tienes cursos inscritos</h3>
              <p className="text-muted-foreground text-center mb-4">
                Explora los cursos disponibles y comienza tu camino de aprendizaje.
              </p>
               <Button 
                 type="button"
                 onClick={(e) => {
                 e.preventDefault()
                 e.stopPropagation()
                 router.push("/student/enroll")
               }}>
                 Inscribirse a Curso
               </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((enrollment) => {
              const course = enrollment.course
              const progress = enrollment.progress
              
              // Determinar icono basado en título o usar default
              const IconComponent = Object.entries(iconMap).find(([category]) => 
                course.title.toLowerCase().includes(category.toLowerCase().split(' ')[0])
              )?.[1] || iconMap.default

              return (
                <Card
                  key={course.id}
                  className="group cursor-pointer border-0 shadow-sm transition-all hover:shadow-md"
                  onClick={() => handleSelectCourse(course.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        {course.topicsCount} temas
                      </span>
                    </div>
                    <CardTitle className="mt-3 font-display text-base">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {course.description || "Continúa aprendiendo con este curso"}
                    </p>
                    
                    {/* Teacher info */}
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center">
                        <Users className="h-3 w-3" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {course.teacher.name || "Instructor"}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 mb-4" />
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 text-primary hover:text-primary hover:bg-primary/5 group-hover:gap-3 transition-all"
                    >
                      {progress === 0 ? "Comenzar Curso" : "Continuar Aprendiendo"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}