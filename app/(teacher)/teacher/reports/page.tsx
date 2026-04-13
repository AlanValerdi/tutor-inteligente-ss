import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, AlertTriangle, TrendingUp } from "lucide-react"
import { ReportsSummary } from "@/components/teacher/reports-summary"
import { StudentQuizAttempts } from "@/components/teacher/student-quiz-attempts"

export default async function TeacherReportsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/login")
  }

  // Get all courses taught by this teacher
  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: {
      enrollments: {
        include: {
          user: { select: { id: true, name: true, email: true, studyProfile: true } }
        }
      },
      topics: true
    },
    orderBy: { createdAt: "desc" }
  })

  // Get all quiz attempts for students in teacher's courses
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: {
      quiz: {
        topic: {
          course: {
            teacherId: session.user.id
          }
        }
      }
    },
    include: {
      quiz: { include: { topic: true } },
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { startedAt: "desc" }
  })

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Reportes de Evaluaciones</h1>
        <p className="text-muted-foreground">
          Visualiza resultados detallados de cuestionarios e indicadores de ansiedad estudiantil
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen General
          </TabsTrigger>
          <TabsTrigger value="attempts" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Intentos por Estudiante
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <ReportsSummary 
            courses={courses}
            quizAttempts={quizAttempts}
          />
        </TabsContent>

        {/* Attempts Tab */}
        <TabsContent value="attempts">
          <StudentQuizAttempts 
            quizAttempts={quizAttempts}
            courses={courses}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
