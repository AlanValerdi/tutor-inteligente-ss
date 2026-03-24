import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
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
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: params.courseId
      }
    }
  })
  
  if (!enrollment) {
    redirect("/student/courses") // User not enrolled
  }

  // Get course with topics
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      topics: {
        orderBy: { order: "asc" }
      }
    }
  })

  if (!course) {
    redirect("/student/courses") // Course not found
  }

  // Transform data for adapter
  const courseData = {
    id: course.id,
    title: course.title,
    description: course.description,
    topics: course.topics.map(topic => ({
      id: topic.id,
      title: topic.title,
      content: topic.content,
      order: topic.order
    })),
    teacher: course.teacher
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
          course={courseData}
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