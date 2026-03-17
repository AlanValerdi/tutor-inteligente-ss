import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, name: true, email: true, image: true, role: true },
  })

  if (!user) {
    redirect("/login")
  }

  // Redirect to role-specific portals
  if (user.role === "ADMIN") {
    redirect("/admin")
  } else if (user.role === "TEACHER") {
    redirect("/teacher")
  } else if (user.role === "STUDENT") {
    redirect("/student")
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
