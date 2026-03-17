import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TeacherLayoutClient } from "@/components/teacher/teacher-layout-client"

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "TEACHER") {
    redirect("/dashboard")
  }

  return (
    <TeacherLayoutClient teacherName={session.user.name || "Profesor"}>
      {children}
    </TeacherLayoutClient>
  )
}