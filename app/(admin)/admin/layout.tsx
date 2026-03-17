import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <AdminLayoutClient adminName={session.user.name || "Admin"}>
      {children}
    </AdminLayoutClient>
  )
}