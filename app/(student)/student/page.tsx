import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StudentPortalWrapper } from "@/components/dashboard/student-portal-wrapper"

export default async function StudentDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard") // Redirect to general dashboard for other roles
  }

  return (
    <StudentPortalWrapper
      studentName={session.user.name || "Estudiante"}
      studentId={session.user.id}
    />
  )
}