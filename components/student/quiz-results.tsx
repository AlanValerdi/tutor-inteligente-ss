"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  RotateCcw,
  Trophy,
  Clock,
  Target
} from "lucide-react"
import { QuestionType } from "@prisma/client"

interface AttemptData {
  id: string
  score: number
  totalPoints: number
  maxPoints: number
  passed: boolean
  timeSpent: number | null
  completedAt: Date | null
  answers: Array<{
    questionId: string
    selectedAnswer: string | null
    isCorrect: boolean
    pointsEarned: number
  }>
  anxietyMetrics: {
    tabSwitches: number
    consecutiveClicks: number
    missedClicks: number
    idleTimeSeconds: number
    scrollReversals: number
  }
}

interface QuizData {
  id: string
  title: string
  passingScore: number
  questions: Array<{
    id: string
    type: QuestionType
    questionText: string
    imageUrl: string | null
    points: number
    options: any
    explanation: string | null
  }>
}

interface QuizResultsProps {
  attempt: AttemptData
  quiz: QuizData
  canRetry: boolean
  courseId: string
  topicId: string
}

export function QuizResults({ attempt, quiz, canRetry, courseId, topicId }: QuizResultsProps) {
  const router = useRouter()

  // Format time
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Get correct answer text
  const getCorrectAnswer = (question: any): string => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE: {
        const options = question.options as Array<{ text: string; isCorrect: boolean }>
        return options.find(opt => opt.isCorrect)?.text || "N/A"
      }
      case QuestionType.TRUE_FALSE: {
        const options = question.options as { correctAnswer: boolean }
        return options.correctAnswer ? "Verdadero" : "Falso"
      }
      case QuestionType.SHORT_ANSWER: {
        const options = question.options as { acceptedAnswers: string[] }
        return options.acceptedAnswers.join(" / ")
      }
      default:
        return "N/A"
    }
  }

  // Calculate anxiety level (kept for future use, but not displayed to students)
  const getAnxietyLevel = () => {
    const { tabSwitches, consecutiveClicks, missedClicks, scrollReversals } = attempt.anxietyMetrics
    const score = 
      (tabSwitches > 5 ? 2 : tabSwitches > 2 ? 1 : 0) +
      (consecutiveClicks > 3 ? 2 : consecutiveClicks > 1 ? 1 : 0) +
      (missedClicks > 5 ? 2 : missedClicks > 2 ? 1 : 0) +
      (scrollReversals > 10 ? 2 : scrollReversals > 5 ? 1 : 0)

    if (score >= 6) return { level: "Alto", color: "text-red-600", bgColor: "bg-red-100" }
    if (score >= 3) return { level: "Medio", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    return { level: "Bajo", color: "text-green-600", bgColor: "bg-green-100" }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Resultados del Cuestionario</h1>
          <p className="text-muted-foreground">{quiz.title}</p>
        </div>

        {/* Score Summary */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {attempt.passed ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Trophy className="h-8 w-8" />
                      ¡Aprobado!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-8 w-8" />
                      No Aprobado
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Puntuación: {attempt.score}% ({attempt.totalPoints}/{attempt.maxPoints} puntos)
                </CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {attempt.score}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Requerido: {quiz.passingScore}%
                </div>
              </div>
            </div>
          </CardHeader>
           <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="flex items-center gap-2">
                 <Clock className="h-5 w-5 text-muted-foreground" />
                 <div>
                   <div className="text-sm text-muted-foreground">Tiempo</div>
                   <div className="font-medium">{formatTime(attempt.timeSpent)}</div>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <Target className="h-5 w-5 text-muted-foreground" />
                 <div>
                   <div className="text-sm text-muted-foreground">Correctas</div>
                   <div className="font-medium">
                     {attempt.answers.filter(a => a.isCorrect).length}/{quiz.questions.length}
                   </div>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>

         {/* Question Review */}
        <div className="space-y-4 mb-6">
          <h2 className="text-2xl font-bold">Revisión de Preguntas</h2>
          {quiz.questions.map((question, idx) => {
            const answer = attempt.answers.find(a => a.questionId === question.id)
            const isCorrect = answer?.isCorrect || false

            return (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        Pregunta {idx + 1}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {question.questionText}
                      </CardDescription>
                    </div>
                    <Badge variant={isCorrect ? "default" : "destructive"}>
                      {answer?.pointsEarned || 0}/{question.points} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {question.imageUrl && (
                    <img
                      src={question.imageUrl}
                      alt="Question illustration"
                      className="max-w-md h-auto rounded-lg border"
                    />
                  )}
                  
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Tu respuesta: </span>
                      <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                        {answer?.selectedAnswer || "Sin respuesta"}
                      </span>
                    </div>
                    
                    {!isCorrect && (
                      <div>
                        <span className="font-medium">Respuesta correcta: </span>
                        <span className="text-green-600">
                          {getCorrectAnswer(question)}
                        </span>
                      </div>
                    )}

                    {question.explanation && (
                      <Alert>
                        <AlertDescription>
                          <strong>Explicación:</strong> {question.explanation}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/student/courses/${courseId}/topics/${topicId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Tema
          </Button>
          
          {canRetry && !attempt.passed && (
            <Button
              onClick={() => router.push(`/student/courses/${courseId}/topics/${topicId}/quizzes/${quiz.id}/take`)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reintentar Quiz
            </Button>
          )}
        </div>

        {!canRetry && !attempt.passed && (
          <Alert className="mt-4">
            <AlertDescription>
              Has agotado todos tus intentos para este cuestionario. Por favor, contacta a tu profesor si necesitas más intentos.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
