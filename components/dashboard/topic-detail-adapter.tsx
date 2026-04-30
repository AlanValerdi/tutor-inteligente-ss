"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useInteractionTracker } from "@/hooks/use-interaction-tracker"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  BookOpen,
  FileQuestion,
  Clock,
  Trophy,
  Lock,
  Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TopicContentViewer } from "@/components/student/topic-content-viewer"
import { parseTopicContent } from "@/lib/content-helpers"

interface TopicDetails {
  id: string
  title: string
  content: any
  order: number
}

interface QuizData {
  id: string
  title: string
  description: string | null
  passingScore: number
  maxAttempts: number | null
  timeLimit: number | null
  questionsCount: number
  bestAttempt: {
    score: number
    passed: boolean
  } | null
  attemptCount: number
}

interface TopicDetailProps {
  topic: TopicDetails
  topicIndex: number
  totalTopics: number
  profile: string
  courseId: string
  quizzes: QuizData[]
  backUrl: string
  nextTopicUrl: string | null
  isContentRead?: boolean
}

export function TopicDetailAdapter({ 
  topic, 
  topicIndex, 
  totalTopics, 
  profile,
  courseId,
  quizzes,
  backUrl,
  nextTopicUrl,
  isContentRead = false
}: TopicDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [contentRead, setContentRead] = useState(isContentRead)
  const [isMarking, setIsMarking] = useState(false)

  useInteractionTracker({ topicId: topic.id, courseId })

  // Check if all quizzes are passed
  const allQuizzesPassed = quizzes.length > 0 
    ? quizzes.every(q => q.bestAttempt?.passed) 
    : true

  const handleMarkAsRead = async () => {
    setIsMarking(true)
    try {
      const response = await fetch("/api/topics/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, courseId })
      })

      if (!response.ok) {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "No se pudo marcar el tema como leído",
          variant: "destructive"
        })
        return
      }

      const data = await response.json()
      setContentRead(true)
      
      toast({
        title: "Éxito",
        description: `Tema marcado como leído. Progreso del curso: ${data.progress}%`
      })

      // Revalidate the page to refresh progress
      router.refresh()
    } catch (error) {
      console.error("Error marking as read:", error)
      toast({
        title: "Error",
        description: "Error al marcar el tema como leído",
        variant: "destructive"
      })
    } finally {
      setIsMarking(false)
    }
  }

  const canProceed = quizzes.length === 0 || allQuizzesPassed

  // Parse content - handle both string and object formats
  const parsedContent = typeof topic.content === 'string' 
    ? parseTopicContent(topic.content) 
    : topic.content;

  // Ensure we always have an object with blocks array
  const safeContent = (parsedContent && typeof parsedContent === 'object' && Array.isArray(parsedContent.blocks))
    ? parsedContent
    : { version: "1.0", blocks: [] };

  return (
    <div className="px-8 py-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${((topicIndex + 1) / totalTopics) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-primary">
            {Math.round(((topicIndex + 1) / totalTopics) * 100)}%
          </span>
        </div>
      </div>

      {/* Topic content */}
      <div className="mb-8">
        <h1 className="mb-4 font-display text-2xl font-bold text-foreground">{topic.title}</h1>
        
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contenido del Tema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopicContentViewer 
              content={safeContent} 
              profile={profile} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Learning profile adaptation message */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-2">Contenido Adaptado</h3>
                <p className="text-sm text-muted-foreground">
                  Este contenido ha sido adaptado para tu perfil de aprendizaje <strong>{profile}</strong>. 
                  Toma el tiempo que necesites para asimilar la información.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mark as Read Button */}
        {!contentRead && (
          <Card className="mb-8 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="font-semibold">¿Has terminado de leer el contenido?</h3>
                <p className="text-sm text-muted-foreground">
                  Asegúrate de haber comprendido el material antes de continuar
                </p>
                <Button 
                  onClick={handleMarkAsRead} 
                  className="gap-2"
                  disabled={isMarking}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isMarking ? "Marcando..." : "Marcar como Leído"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quizzes Section */}
        {contentRead && quizzes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Cuestionarios de Evaluación</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Completa los siguientes cuestionarios para demostrar tu comprensión del tema
            </p>
            
            <div className="space-y-4">
              {quizzes.map((quiz) => {
                const canAttempt = quiz.maxAttempts === null || quiz.attemptCount < quiz.maxAttempts
                const hasPassed = quiz.bestAttempt?.passed || false
                
                return (
                  <Card key={quiz.id} className={`${hasPassed ? 'border-success/50 bg-success/5' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{quiz.title}</h3>
                            {hasPassed && (
                              <Badge className="bg-success hover:bg-success">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Aprobado
                              </Badge>
                            )}
                          </div>
                          
                          {quiz.description && (
                            <p className="text-sm text-muted-foreground mb-3">{quiz.description}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileQuestion className="h-3 w-3" />
                              {quiz.questionsCount} preguntas
                            </span>
                            {quiz.timeLimit && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {quiz.timeLimit} minutos
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {quiz.passingScore}% mínimo
                            </span>
                            {quiz.maxAttempts && (
                              <span className="flex items-center gap-1">
                                Intentos: {quiz.attemptCount}/{quiz.maxAttempts}
                              </span>
                            )}
                          </div>
                          
                          {quiz.bestAttempt && (
                            <div className="mt-3 p-3 rounded-lg bg-muted/50">
                              <div className="text-xs">
                                <span className="font-medium">Mejor intento:</span>{" "}
                                <span className={quiz.bestAttempt.passed ? "text-success font-semibold" : "text-destructive"}>
                                  {quiz.bestAttempt.score}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          {hasPassed ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/student/courses/${courseId}/topics/${topic.id}/quizzes/${quiz.id}/take`)}
                              className="gap-2"
                            >
                              <Play className="h-4 w-4" />
                              Volver a Intentar
                            </Button>
                          ) : canAttempt ? (
                            <Button
                              size="sm"
                              onClick={() => router.push(`/student/courses/${courseId}/topics/${topic.id}/quizzes/${quiz.id}/take`)}
                              className="gap-2"
                            >
                              <Play className="h-4 w-4" />
                              {quiz.attemptCount > 0 ? 'Reintentar' : 'Comenzar'}
                            </Button>
                          ) : (
                            <Button size="sm" disabled className="gap-2">
                              <Lock className="h-4 w-4" />
                              Sin Intentos
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Completion section */}
        {contentRead && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center">
                {canProceed ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-12 w-12 text-success" />
                    </div>
                    <h3 className="font-semibold text-success">¡Tema Completado!</h3>
                    <p className="text-muted-foreground">
                      {quizzes.length > 0 
                        ? "Has aprobado todos los cuestionarios. ¡Excelente trabajo!"
                        : "Has terminado de estudiar este tema."}
                    </p>
                    <Button onClick={() => router.push(nextTopicUrl || backUrl)} className="gap-2">
                      {nextTopicUrl ? "Continuar al Siguiente Tema" : "Volver al Curso"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Lock className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold">Completa los Cuestionarios</h3>
                    <p className="text-muted-foreground">
                      Debes aprobar todos los cuestionarios para continuar al siguiente tema
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  )
}
