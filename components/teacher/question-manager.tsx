"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  FileQuestion, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  CheckCircle2,
  ArrowLeft,
  Image as ImageIcon,
  GripVertical,
  AlertCircle
} from "lucide-react"
import { createQuestion, updateQuestion, deleteQuestion } from "@/lib/actions/teacher"
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

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"

interface Question {
  id: string
  type: QuestionType
  questionText: string
  imageUrl: string | null
  order: number
  points: number
  options: any
  explanation: string | null
  createdAt: Date
  updatedAt: Date
}

interface QuestionManagerProps {
  quiz: {
    id: string
    title: string
    topicId: string | null
    courseId?: string | null
  }
  questions: Question[]
}

interface MultipleChoiceOption {
  text: string
  isCorrect: boolean
}

export function QuestionManager({ quiz, questions: initialQuestions }: QuestionManagerProps) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Create form state
  const [questionType, setQuestionType] = useState<QuestionType>("MULTIPLE_CHOICE")
  const [questionText, setQuestionText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [points, setPoints] = useState(1)
  const [explanation, setExplanation] = useState("")
  
  // Multiple Choice options
  const [mcOptions, setMcOptions] = useState<MultipleChoiceOption[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ])
  
  // True/False answer
  const [tfAnswer, setTfAnswer] = useState<boolean>(true)
  
  // Short Answer accepted answers
  const [saAnswers, setSaAnswers] = useState<string[]>([""])
  
  // Edit state
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  
  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const resetForm = () => {
    setQuestionText("")
    setImageUrl("")
    setPoints(1)
    setExplanation("")
    setMcOptions([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ])
    setTfAnswer(true)
    setSaAnswers([""])
    setQuestionType("MULTIPLE_CHOICE")
  }

  const handleAddMcOption = () => {
    setMcOptions([...mcOptions, { text: "", isCorrect: false }])
  }

  const handleRemoveMcOption = (index: number) => {
    if (mcOptions.length > 2) {
      setMcOptions(mcOptions.filter((_, i) => i !== index))
    }
  }

  const handleMcOptionChange = (index: number, text: string) => {
    const updated = [...mcOptions]
    updated[index].text = text
    setMcOptions(updated)
  }

  const handleMcCorrectChange = (index: number) => {
    const updated = mcOptions.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }))
    setMcOptions(updated)
  }

  const handleAddSaAnswer = () => {
    setSaAnswers([...saAnswers, ""])
  }

  const handleRemoveSaAnswer = (index: number) => {
    if (saAnswers.length > 1) {
      setSaAnswers(saAnswers.filter((_, i) => i !== index))
    }
  }

  const handleSaAnswerChange = (index: number, value: string) => {
    const updated = [...saAnswers]
    updated[index] = value
    setSaAnswers(updated)
  }

  const validateQuestion = (): boolean => {
    if (!questionText.trim()) return false

    if (questionType === "MULTIPLE_CHOICE") {
      const hasAllOptions = mcOptions.every(opt => opt.text.trim())
      const hasCorrect = mcOptions.some(opt => opt.isCorrect)
      return hasAllOptions && hasCorrect
    }

    if (questionType === "SHORT_ANSWER") {
      return saAnswers.some(ans => ans.trim())
    }

    return true // TRUE_FALSE always valid
  }

  const buildOptionsJson = () => {
    switch (questionType) {
      case "MULTIPLE_CHOICE":
        return mcOptions
      case "TRUE_FALSE":
        return { correctAnswer: tfAnswer }
      case "SHORT_ANSWER":
        return { acceptedAnswers: saAnswers.filter(a => a.trim()) }
      default:
        return {}
    }
  }

  const handleCreateQuestion = async () => {
    if (!validateQuestion()) return

    setLoading(true)
    try {
      await createQuestion({
        quizId: quiz.id,
        type: questionType,
        questionText: questionText.trim(),
        imageUrl: imageUrl.trim() || undefined,
        options: buildOptionsJson(),
        points,
        explanation: explanation.trim() || undefined
      })
      
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setShowCreateForm(false)
        resetForm()
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Error creating question:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return

    setIsDeleting(true)
    try {
      await deleteQuestion(questionToDelete)
      router.refresh()
    } catch (error) {
      console.error("Error deleting question:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setQuestionToDelete(null)
    }
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case "MULTIPLE_CHOICE": return "Opción Múltiple"
      case "TRUE_FALSE": return "Verdadero/Falso"
      case "SHORT_ANSWER": return "Respuesta Corta"
    }
  }

  const renderQuestionPreview = (question: Question) => {
    const { type, questionText, options, imageUrl, points, explanation } = question

    return (
      <div className="space-y-3 overflow-hidden min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{getQuestionTypeLabel(type)}</Badge>
              <Badge variant="secondary">{points} {points === 1 ? 'punto' : 'puntos'}</Badge>
            </div>
            <p className="font-medium text-sm mb-2 line-clamp-2 break-words">{questionText}</p>
            {imageUrl && (
              <div className="mb-3 p-2 border rounded-lg bg-muted/30 overflow-hidden">
                <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                  <ImageIcon className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate break-all">{imageUrl}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 ml-4">
            <Button 
              size="sm"
              variant="ghost"
              onClick={() => {
                setQuestionToDelete(question.id)
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Options Preview */}
        <div className="pl-4 space-y-2 min-w-0">
          {type === "MULTIPLE_CHOICE" && (
            <div className="space-y-2">
              {(options as MultipleChoiceOption[]).map((opt, i) => (
                <div 
                   key={i} 
                   className={`flex items-center gap-2 p-2 rounded text-xs overflow-hidden ${
                     opt.isCorrect ? 'bg-success/10 border border-success/20' : 'bg-muted/30'
                   }`}
                 >
                   <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                     opt.isCorrect ? 'border-success bg-success' : 'border-muted-foreground'
                   }`}>
                     {opt.isCorrect && <CheckCircle2 className="h-3 w-3 text-white" />}
                   </div>
                   <span className="truncate break-words">{opt.text}</span>
                 </div>
              ))}
            </div>
          )}

          {type === "TRUE_FALSE" && (
            <div className="space-y-2">
              <div className={`flex items-center gap-2 p-2 rounded text-xs ${
                (options as { correctAnswer: boolean }).correctAnswer ? 'bg-success/10 border border-success/20' : 'bg-muted/30'
              }`}>
                <CheckCircle2 className="h-3 w-3 text-success" />
                <span>Verdadero</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded text-xs ${
                !(options as { correctAnswer: boolean }).correctAnswer ? 'bg-success/10 border border-success/20' : 'bg-muted/30'
              }`}>
                <CheckCircle2 className="h-3 w-3 text-success" />
                <span>Falso</span>
              </div>
            </div>
          )}

          {type === "SHORT_ANSWER" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Respuestas aceptadas:</p>
               {(options as { acceptedAnswers: string[] }).acceptedAnswers.map((ans, i) => (
                 <div key={i} className="flex items-center gap-2 p-2 rounded text-xs bg-success/10 border border-success/20 overflow-hidden">
                   <CheckCircle2 className="h-3 w-3 text-success flex-shrink-0" />
                   <span className="truncate break-words">{ans}</span>
                 </div>
               ))}
            </div>
          )}
        </div>

        {explanation && (
          <div className="pl-4 p-3 rounded-lg bg-blue-50 border border-blue-200 overflow-hidden">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-blue-900">Explicación:</p>
                <p className="text-xs text-blue-800 mt-1 line-clamp-3 break-words">{explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="px-8 py-8 overflow-auto h-full">
        <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          className="gap-2 mb-6"
          onClick={() =>
            quiz.topicId
              ? router.push(`/teacher/topics/${quiz.topicId}/quizzes`)
              : router.push(`/teacher/courses/${quiz.courseId}/quizzes`)
          }
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Cuestionarios
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Preguntas: {quiz.title}
          </h1>
          <p className="text-gray-600">
            Crea y gestiona las preguntas de este cuestionario
          </p>
        </div>

        {/* Create Question Form */}
        {showCreateForm ? (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>Crear Nueva Pregunta</CardTitle>
              <CardDescription>
                Selecciona el tipo de pregunta y completa los campos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted && (
                <div className="mb-6 flex items-center gap-3 p-4 rounded-lg border border-success/30 bg-success/5">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <p className="text-sm font-medium text-success">
                    ¡Pregunta creada exitosamente!
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {/* Question Type */}
                <div className="space-y-2">
                  <Label>Tipo de Pregunta</Label>
                  <Select value={questionType} onValueChange={(v) => setQuestionType(v as QuestionType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">Opción Múltiple</SelectItem>
                      <SelectItem value="TRUE_FALSE">Verdadero/Falso</SelectItem>
                      <SelectItem value="SHORT_ANSWER">Respuesta Corta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  <Label htmlFor="question-text">
                    Pregunta <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="question-text"
                    placeholder="Escribe tu pregunta aquí..."
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    disabled={loading || submitted}
                  />
                </div>

                {/* Image URL (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="image-url">URL de Imagen (opcional)</Label>
                  <Input
                    id="image-url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={loading || submitted}
                  />
                </div>

                {/* Options based on type */}
                {questionType === "MULTIPLE_CHOICE" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Opciones de Respuesta</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddMcOption}
                        disabled={loading || submitted || mcOptions.length >= 6}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar Opción
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {mcOptions.map((opt, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <RadioGroup value={mcOptions.findIndex(o => o.isCorrect).toString()}>
                            <RadioGroupItem
                              value={index.toString()}
                              onClick={() => handleMcCorrectChange(index)}
                            />
                          </RadioGroup>
                          <Input
                            placeholder={`Opción ${index + 1}`}
                            value={opt.text}
                            onChange={(e) => handleMcOptionChange(index, e.target.value)}
                            disabled={loading || submitted}
                          />
                          {mcOptions.length > 2 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveMcOption(index)}
                              disabled={loading || submitted}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Selecciona la opción correcta haciendo clic en el círculo
                    </p>
                  </div>
                )}

                {questionType === "TRUE_FALSE" && (
                  <div className="space-y-2">
                    <Label>Respuesta Correcta</Label>
                    <RadioGroup value={tfAnswer.toString()} onValueChange={(v) => setTfAnswer(v === "true")}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="true" />
                        <Label htmlFor="true" className="font-normal">Verdadero</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="false" />
                        <Label htmlFor="false" className="font-normal">Falso</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {questionType === "SHORT_ANSWER" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Respuestas Aceptadas</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddSaAnswer}
                        disabled={loading || submitted || saAnswers.length >= 5}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar Alternativa
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {saAnswers.map((ans, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Respuesta aceptada ${index + 1}`}
                            value={ans}
                            onChange={(e) => handleSaAnswerChange(index, e.target.value)}
                            disabled={loading || submitted}
                          />
                          {saAnswers.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveSaAnswer(index)}
                              disabled={loading || submitted}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Agrega todas las variaciones aceptables de la respuesta
                    </p>
                  </div>
                )}

                {/* Points */}
                <div className="space-y-2">
                  <Label htmlFor="points">Puntos</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="10"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                    disabled={loading || submitted}
                  />
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <Label htmlFor="explanation">Explicación (opcional)</Label>
                  <Textarea
                    id="explanation"
                    placeholder="Explica por qué esta es la respuesta correcta..."
                    rows={3}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    disabled={loading || submitted}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se mostrará después de que el estudiante responda
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    onClick={handleCreateQuestion}
                    disabled={loading || submitted || !validateQuestion()}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {loading ? "Creando..." : "Crear Pregunta"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      resetForm()
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button 
            onClick={() => setShowCreateForm(true)} 
            className="gap-2 mb-8"
          >
            <Plus className="h-4 w-4" />
            Crear Pregunta
          </Button>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {initialQuestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No hay preguntas aún</h3>
                <p className="text-muted-foreground text-center">
                  Crea la primera pregunta para este cuestionario
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Preguntas ({initialQuestions.length})
                </h2>
              </div>
              {initialQuestions.map((question, index) => (
                <Card key={question.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="px-8 py-8">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 ">
                        {renderQuestionPreview(question)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la pregunta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuestionToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteQuestion}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  )
}
