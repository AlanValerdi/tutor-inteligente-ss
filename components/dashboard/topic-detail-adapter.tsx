"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  onBack: () => void
  onComplete: () => void
}

export function TopicDetailAdapter({ 
  topic, 
  topicIndex, 
  totalTopics, 
  profile,
  courseId,
  quizzes,
  onBack, 
  onComplete 
}: TopicDetailProps) {
  const router = useRouter()
  const [contentRead, setContentRead] = useState(false)

  // Check if all quizzes are passed
  const allQuizzesPassed = quizzes.length > 0 
    ? quizzes.every(q => q.bestAttempt?.passed) 
    : true

  const handleMarkAsRead = () => {
    setContentRead(true)
  }

  const canProceed = quizzes.length === 0 || allQuizzesPassed

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver al Curso
          </Button>
          <div className="text-sm text-muted-foreground">
            Tema {topicIndex + 1} de {totalTopics}
          </div>
        </div>

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
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {/* Render content with basic formatting */}
                {typeof topic.content === 'string' 
                  ? topic.content.split('\n').map((paragraph: string, index: number) => {
                  if (paragraph.trim() === '') return <br key={index} />
                  
                  // Simple formatting for headers
                  if (paragraph.startsWith('# ')) {
                    return <h3 key={index} className="text-lg font-semibold mt-6 mb-3">{paragraph.substring(2)}</h3>
                  }
                  
                  if (paragraph.startsWith('## ')) {
                    return <h4 key={index} className="text-base font-semibold mt-4 mb-2">{paragraph.substring(3)}</h4>
                  }
                  
                  // Lists
                  if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={index} className="list-disc list-inside mb-3">
                        <li>{paragraph.substring(2)}</li>
                      </ul>
                    )
                  }
                  
                  // Regular paragraphs
                  return (
                    <p key={index} className="mb-4 leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  )
                }) : (
                  <div className="text-muted-foreground">
                    El contenido utiliza el nuevo formato de bloques. (Soporte en desarrollo)
                  </div>
                )}
              </div>
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
                <Button onClick={handleMarkAsRead} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Marcar como Leído
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
                    <Button onClick={onComplete} className="gap-2">
                      Continuar al Siguiente Tema
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
    </div>
  )
}