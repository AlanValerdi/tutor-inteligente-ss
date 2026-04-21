"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

type Role = "STUDENT" | "TEACHER" | "ADMIN"

interface User {
  id: string
  name: string | null
  email: string
  role: Role
  createdAt: string
}

interface UsersManagerProps {
  initialUsers: User[]
  currentAdminId: string
}

const roleBadgeVariant: Record<Role, "default" | "secondary" | "outline"> = {
  ADMIN:   "default",
  TEACHER: "secondary",
  STUDENT: "outline",
}

const roleLabel: Record<Role, string> = {
  ADMIN:   "Admin",
  TEACHER: "Profesor",
  STUDENT: "Alumno",
}

export function UsersManager({ initialUsers, currentAdminId }: UsersManagerProps) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleRoleChange = (userId: string, newRole: Role) => {
    setError(null)
    setUpdatingId(userId)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? "Error al actualizar el rol")
          return
        }
        const updated = await res.json()
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u))
        )
      } catch {
        setError("Error de conexión")
      } finally {
        setUpdatingId(null)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol actual</TableHead>
              <TableHead>Cambiar rol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            )}
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name ?? <span className="text-muted-foreground italic">Sin nombre</span>}
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant[user.role]}>
                    {roleLabel[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.id === currentAdminId ? (
                    <span className="text-xs text-muted-foreground">Tu cuenta</span>
                  ) : (
                    <Select
                      value={user.role}
                      onValueChange={(v) => handleRoleChange(user.id, v as Role)}
                      disabled={isPending && updatingId === user.id}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Alumno</SelectItem>
                        <SelectItem value="TEACHER">Profesor</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} usuario{filtered.length !== 1 ? "s" : ""}
        {search && ` encontrado${filtered.length !== 1 ? "s" : ""} para "${search}"`}
      </p>
    </div>
  )
}
