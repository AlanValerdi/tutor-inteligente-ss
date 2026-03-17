import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

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

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}