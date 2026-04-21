import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { EditCourseForm } from "@/components/teacher/edit-course-form"

interface PageProps {
  params: Promise<{ courseId: string }>
}

export default async function EditCoursePage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.role !== "TEACHER") redirect("/dashboard")

  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, description: true, teacherId: true },
  })

  if (!course || course.teacherId !== session.user.id) notFound()

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <EditCourseForm
          courseId={course.id}
          initialTitle={course.title}
          initialDescription={course.description}
        />
      </div>
    </div>
  )
}
