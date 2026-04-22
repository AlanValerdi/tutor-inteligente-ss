"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

interface Course {
  id: string
  title: string
  isPublished: boolean
  teacher: { name: string | null; email: string }
  topicsCount: number
  quizzesCount: number
  enrollmentsCount: number
  createdAt: string
}

type FilterValue = "all" | "published" | "draft"

export function CoursesTable({ courses }: { courses: Course[] }) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterValue>("all")

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.teacher.name ?? c.teacher.email).toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === "all" ||
      (filter === "published" && c.isPublished) ||
      (filter === "draft" && !c.isPublished)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por curso o profesor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>Profesor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Temas</TableHead>
              <TableHead className="text-center">Cuestionarios</TableHead>
              <TableHead className="text-center">Inscritos</TableHead>
              <TableHead>Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No se encontraron cursos
                </TableCell>
              </TableRow>
            )}
            {filtered.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {course.teacher.name ?? course.teacher.email}
                </TableCell>
                <TableCell>
                  {course.isPublished ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                      Publicado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Borrador
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">{course.topicsCount}</TableCell>
                <TableCell className="text-center">{course.quizzesCount}</TableCell>
                <TableCell className="text-center">{course.enrollmentsCount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(course.createdAt).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} curso{filtered.length !== 1 ? "s" : ""}
        {search && ` encontrado${filtered.length !== 1 ? "s" : ""} para "${search}"`}
      </p>
    </div>
  )
}
