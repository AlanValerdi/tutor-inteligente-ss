"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TopicDetails {
  id: string
  title: string
  content: string
  order: number
}

interface TopicDetailProps {
  topic: TopicDetails
  topicIndex: number
  totalTopics: number
  profile: string
  onBack: () => void
  onComplete: () => void
}

export function TopicDetailAdapter({ 
  topic, 
  topicIndex, 
  totalTopics, 
  profile, 
  onBack, 
  onComplete 
}: TopicDetailProps) {
  const [completed, setCompleted] = useState(false)

  const handleComplete = () => {
    setCompleted(true)
    // Here you would typically update the progress in the database
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

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
                {topic.content.split('\n').map((paragraph, index) => {
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
                })}
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

        {/* Completion section */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              {completed ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-12 w-12 text-success" />
                  </div>
                  <h3 className="font-semibold text-success">¡Tema Completado!</h3>
                  <p className="text-muted-foreground">
                    Has terminado este tema exitosamente. Continuemos con el siguiente.
                  </p>
                  <Button onClick={onComplete} className="gap-2">
                    Continuar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold">¿Has terminado de estudiar este tema?</h3>
                  <p className="text-muted-foreground">
                    Asegúrate de haber comprendido el contenido antes de continuar.
                  </p>
                  <Button onClick={handleComplete} className="gap-2">
                    Marcar como Completado
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}