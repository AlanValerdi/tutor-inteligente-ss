"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, MoreVertical, Eye, Edit, Trash2, FileText, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateCourse, deleteCourse } from "@/lib/actions/teacher"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Course {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  enrollKey: string
  topicsCount: number
  studentsCount: number
  createdAt: Date
}

interface TeacherCoursesListProps {
  courses: Course[]
}

export function TeacherCoursesList({ courses }: TeacherCoursesListProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return

    setIsDeleting(true)
    try {
      await deleteCourse(courseToDelete)
      router.refresh()
    } catch (error) {
      console.error("Error deleting course:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
    }
  }

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      await updateCourse(courseId, { isPublished: !currentStatus })
      router.refresh()
    } catch (error) {
      console.error("Error updating course:", error)
    }
  }

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No tienes cursos aún</h3>
          <p className="text-muted-foreground text-center mb-4">
            Crea tu primer curso para comenzar a enseñar
          </p>
          <Button onClick={() => router.push("/teacher/courses/create")}>
            Crear Curso
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Mis Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Publicado" : "Borrador"}
                    </Badge>
                  </div>
                  
                  {course.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.topicsCount} temas
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.studentsCount} estudiantes
                    </span>
                    <span>
                      Creado: {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {!course.isPublished && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">Clave de inscripción:</span>{" "}
                      <code className="bg-muted px-1.5 py-0.5 rounded">
                        {course.enrollKey}
                      </code>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                    onClick={() => router.push(`/teacher/courses/${course.id}/quizzes`)}
                  >
                    <ClipboardList className="h-4 w-4" />
                    Cuestionarios
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                    onClick={() => router.push(`/teacher/courses/${course.id}/topics`)}
                  >
                    <FileText className="h-4 w-4" />
                    Temas
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/teacher/courses/${course.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/teacher/courses/${course.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Curso
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTogglePublish(course.id, course.isPublished)}>
                        {course.isPublished ? "Despublicar" : "Publicar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => {
                          setCourseToDelete(course.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el curso
              y todos sus temas asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCourseToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCourse}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
