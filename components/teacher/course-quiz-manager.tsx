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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PlusCircle, BookOpen, Trash2, Edit2, FileUp, ListChecks, Eye, EyeOff, Save, X } from "lucide-react"
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
    quizType: "" as "diagnostic" | "final" | "",
  })

  // Edit state
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    passingScore: 70,
    maxAttempts: "",
    timeLimit: "",
  })

  const handleEditStart = (quiz: Quiz) => {
    setEditingQuizId(quiz.id)
    setEditData({
      title: quiz.title,
      description: quiz.description || "",
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts?.toString() || "",
      timeLimit: quiz.timeLimit?.toString() || "",
    })
  }

  const handleEditSave = async (quizId: string) => {
    setIsLoading(true)
    try {
      await updateQuiz(quizId, {
        title: editData.title,
        description: editData.description || undefined,
        passingScore: editData.passingScore,
        maxAttempts: editData.maxAttempts ? parseInt(editData.maxAttempts) : undefined,
        timeLimit: editData.timeLimit ? parseInt(editData.timeLimit) : undefined,
      })
      setQuizzes(quizzes.map(q =>
        q.id === quizId
          ? {
              ...q,
              title: editData.title,
              description: editData.description || null,
              passingScore: editData.passingScore,
              maxAttempts: editData.maxAttempts ? parseInt(editData.maxAttempts) : null,
              timeLimit: editData.timeLimit ? parseInt(editData.timeLimit) : null,
            }
          : q
      ))
      setEditingQuizId(null)
      toast({ title: "Éxito", description: "Cuestionario actualizado" })
    } catch (error) {
      console.error("Error updating quiz:", error)
      toast({ title: "Error", description: "No se pudo actualizar el cuestionario", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateQuiz = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título del cuestionario es requerido",
        variant: "destructive",
      })
      return
    }

    if (!formData.quizType) {
      toast({
        title: "Error",
        description: "Debes seleccionar el tipo de cuestionario (diagnóstico o evaluación final)",
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
        requireAllTopics: formData.quizType === "final",
        isDiagnostic: formData.quizType === "diagnostic",
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
        quizType: "",
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

                {/* Quiz Type (required) */}
                <div className="border-t pt-4">
                  <Label className="mb-3 block font-medium">
                    Tipo de cuestionario <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.quizType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, quizType: value as "diagnostic" | "final" })
                    }
                    disabled={isLoading}
                    className="space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="diagnostic" id="type-diagnostic" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="type-diagnostic" className="font-normal cursor-pointer">
                          Diagnóstico inicial
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Los alumnos deberán contestarlo obligatoriamente al entrar al curso por primera vez. Solo tendrán 1 intento y no verán su calificación.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="final" id="type-final" className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor="type-final" className="font-normal cursor-pointer">
                          Evaluación final
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Se mostrará automáticamente cuando el alumno complete todos los temas del curso.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateQuiz} disabled={isLoading || !formData.title || !formData.quizType}>
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
              {editingQuizId === quiz.id ? (
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={2}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Puntuación Mínima (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editData.passingScore}
                        onChange={(e) => setEditData({ ...editData, passingScore: parseInt(e.target.value) || 70 })}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label>Máx. Intentos</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Ilimitado"
                        value={editData.maxAttempts}
                        onChange={(e) => setEditData({ ...editData, maxAttempts: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label>Límite de Tiempo (min)</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Sin límite"
                        value={editData.timeLimit}
                        onChange={(e) => setEditData({ ...editData, timeLimit: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-2" onClick={() => handleEditSave(quiz.id)} disabled={isLoading || !editData.title}>
                      <Save className="h-4 w-4" />
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => setEditingQuizId(null)} disabled={isLoading}>
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <>
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
                        {quiz.requireAllTopics && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Evaluación Final
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
                        <p className="text-xs text-muted-foreground">Tipo</p>
                        <p className="font-medium text-sm">
                          {quiz.isDiagnostic ? "Diagnóstico" : quiz.requireAllTopics ? "Final" : "—"}
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
                        <ListChecks className="h-4 w-4" />
                        Gestionar Preguntas
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleEditStart(quiz)}
                      >
                        <Edit2 className="h-4 w-4" />
                        Editar configuración
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleTogglePublish(quiz.id, quiz.isPublished)}
                      >
                        {quiz.isPublished
                          ? <><EyeOff className="h-4 w-4" />Despublicar</>
                          : <><Eye className="h-4 w-4" />Publicar</>
                        }
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar Cuestionario?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminarán permanentemente
                              las preguntas y los intentos de los estudiantes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </>
              )}
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
