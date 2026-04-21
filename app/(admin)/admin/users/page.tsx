import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { UsersManager } from "@/components/admin/users-manager"

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  const serialized = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }))

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona los roles de los usuarios. Cambia el rol de un alumno a Profesor para que pueda crear cursos.
        </p>
      </div>
      <UsersManager initialUsers={serialized} currentAdminId={session.user.id} />
    </div>
  )
}
