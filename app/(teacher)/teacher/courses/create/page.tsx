import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreateCourseForm } from "@/components/teacher/create-course-form"

export default async function CreateCoursePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "TEACHER") {
    redirect("/dashboard")
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <CreateCourseForm />
      </div>
    </div>
  )
}
