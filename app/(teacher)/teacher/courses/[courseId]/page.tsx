import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, Users, ClipboardList, FileText, Copy } from "lucide-react"
import Link from "next/link"
import { CopyEnrollKey } from "@/components/teacher/copy-enroll-key"

interface PageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseDetailPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.role !== "TEACHER") redirect("/dashboard")

  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      topics: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } },
      _count: { select: { enrollments: true } },
    },
  })

  if (!course || course.teacherId !== session.user.id) notFound()

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8 max-w-4xl">
        <Button variant="ghost" className="gap-2 mb-6" asChild>
          <Link href="/teacher">
            <ArrowLeft className="h-4 w-4" />
            Volver al Panel
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-foreground">{course.title}</h1>
              <Badge variant={course.isPublished ? "default" : "secondary"}>
                {course.isPublished ? "Publicado" : "Borrador"}
              </Badge>
            </div>
            {course.description && (
              <p className="text-muted-foreground">{course.description}</p>
            )}
          </div>
          <Button variant="outline" asChild>
            <Link href={`/teacher/courses/${course.id}/edit`}>Editar</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <BookOpen className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{course.topics.length}</p>
                <p className="text-sm text-muted-foreground">Temas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{course._count.enrollments}</p>
                <p className="text-sm text-muted-foreground">Estudiantes inscritos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enroll key */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Clave de Inscripción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-md bg-muted px-4 py-2 font-mono text-lg font-semibold tracking-widest text-center">
                {course.enrollKey}
              </code>
              <CopyEnrollKey enrollKey={course.enrollKey} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Comparte esta clave con tus estudiantes para que puedan inscribirse al curso.
            </p>
          </CardContent>
        </Card>

        {/* Topics list */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Temas del Curso</CardTitle>
            <Button size="sm" variant="outline" className="gap-2" asChild>
              <Link href={`/teacher/courses/${course.id}/topics`}>
                <FileText className="h-4 w-4" />
                Gestionar Temas
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {course.topics.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Este curso no tiene temas aún.
              </p>
            ) : (
              <ol className="space-y-2">
                {course.topics.map((topic) => (
                  <li key={topic.id} className="flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {topic.order}
                    </span>
                    {topic.title}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <Link href={`/teacher/courses/${course.id}/quizzes`}>
              <ClipboardList className="h-4 w-4" />
              Cuestionarios del Curso
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
