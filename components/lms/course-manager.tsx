"use client"

import {
  Calculator,
  Code,
  Atom,
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  Lock,
  Circle,
  ChevronDown,
  ChevronUp,
  Plus,
  Key,
  Copy,
  X,
} from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { courses as initialCourses, type Course } from "@/lib/lms-data"

const iconMap: Record<string, React.ElementType> = {
  Calculator,
  Code,
  Atom,
}

function generateKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const prefix = "CRS"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${prefix}-${code}`
}

interface NewCourseForm {
  title: string
  description: string
  category: string
  icon: string
}

export function CourseManager() {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [localCourses, setLocalCourses] = useState<Course[]>(initialCourses)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formStep, setFormStep] = useState<"form" | "key">("form")
  const [generatedKey, setGeneratedKey] = useState("")
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState<NewCourseForm>({
    title: "",
    description: "",
    category: "",
    icon: "BookOpen",
  })

  const handleCreateCourse = () => {
    const key = generateKey()
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: form.title,
      description: form.description,
      category: form.category,
      icon: form.icon,
      topics: [],
      studentsEnrolled: 0,
      enrollmentKey: key,
    }
    setLocalCourses((prev) => [...prev, newCourse])
    setGeneratedKey(key)
    setFormStep("key")
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCloseDialog = () => {
    setShowCreateDialog(false)
    setFormStep("form")
    setForm({ title: "", description: "", category: "", icon: "BookOpen" })
    setGeneratedKey("")
    setCopied(false)
  }

  const isFormValid = form.title.trim() && form.description.trim() && form.category

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-1 font-display text-2xl font-bold text-foreground">Gestionar Cursos</h1>
            <p className="text-muted-foreground">
              Administra tus cursos, temas y contenido para cada perfil de aprendizaje.
            </p>
          </div>
          <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            Crear Curso
          </Button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cursos</p>
                <p className="font-display text-xl font-bold text-card-foreground">{localCourses.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inscritos</p>
                <p className="font-display text-xl font-bold text-card-foreground">
                  {localCourses.reduce((acc, c) => acc + c.studentsEnrolled, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Temas</p>
                <p className="font-display text-xl font-bold text-card-foreground">
                  {localCourses.reduce((acc, c) => acc + c.topics.length, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {localCourses.map((course) => {
            const IconComponent = iconMap[course.icon] || BookOpen
            const isExpanded = expandedCourse === course.id
            const completedTopics = course.topics.filter((t) => t.status === "completed").length
            const courseProgress = course.topics.length > 0
              ? Math.round((completedTopics / course.topics.length) * 100)
              : 0

            return (
              <Card key={course.id} className="border-0 shadow-sm">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="font-display text-base">{course.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {course.topics.length} temas &middot; {course.studentsEnrolled} estudiantes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {course.enrollmentKey && (
                        <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">
                          <Key className="h-3 w-3" />
                          {course.enrollmentKey}
                        </span>
                      )}
                      {course.topics.length > 0 && (
                        <div className="hidden items-center gap-2 sm:flex">
                          <Progress value={courseProgress} className="h-2 w-24" />
                          <span className="text-sm text-muted-foreground">{courseProgress}%</span>
                        </div>
                      )}
                      <Button variant="ghost" size="sm">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t border-border pt-4">
                    <p className="mb-4 text-sm text-muted-foreground">{course.description}</p>

                    {course.enrollmentKey && (
                      <div className="mb-4 flex items-center gap-3 rounded-lg bg-primary/5 px-4 py-3">
                        <Key className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Clave de Inscripcion</p>
                          <p className="font-mono text-sm font-semibold text-primary">{course.enrollmentKey}</p>
                        </div>
                      </div>
                    )}

                    {course.topics.length === 0 ? (
                      <div className="rounded-lg bg-muted/50 px-4 py-6 text-center">
                        <p className="text-sm text-muted-foreground">Este curso aun no tiene temas. Ve a &quot;Crear Tema&quot; para agregar contenido.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {course.topics.map((topic, index) => (
                          <div
                            key={topic.id}
                            className="flex items-center gap-4 rounded-lg bg-muted/50 px-4 py-3"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                              {topic.status === "completed" ? (
                                <CheckCircle2 className="h-5 w-5 text-success" />
                              ) : topic.status === "current" ? (
                                <Circle className="h-5 w-5 text-primary fill-primary" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-card-foreground">
                                {index + 1}. {topic.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {topic.description}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <span className="text-xs text-muted-foreground">{topic.duration}</span>
                              <div className="flex gap-1">
                                {topic.videoUrl && (
                                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                                    Video
                                  </span>
                                )}
                                {topic.audioUrl && (
                                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                    Audio
                                  </span>
                                )}
                                {topic.textContent && (
                                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    Texto
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) handleCloseDialog() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              {formStep === "form" ? "Crear Nuevo Curso" : "Curso Creado"}
            </DialogTitle>
            <DialogDescription>
              {formStep === "form"
                ? "Completa los datos del curso. Al finalizar se generara una clave de inscripcion."
                : "Tu curso ha sido creado exitosamente. Comparte la clave con tus estudiantes para que se inscriban."}
            </DialogDescription>
          </DialogHeader>

          {formStep === "form" ? (
            <div className="flex flex-col gap-5 mt-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="course-title">Nombre del Curso</Label>
                <Input
                  id="course-title"
                  placeholder="Ej: Algebra Avanzada"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="course-desc">Descripcion</Label>
                <Textarea
                  id="course-desc"
                  placeholder="Describe brevemente los objetivos del curso..."
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="course-cat">Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
                >
                  <SelectTrigger id="course-cat">
                    <SelectValue placeholder="Selecciona una categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matematicas">Matematicas</SelectItem>
                    <SelectItem value="Ciencias de la Computacion">Ciencias de la Computacion</SelectItem>
                    <SelectItem value="Ciencias">Ciencias</SelectItem>
                    <SelectItem value="Humanidades">Humanidades</SelectItem>
                    <SelectItem value="Idiomas">Idiomas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="course-icon">Icono del Curso</Label>
                <Select
                  value={form.icon}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, icon: val }))}
                >
                  <SelectTrigger id="course-icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Calculator">Calculadora</SelectItem>
                    <SelectItem value="Code">Codigo</SelectItem>
                    <SelectItem value="Atom">Atomo</SelectItem>
                    <SelectItem value="BookOpen">Libro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCourse} disabled={!isFormValid} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Curso
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>

              <div className="w-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Key className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Clave de Inscripcion</p>
                </div>
                <p className="font-mono text-2xl font-bold tracking-wider text-primary">{generatedKey}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Los estudiantes usaran esta clave para inscribirse en el curso.
                </p>
              </div>

              <Button variant="outline" className="gap-2" onClick={handleCopyKey}>
                <Copy className="h-4 w-4" />
                {copied ? "Copiada" : "Copiar Clave"}
              </Button>

              <Button className="w-full" onClick={handleCloseDialog}>
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
