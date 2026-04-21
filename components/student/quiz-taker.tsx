"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { submitQuizAttempt } from "@/lib/actions/student"
import { QuestionType } from "@prisma/client"

interface QuizData {
  id: string
  title: string
  description: string | null
  timeLimit: number | null
  passingScore: number
  shuffleQuestions: boolean
}

interface QuestionData {
  id: string
  type: QuestionType
  questionText: string
  imageUrl: string | null
  order: number
  points: number
  options: any // JSON data structure depends on type
  explanation: string | null
}

interface QuizTakerProps {
  quiz: QuizData
  questions: QuestionData[]
  courseId: string
  topicId: string
  userId: string
}

interface Answer {
  questionId: string
  selectedAnswer: string | null
}

export function QuizTaker({ quiz, questions, courseId, topicId, userId }: QuizTakerProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(q => ({ questionId: q.id, selectedAnswer: null }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  )
  const [startTime] = useState(Date.now())
  
  // Anxiety tracking metrics
  const [tabSwitches, setTabSwitches] = useState(0)
  const [consecutiveClicks, setConsecutiveClicks] = useState(0)
  const [missedClicks, setMissedClicks] = useState(0)
  const [scrollReversals, setScrollReversals] = useState(0)
  const [idleTime, setIdleTime] = useState(0)
  
  const lastActivityRef = useRef(Date.now())
  const lastScrollPositionRef = useRef(0)
  const lastScrollDirectionRef = useRef<'up' | 'down' | null>(null)
  const clickTimestampsRef = useRef<number[]>([])
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Shuffle questions if required
  const [displayQuestions] = useState(() => {
    if (quiz.shuffleQuestions) {
      return [...questions].sort(() => Math.random() - 0.5)
    }
    return questions
  })

  const currentQuestion = displayQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / displayQuestions.length) * 100

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          // Auto-submit when time runs out
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining])

  // Tab visibility tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // Click tracking (consecutive clicks and missed clicks)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const now = Date.now()
      clickTimestampsRef.current.push(now)
      
      // Keep only last 5 clicks
      if (clickTimestampsRef.current.length > 5) {
        clickTimestampsRef.current.shift()
      }

      // Check for consecutive clicks (3+ clicks within 1 second)
      const recentClicks = clickTimestampsRef.current.filter(t => now - t < 1000)
      if (recentClicks.length >= 3) {
        setConsecutiveClicks(prev => prev + 1)
        clickTimestampsRef.current = [] // Reset
      }

      // Check if click missed interactive elements
      const target = e.target as HTMLElement
      const isInteractive = target.closest('button, input, label, a, [role="button"]')
      if (!isInteractive && target.tagName !== 'BODY' && target.tagName !== 'HTML') {
        setMissedClicks(prev => prev + 1)
      }

      // Reset idle timer
      lastActivityRef.current = now
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  // Scroll tracking (reversals)
  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.scrollY
      const direction = currentPosition > lastScrollPositionRef.current ? 'down' : 'up'
      
      if (lastScrollDirectionRef.current && lastScrollDirectionRef.current !== direction) {
        setScrollReversals(prev => prev + 1)
      }
      
      lastScrollPositionRef.current = currentPosition
      lastScrollDirectionRef.current = direction
      lastActivityRef.current = Date.now()
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Idle time tracking
  useEffect(() => {
    const checkIdle = () => {
      const now = Date.now()
      const timeSinceActivity = now - lastActivityRef.current
      
      // If idle for more than 5 seconds, count it
      if (timeSinceActivity > 5000) {
        setIdleTime(prev => prev + Math.floor(timeSinceActivity / 1000))
        lastActivityRef.current = now
      }
    }

    idleTimerRef.current = setInterval(checkIdle, 5000)
    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current)
    }
  }, [])

  // Handle answer selection
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev =>
      prev.map(a =>
        a.questionId === questionId ? { ...a, selectedAnswer: answer } : a
      )
    )
  }

  // Navigation
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < displayQuestions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  // Auto-submit when time runs out
  const handleAutoSubmit = async () => {
    await handleSubmit(true)
  }

  // Submit quiz
  const handleSubmit = async (isAutoSubmit = false) => {
    if (isSubmitting) return

    // Check if all questions are answered (unless auto-submit)
    if (!isAutoSubmit) {
      const unanswered = answers.filter(a => a.selectedAnswer === null)
      if (unanswered.length > 0) {
        setShowConfirmSubmit(true)
        return
      }
    }

    setIsSubmitting(true)

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)

      const result = await submitQuizAttempt({
        quizId: quiz.id,
        userId,
        answers: answers.map(a => ({
          questionId: a.questionId,
          selectedAnswer: a.selectedAnswer || ""
        })),
        timeSpent,
        anxietyMetrics: {
          tabSwitches,
          consecutiveClicks,
          missedClicks,
          idleTimeSeconds: idleTime,
          scrollReversals
        }
      })

      if (result.success && result.attemptId) {
        router.push(`/student/courses/${courseId}/topics/${topicId}/quizzes/${quiz.id}/results/${result.attemptId}`)
      } else {
        alert(result.error || "Error al enviar el cuestionario")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      alert("Error al enviar el cuestionario")
      setIsSubmitting(false)
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Render question based on type
  const renderQuestion = () => {
    const answer = answers.find(a => a.questionId === currentQuestion.id)

    switch (currentQuestion.type) {
    case "MULTIPLE_CHOICE":
      const mcOptions = currentQuestion.options as Array<{ text: string; isCorrect: boolean }>
      return (
        <RadioGroup
          value={answer?.selectedAnswer || ""}
          onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
        >
          <div className="space-y-4"> {/* Aumenté un poco el espacio */}
            {mcOptions.map((option, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={option.text} id={`option-${idx}`} className="mt-1 shrink-0" />
                <Label 
                  htmlFor={`option-${idx}`} 
                  className="flex-1 cursor-pointer text-base leading-relaxed break-words whitespace-normal"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )

      case "TRUE_FALSE":
        return (
          <RadioGroup
            value={answer?.selectedAnswer || ""}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true-option" />
                <Label htmlFor="true-option" className="flex-1 cursor-pointer">
                  Verdadero
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false-option" />
                <Label htmlFor="false-option" className="flex-1 cursor-pointer">
                  Falso
                </Label>
              </div>
            </div>
          </RadioGroup>
        )

      case "SHORT_ANSWER":
        return (
          <div>
            <Input
              type="text"
              placeholder="Escribe tu respuesta aquí..."
              value={answer?.selectedAnswer || ""}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Escribe tu respuesta de forma clara y concisa
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-muted-foreground">{quiz.description}</p>
          )}
        </div>

        {/* Timer and Progress */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Pregunta {currentQuestionIndex + 1} de {displayQuestions.length}
            </div>
            {timeRemaining !== null && (
              <div className={`flex items-center gap-2 ${timeRemaining < 60 ? 'text-red-600' : ''}`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Time warning */}
        {timeRemaining !== null && timeRemaining < 60 && (
          <Alert className="mb-6 border-red-600">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ¡Menos de 1 minuto restante! El cuestionario se enviará automáticamente cuando el tiempo termine.
            </AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0"> {/* min-w-0 ayuda a que el flex-1 respete el break-words */}
              <CardTitle className="text-xl md:text-2xl mb-2 break-words leading-tight">
                {currentQuestion.questionText}
              </CardTitle>
              <CardDescription>
                Puntos: {currentQuestion.points}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
          <CardContent>
            {currentQuestion.imageUrl && (
              <div className="mb-6">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question illustration"
                  className="max-w-full h-auto rounded-lg border"
                />
              </div>
            )}
            {renderQuestion()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => goToQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

            <div className="flex flex-wrap justify-center gap-2 max-w-full">
              {displayQuestions.map((_, idx) => {
                const hasAnswer = answers[idx]?.selectedAnswer !== null
                return (
                  <button
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    className={`w-8 h-8 shrink-0 rounded-full text-sm font-medium transition-colors ${
                      idx === currentQuestionIndex
                        ? 'bg-primary text-primary-foreground'
                        : hasAnswer
                        ? 'bg-green-100 text-green-900 hover:bg-green-200'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            
          {currentQuestionIndex < displayQuestions.length - 1 ? (
            <Button
              variant="outline"
              onClick={() => goToQuestion(currentQuestionIndex + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Cuestionario"}
            </Button>
          )}
        </div>

        {/* Confirm submit dialog */}
        {showConfirmSubmit && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tienes {answers.filter(a => a.selectedAnswer === null).length} pregunta(s) sin responder.
              ¿Estás seguro de que quieres enviar el cuestionario?
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                >
                  Sí, enviar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                >
                  Cancelar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
