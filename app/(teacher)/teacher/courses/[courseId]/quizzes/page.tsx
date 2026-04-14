import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CourseQuizManager } from "@/components/teacher/course-quiz-manager"

interface CourseQuizzesPageProps {
  params: Promise<{
    courseId: string
  }>
}

export default async function CourseQuizzesPage({ params }: CourseQuizzesPageProps) {
  const { courseId } = await params
  const session = await auth()

  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/login")
  }

  // Get course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      quizzes: {
        orderBy: { createdAt: "desc" }
      },
      topics: {
        select: { id: true, title: true, order: true }
      }
    }
  })

  if (!course) {
    redirect("/teacher")
  }

  // Verify teacher owns this course
  if (course.teacherId !== session.user.id) {
    redirect("/teacher")
  }

  return (
    <div className="px-8 py-8">
      {/* Header with back button */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="gap-2 mb-6">
          <Link href="/teacher">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-1">Cuestionarios del Curso</h1>
        <p className="text-muted-foreground">
          {course.title} - Gestiona cuestionarios a nivel de curso
        </p>
      </div>

      {/* Quiz Manager Component */}
      <CourseQuizManager 
        course={course}
        initialQuizzes={course.quizzes}
        topics={course.topics}
      />
    </div>
  )
}
