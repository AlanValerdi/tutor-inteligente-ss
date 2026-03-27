import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { StudentLayoutSidebar } from "@/components/lms/student-layout-sidebar"

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
    redirect("/dashboard") // Redirect to general dashboard for other roles
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { studyProfile: true, name: true }
  })

  if (!user?.studyProfile) {
    redirect("/onboarding")
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <StudentLayoutSidebar 
        studentName={user.name || session.user.name || "Estudiante"} 
        studyProfile={user.studyProfile}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}