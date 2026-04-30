"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { PlusCircle, BookOpen, Trash2, Edit2, FileUp } from "lucide-react"
import { createQuiz, updateQuiz, deleteQuiz } from "@/lib/actions/teacher"
import { DocxUploadForm } from "./docx-upload-form"

interface Topic {
  id: string
  title: string
  order: number
}

interface Quiz {
  id: string
  title: string
  description: string | null
  passingScore: number
  maxAttempts: number | null
  timeLimit: number | null
  shuffleQuestions: boolean
  isPublished: boolean
  topicId: string | null
  courseId: string | null
  requireAllTopics?: boolean
  isDiagnostic?: boolean
}

interface CourseQuizManagerProps {
  course: { id: string; title: string }
  initialQuizzes: Quiz[]
  topics: Topic[]
}

export function CourseQuizManager({ course, initialQuizzes, topics }: CourseQuizManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [quizzes, setQuizzes] = useState(initialQuizzes)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [createMode, setCreateMode] = useState<"manual" | "docx">("manual")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    passingScore: 70,
    maxAttempts: "",
    timeLimit: "",
    shuffleQuestions: false,
    requireAllTopics: false,
    isDiagnostic: false,
  })

  const handleCreateQuiz = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título del cuestionario es requerido",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await createQuiz({
        title: formData.title,
        description: formData.description || undefined,
        courseId: course.id, // Course-level quiz
        topicId: undefined,  // Not linked to a specific topic
        passingScore: formData.passingScore,
        maxAttempts: formData.maxAttempts ? parseInt(formData.maxAttempts) : undefined,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : undefined,
        shuffleQuestions: formData.shuffleQuestions,
        requireAllTopics: formData.requireAllTopics,
        isDiagnostic: formData.isDiagnostic,
      })

      // Add the new quiz to the list
      setQuizzes([result, ...quizzes])

      // Reset form
      setFormData({
        title: "",
        description: "",
        passingScore: 70,
        maxAttempts: "",
        timeLimit: "",
        shuffleQuestions: false,
        requireAllTopics: false,
        isDiagnostic: false,
      })

      setIsOpen(false)

      toast({
        title: "Éxito",
        description: "Cuestionario creado. Ahora puedes agregar preguntas.",
      })

      // Navigate to quiz editor
      router.push(`/teacher/quizzes/${result.id}/questions`)
    } catch (error) {
      console.error("Error creating quiz:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el cuestionario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
    try {
      await updateQuiz(quizId, { isPublished: !currentStatus })
      setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, isPublished: !currentStatus } : q))
    } catch (error) {
      console.error("Error updating quiz:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el cuestionario",
        variant: "destructive",
      })
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cuestionario?")) {
      return
    }

    try {
      await deleteQuiz(quizId)
      setQuizzes(quizzes.filter(q => q.id !== quizId))
      toast({
        title: "Éxito",
        description: "Cuestionario eliminado",
      })
    } catch (error) {
      console.error("Error deleting quiz:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cuestionario",
        variant: "destructive",
      })
    }
  }

  const courseQuizzes = quizzes.filter(q => q.courseId === course.id)

  return (
    <div className="space-y-6">
      {/* Create Quiz Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Crear Cuestionario del Curso
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Cuestionario del Curso</DialogTitle>
            <DialogDescription>
              Elige el método: crear manualmente o cargar desde DOCX
            </DialogDescription>
          </DialogHeader>

          <Tabs value={createMode} onValueChange={(v) => setCreateMode(v as "manual" | "docx")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="docx" className="gap-2">
                <FileUp className="h-4 w-4" />
                Desde DOCX
              </TabsTrigger>
            </TabsList>

            {/* Manual Tab */}
            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Título del Cuestionario *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Evaluación Final del Curso"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Descripción opcional"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passingScore">Puntuación Mínima para Aprobar (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxAttempts">Máximo de Intentos</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      min="1"
                      placeholder="Dejar en blanco = ilimitado"
                      value={formData.maxAttempts}
                      onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeLimit">Límite de Tiempo (minutos)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="1"
                      placeholder="Dejar en blanco = sin límite"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <Checkbox
                      id="shuffle"
                      checked={formData.shuffleQuestions}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, shuffleQuestions: checked as boolean })
                      }
                      disabled={isLoading}
                    />
                    <Label htmlFor="shuffle" className="font-normal cursor-pointer">
                      Mezclar preguntas
                    </Label>
                  </div>
                </div>

                {/* Require All Topics */}
                <div className="border-t pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="requireAllTopics"
                      checked={formData.requireAllTopics}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, requireAllTopics: checked as boolean })
                      }
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <Label htmlFor="requireAllTopics" className="font-normal cursor-pointer">
                        Requerir Completación de Todos los Temas
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Si está activado, los estudiantes deben marcar todos los temas como leídos 
                        antes de poder tomar este cuestionario
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Quiz */}
                <div className="border-t pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="isDiagnostic"
                      checked={formData.isDiagnostic}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isDiagnostic: checked as boolean })
                      }
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <Label htmlFor="isDiagnostic" className="font-normal cursor-pointer">
                        Es cuestionario diagnóstico inicial
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Si está activado, los alumnos deberán contestarlo obligatoriamente al entrar al curso por primera vez. Solo tendrán 1 intento y no verán su calificación.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateQuiz} disabled={isLoading || !formData.title}>
                  {isLoading ? "Creando..." : "Crear Cuestionario"}
                </Button>
              </div>
            </TabsContent>

            {/* DOCX Tab */}
            <TabsContent value="docx" className="mt-4">
              <DocxUploadForm 
                courseId={course.id}
                onClose={() => {
                  setIsOpen(false)
                  router.refresh()
                }}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Quizzes List */}
      {courseQuizzes.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-medium mb-1">Sin cuestionarios</h3>
            <p className="text-sm text-muted-foreground">
              Este curso no tiene cuestionarios a nivel de curso todavía
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {courseQuizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    {quiz.description && (
                      <CardDescription className="mt-1">{quiz.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {quiz.isDiagnostic && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Diagnóstico Inicial
                      </Badge>
                    )}
                    <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                      {quiz.isPublished ? "Publicado" : "Borrador"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Puntuación Mínima</p>
                    <p className="font-medium">{quiz.passingScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Máx. Intentos</p>
                    <p className="font-medium">{quiz.maxAttempts || "Ilimitado"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Límite de Tiempo</p>
                    <p className="font-medium">{quiz.timeLimit ? `${quiz.timeLimit} min` : "Sin límite"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Requisitos</p>
                    <p className="font-medium text-sm">
                      {quiz.requireAllTopics ? "Todos los temas" : "Ninguno"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => router.push(`/teacher/quizzes/${quiz.id}/questions`)}
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar Preguntas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(quiz.id, quiz.isPublished)}
                  >
                    {quiz.isPublished ? "Despublicar" : "Publicar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Cuestionarios de Tema vs. Curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900">
          <p>
            <strong>Cuestionarios de Tema:</strong> Se encuentran dentro de cada tema y están 
            disponibles después de marcar el tema como leído.
          </p>
          <p>
            <strong>Cuestionarios del Curso:</strong> Están disponibles a nivel de curso. 
            Los estudiantes pueden acceder cuando completen los requisitos que establezcas.
          </p>
          <p>
            Usa cuestionarios del curso para evaluaciones finales, pruebas integradoras o 
            exámenes que cubran múltiples temas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
