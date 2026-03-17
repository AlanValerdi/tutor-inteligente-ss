"use client"

import { useState } from "react"
import { BookOpen, Users, Key, ArrowRight, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  description: string | null
  enrollKey: string
  isPublished: boolean
  teacher: {
    id: string
    name: string | null
    image: string | null
  }
  topics: { id: string }[]
  studentsEnrolled: number
}

interface CourseExplorerProps {
  availableCourses: Course[]
  onEnroll: (courseId: string, enrollKey: string) => Promise<void>
  onBack: () => void
}

export function CourseExplorer({ availableCourses, onEnroll, onBack }: CourseExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [enrollKey, setEnrollKey] = useState("")
  const [isEnrolling, setIsEnrolling] = useState(false)

  const filteredCourses = availableCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacher.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEnroll = async () => {
    if (!selectedCourse || !enrollKey.trim()) {
      toast.error("Por favor ingresa la clave de inscripción")
      return
    }

    setIsEnrolling(true)
    try {
      await onEnroll(selectedCourse.id, enrollKey.trim())
      toast.success(`¡Te has inscrito exitosamente en ${selectedCourse.title}!`)
      setSelectedCourse(null)
      setEnrollKey("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al inscribirse")
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-1 font-display text-2xl font-bold text-foreground">
              Explorar Cursos
            </h1>
            <p className="text-muted-foreground">
              Descubre nuevos cursos y amplía tus conocimientos
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onBack}>
            Volver al Dashboard
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos por título, descripción o instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} disponible{filteredCourses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No se encontraron cursos</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "No hay cursos disponibles en este momento"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="group border-0 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {course.topics.length} temas
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 font-display text-base line-clamp-2">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {course.description || "Curso disponible para inscripción"}
                  </p>

                  {/* Teacher */}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center">
                      <Users className="h-3 w-3" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {course.teacher.name || "Instructor"}
                    </span>
                  </div>

                  {/* Students count */}
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estudiantes inscritos</span>
                    <span className="font-medium">{course.studentsEnrolled}</span>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        type="button"
                        className="w-full gap-2 group-hover:gap-3 transition-all"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <Key className="h-4 w-4" />
                        Inscribirse
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Inscribirse en {course.title}</DialogTitle>
                        <DialogDescription>
                          Para inscribirte en este curso, necesitas la clave de inscripción proporcionada por el instructor.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="enrollKey">Clave de Inscripción</Label>
                          <Input
                            id="enrollKey"
                            placeholder="Ingresa la clave de inscripción"
                            value={enrollKey}
                            onChange={(e) => setEnrollKey(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedCourse(null)
                            setEnrollKey("")
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="button" onClick={handleEnroll} disabled={isEnrolling}>
                          {isEnrolling ? "Inscribiendo..." : "Confirmar Inscripción"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}