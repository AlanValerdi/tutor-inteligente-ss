import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  switch (session.user.role) {
    case "TEACHER":
      redirect("/teacher")
    case "ADMIN":
      redirect("/admin")
    case "STUDENT":
    default:
      redirect("/student")
  }
}
