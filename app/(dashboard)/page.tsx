import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { role: true },
  })

  // This page should rarely be reached since layout handles redirections
  // But we provide fallback redirects for any edge cases
  if (user?.role === "ADMIN") {
    redirect("/admin")
  }

  if (user?.role === "TEACHER") {
    redirect("/teacher")
  }

  if (user?.role === "STUDENT") {
    redirect("/student")
  }

  // Fallback for users without proper roles
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Configurando tu dashboard...</h1>
        <p className="text-gray-600 mb-4">Estamos preparando tu experiencia personalizada.</p>
        <p className="text-sm text-gray-500">Si este mensaje persiste, contacta al soporte técnico.</p>
      </div>
    </div>
  )
}