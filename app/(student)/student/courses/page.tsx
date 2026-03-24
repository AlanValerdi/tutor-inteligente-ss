import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Users, ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"

export default async function StudentCoursesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  const enrolledCourses = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          _count: {
            select: { topics: true }
          }
        }
      }
    },
    orderBy: { enrolledAt: "desc" }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Cursos</h1>
        <p className="text-muted-foreground">
          Gestiona tus cursos inscritos y continúa tu aprendizaje
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No tienes cursos inscritos</h3>
            <p className="text-muted-foreground text-center mb-4">
              Explora los cursos disponibles y comienza tu camino de aprendizaje.
            </p>
            <Button asChild>
              <Link href="/student">Ir al Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((enrollment) => {
            const course = enrollment.course
            const progress = enrollment.progress

            return (
              <Card key={course.id} className="group hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {course._count.topics} temas
                    </span>
                  </div>
                  <CardTitle className="mt-3 font-display text-base line-clamp-2">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {course.description || "Continúa aprendiendo con este curso"}
                  </p>

                  {/* Teacher info */}
                  <div className="mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {course.teacher.name || "Instructor"}
                    </span>
                  </div>

                  {/* Enrollment date */}
                  <div className="mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Inscrito el {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 mb-4" />

                  <Button asChild className="w-full group-hover:gap-3 transition-all">
                    <Link href={`/student/courses/${course.id}`} className="gap-2">
                      {progress === 0 ? "Comenzar Curso" : "Continuar Aprendiendo"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}