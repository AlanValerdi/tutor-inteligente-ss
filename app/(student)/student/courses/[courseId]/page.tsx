import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { CourseViewAdapter } from "@/components/dashboard/course-view-adapter"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CoursePageProps {
  params: Promise<{
    courseId: string
  }>
}

export default async function StudentCoursePage({ params }: CoursePageProps) {
  const { courseId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  // Verify enrollment and get student's current profile
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId
      }
    }
  })
  
  if (!enrollment) {
    redirect("/student/courses") // User not enrolled
  }

  // Get the student's current profile from database (fresh data, not from session JWT)
  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { studyProfile: true }
  })

  const currentProfile = student?.studyProfile || (session.user as any).studyProfile || "Visual";

  // Get course with topics
  const course = await prisma.course.findUnique({
    where: { id: courseId },
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
      content: topic.content as any,
      order: topic.order
    })),
    teacher: course.teacher
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="px-8 py-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/student/courses">
              <ArrowLeft className="h-4 w-4" />
              Volver a Mis Cursos
            </Link>
          </Button>
        </div>
      </div>

      {/* Course content */}
      <div className="flex-1 overflow-auto">
        <CourseViewAdapter
          course={courseData}
          courseId={courseId}
          studentProfile={currentProfile}
          // Estas líneas son las que activan la barra y quitan los candados:
          initialProgress={enrollment.progress}
          completedTopics={enrollment.completedTopics}
          enrollment={enrollment as any} 
        />
      </div>
    </div>
  )
}
