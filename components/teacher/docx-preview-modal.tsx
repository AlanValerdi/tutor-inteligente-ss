"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Trash2, Check, X } from "lucide-react"
import { ExtractedQuestion } from "@/lib/types/docx"
import { createQuizFromDocx } from "@/lib/actions/teacher"
import { DocxQuestionPreview } from "./docx-question-preview"

interface DocxPreviewModalProps {
  questions: ExtractedQuestion[]
  topicId?: string
  courseId?: string
  onClose: () => void
}

export function DocxPreviewModal({
  questions: initialQuestions,
  topicId,
  courseId,
  onClose,
}: DocxPreviewModalProps) {
  const router = useRouter()
  const [questions, setQuestions] = useState<ExtractedQuestion[]>(initialQuestions)
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [passingScore, setPassingScore] = useState(70)
  const [maxAttempts, setMaxAttempts] = useState("")
  const [timeLimit, setTimeLimit] = useState("")
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [requireAllTopics, setRequireAllTopics] = useState(false)
  const [isDiagnostic, setIsDiagnostic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const validQuestions = questions.filter((q) => q.isValid)
  const invalidQuestions = questions.filter((q) => !q.isValid)

  const handleDeleteQuestion = (id: string | undefined) => {
    if (!id) return
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleConfirm = async () => {
    if (!quizTitle.trim()) {
      setError("Ingresa un título para el cuestionario")
      return
    }

    if (validQuestions.length === 0) {
      setError("Debe haber al menos una pregunta válida")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createQuizFromDocx({
        topicId,
        courseId,
        title: quizTitle.trim(),
        description: quizDescription.trim() || undefined,
        passingScore: passingScore,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : undefined,
        timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
        shuffleQuestions,
        requireAllTopics,
        isDiagnostic,
        questions: validQuestions,
      })

      // Cerrar el modal y refrescar para mostrar el nuevo cuestionario
      onClose()
      router.refresh()

      // Redirigir a la página de cuestionario creado (por si estuvieran en otra ruta)
      if (topicId) {
        router.push(`/teacher/topics/${topicId}/quizzes`)
      } else if (courseId) {
        router.push(`/teacher/courses/${courseId}/quizzes`)
      }
    } catch (err: any) {
      setError(err.message || "Error al crear cuestionario")
      console.error("Error creating quiz:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Vista Previa: Cuestionario desde DOCX</DialogTitle>
          <DialogDescription>
            Revisa las preguntas extraídas. Puedes editar, eliminar o agregar antes de crear.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-auto flex-1 space-y-6 px-6">
          {/* Datos del Quiz */}
          <div className="space-y-3 pb-4 border-b">
            <div>
              <Label htmlFor="quiz-title">Título del Cuestionario *</Label>
              <Input
                id="quiz-title"
                placeholder="Ej: Examen Final - Introducción a Computación"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="quiz-description">Descripción (opcional)</Label>
              <Textarea
                id="quiz-description"
                placeholder="Ej: Examen final del módulo"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                disabled={loading}
                rows={2}
              />
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <Label htmlFor="passingScore">Puntuación Mínima para Aprobar (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="maxAttempts">Máximo de Intentos</Label>
              <Input
                id="maxAttempts"
                type="number"
                min="1"
                placeholder="Dejar en blanco = ilimitado"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="timeLimit">Límite de Tiempo (minutos)</Label>
              <Input
                id="timeLimit"
                type="number"
                min="1"
                placeholder="Dejar en blanco = sin límite"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Checkbox
                id="shuffle"
                checked={shuffleQuestions}
                onCheckedChange={(checked) => setShuffleQuestions(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="shuffle" className="font-normal cursor-pointer">
                Mezclar preguntas
              </Label>
            </div>
          </div>

          {/* Require All Topics */}
          <div className="pb-4 border-b">
            <div className="flex items-start gap-3">
              <Checkbox
                id="requireAllTopics"
                checked={requireAllTopics}
                onCheckedChange={(checked) => setRequireAllTopics(checked as boolean)}
                disabled={loading}
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
          <div className="pb-4 border-b">
            <div className="flex items-start gap-3">
              <Checkbox
                id="isDiagnostic"
                checked={isDiagnostic}
                onCheckedChange={(checked) => setIsDiagnostic(checked as boolean)}
                disabled={loading}
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

          {/* Resumen */}
          <div className="flex gap-3">
            <Badge variant="default">Total: {questions.length}</Badge>
            <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
              Válidas: {validQuestions.length}
            </Badge>
            {invalidQuestions.length > 0 && (
              <Badge variant="destructive">Inválidas: {invalidQuestions.length}</Badge>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preguntas Válidas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Preguntas Válidas ({validQuestions.length})</h3>
            <div className="space-y-3">
              {validQuestions.map((question, index) => (
                <Card key={question.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <DocxQuestionPreview question={question} />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteQuestion(question.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Preguntas Inválidas */}
          {invalidQuestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-destructive">
                Preguntas Inválidas ({invalidQuestions.length})
              </h3>
              <p className="text-sm text-muted-foreground">
                Estas preguntas serán ignoradas al crear el cuestionario.
              </p>
              <div className="space-y-2">
                {invalidQuestions.map((question) => (
                  <Card key={question.id} className="border-destructive/30 bg-destructive/5">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2">{question.pregunta}</p>
                          {question.errors.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {question.errors.map((error, idx) => (
                                <li key={idx} className="text-xs text-destructive">
                                  • {error}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteQuestion(question.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || validQuestions.length === 0 || !quizTitle.trim()}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            {loading ? "Creando..." : "Crear Cuestionario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
