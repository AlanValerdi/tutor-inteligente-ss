import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getCourseById } from "@/lib/actions/courses"
import { getEnrollmentProgress } from "@/lib/actions/enrollments"
import { CourseViewAdapter } from "@/components/dashboard/course-view-adapter"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CoursePageProps {
  params: {
    courseId: string
  }
}

export default async function StudentCoursePage({ params }: CoursePageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  // Verify enrollment
  const enrollment = await getEnrollmentProgress(params.courseId)
  if (!enrollment) {
    redirect("/student/courses") // User not enrolled
  }

  const course = await getCourseById(params.courseId)
  if (!course) {
    redirect("/student/courses") // Course not found
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/student/courses">
              <ArrowLeft className="h-4 w-4" />
              Volver a Mis Cursos
            </Link>
          </Button>
        </div>
      </div>

      {/* Course content */}
      <div className="flex-1 overflow-hidden">
        <CourseViewAdapter
          course={course}
          onBack={() => {}}
          onSelectTopic={(topicId) => {
            // Navigate to topic page
            window.location.href = `/student/courses/${params.courseId}/topics/${topicId}`
          }}
        />
      </div>
    </div>
  )
}