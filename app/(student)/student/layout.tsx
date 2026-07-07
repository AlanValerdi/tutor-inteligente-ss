import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { StudentLayoutClient } from "@/components/lms/student-layout-client"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { studyProfile: true, name: true },
  })

  if (!user?.studyProfile) {
    redirect("/onboarding")
  }

  return (
    <StudentLayoutClient
      studentName={user.name || session.user.name || "Estudiante"}
      studyProfile={user.studyProfile}
    >
      {children}
    </StudentLayoutClient>
  )
}
