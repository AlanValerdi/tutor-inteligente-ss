"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { 
  Plus, 
  FileQuestion, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  CheckCircle2,
  Clock,
  Target,
  RotateCcw,
  ArrowLeft,
  FileUp
} from "lucide-react"
import { createQuiz, updateQuiz, deleteQuiz } from "@/lib/actions/teacher"
import { DocxUploadForm } from "./docx-upload-form"
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

interface QuizManagerProps {
  topic: {
    id: string
    title: string
    courseId: string
  }
  quizzes: {
    id: string
    title: string
    description: string | null
    isPublished: boolean
    passingScore: number
    maxAttempts: number | null
    timeLimit: number | null
    questionsCount: number
    createdAt: Date
  }[]
}

export function QuizManager({ topic, quizzes: initialQuizzes }: QuizManagerProps) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createMode, setCreateMode] = useState<"manual" | "docx">("manual")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Create form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    passingScore: 70,
    maxAttempts: null as number | null,
    timeLimit: null as number | null,
    shuffleQuestions: false
  })

  // Edit state
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
  const [editData, setEditData] = useState<typeof formData>(formData)
  
  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreateQuiz = async () => {
    if (!formData.title) return

    setLoading(true)
    try {
      await createQuiz({
        topicId: topic.id,
        title: formData.title,
        description: formData.description || undefined,
        passingScore: formData.passingScore,
        maxAttempts: formData.maxAttempts || undefined,
        timeLimit: formData.timeLimit || undefined,
        shuffleQuestions: formData.shuffleQuestions
      })
      
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setShowCreateForm(false)
        setFormData({
          title: "",
          description: "",
          passingScore: 70,
          maxAttempts: null,
          timeLimit: null,
          shuffleQuestions: false
        })
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Error creating quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStart = (quiz: typeof initialQuizzes[0]) => {
    setEditingQuizId(quiz.id)
    setEditData({
      title: quiz.title,
      description: quiz.description || "",
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      timeLimit: quiz.timeLimit,
      shuffleQuestions: false
    })
  }

  const handleEditSave = async (quizId: string) => {
    setLoading(true)
    try {
      await updateQuiz(quizId, {
        title: editData.title,
        description: editData.description || undefined,
        passingScore: editData.passingScore,
        maxAttempts: editData.maxAttempts || undefined,
        timeLimit: editData.timeLimit || undefined
      })
      setEditingQuizId(null)
      router.refresh()
    } catch (error) {
      console.error("Error updating quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCancel = () => {
    setEditingQuizId(null)
  }

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return

    setIsDeleting(true)
    try {
      await deleteQuiz(quizToDelete)
      router.refresh()
    } catch (error) {
      console.error("Error deleting quiz:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setQuizToDelete(null)
    }
  }

  const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
    try {
      await updateQuiz(quizId, { isPublished: !currentStatus })
      router.refresh()
    } catch (error) {
      console.error("Error updating quiz:", error)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => router.push(`/teacher/courses/${topic.courseId}/topics`)}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Temas
            </Button>
          </div>

          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">
            Cuestionarios: {topic.title}
          </h1>
          <p className="text-muted-foreground">
            Crea cuestionarios para evaluar el conocimiento de tus estudiantes
          </p>
        </div>

        {/* Create Quiz Form */}
        {showCreateForm ? (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>Crear Nuevo Cuestionario</CardTitle>
              <CardDescription>
                Elige el método: crear manualmente o cargar desde DOCX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={createMode} onValueChange={(v) => setCreateMode(v as "manual" | "docx")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Manual
                  </TabsTrigger>
                  <TabsTrigger value="docx" className="gap-2">
                    <FileUp className="h-4 w-4" />
                    Desde DOCX
                  </TabsTrigger>
                </TabsList>

                {/* Manual Tab */}
                <TabsContent value="manual" className="space-y-4 mt-4">
                  {submitted && (
                    <div className="mb-6 flex items-center gap-3 p-4 rounded-lg border border-success/30 bg-success/5">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <p className="text-sm font-medium text-success">
                        ¡Cuestionario creado exitosamente!
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiz-title">
                        Título <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="quiz-title"
                        placeholder="Ej: Evaluación Final - Módulo 1"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        disabled={loading || submitted}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quiz-description">Descripción</Label>
                      <Textarea
                        id="quiz-description"
                        placeholder="Describe brevemente el objetivo del cuestionario..."
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        disabled={loading || submitted}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="passing-score" className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Nota Mínima (%)
                        </Label>
                        <Input
                          id="passing-score"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.passingScore}
                          onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) || 70 })}
                          disabled={loading || submitted}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-attempts" className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          Intentos Máximos
                        </Label>
                        <Input
                          id="max-attempts"
                          type="number"
                          min="1"
                          placeholder="Ilimitado"
                          value={formData.maxAttempts ?? ""}
                          onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value ? parseInt(e.target.value) : null })}
                          disabled={loading || submitted}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time-limit" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Tiempo (minutos)
                        </Label>
                        <Input
                          id="time-limit"
                          type="number"
                          min="1"
                          placeholder="Sin límite"
                          value={formData.timeLimit ?? ""}
                          onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                          disabled={loading || submitted}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <Button
                        onClick={handleCreateQuiz}
                        disabled={loading || submitted || !formData.title}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {loading ? "Creando..." : "Crear Cuestionario"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* DOCX Tab */}
                <TabsContent value="docx" className="mt-4">
                  <DocxUploadForm 
                    topicId={topic.id}
                    onClose={() => {
                      setShowCreateForm(false)
                      router.refresh()
                    }}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Button 
            onClick={() => setShowCreateForm(true)} 
            className="gap-2 mb-8"
          >
            <Plus className="h-4 w-4" />
            Crear Cuestionario
          </Button>
        )}

        {/* Quiz List */}
        <div className="space-y-4">
          {initialQuizzes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No hay cuestionarios aún</h3>
                <p className="text-muted-foreground text-center">
                  Crea tu primer cuestionario para evaluar a tus estudiantes
                </p>
              </CardContent>
            </Card>
          ) : (
            initialQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  {editingQuizId === quiz.id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          rows={3}
                          disabled={loading}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Nota Mínima (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editData.passingScore}
                            onChange={(e) => setEditData({ ...editData, passingScore: parseInt(e.target.value) || 70 })}
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Intentos Máximos</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Ilimitado"
                            value={editData.maxAttempts ?? ""}
                            onChange={(e) => setEditData({ ...editData, maxAttempts: e.target.value ? parseInt(e.target.value) : null })}
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tiempo (min)</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Sin límite"
                            value={editData.timeLimit ?? ""}
                            onChange={(e) => setEditData({ ...editData, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditSave(quiz.id)}
                          disabled={loading}
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                          disabled={loading}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{quiz.title}</h3>
                            <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                              {quiz.isPublished ? "Publicado" : "Borrador"}
                            </Badge>
                          </div>
                          
                          {quiz.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {quiz.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileQuestion className="h-4 w-4" />
                              {quiz.questionsCount} preguntas
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {quiz.passingScore}% mínimo
                            </span>
                            {quiz.maxAttempts && (
                              <span className="flex items-center gap-1">
                                <RotateCcw className="h-4 w-4" />
                                {quiz.maxAttempts} intentos
                              </span>
                            )}
                            {quiz.timeLimit && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {quiz.timeLimit} min
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/teacher/quizzes/${quiz.id}/questions`)}
                          >
                            Gestionar Preguntas
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditStart(quiz)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTogglePublish(quiz.id, quiz.isPublished)}
                          >
                            {quiz.isPublished ? "Despublicar" : "Publicar"}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setQuizToDelete(quiz.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuestionario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el cuestionario
              y todas sus preguntas asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuizToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteQuiz}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
