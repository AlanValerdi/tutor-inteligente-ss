"use client"

import { CheckCircle2, Lock, Circle, BookOpen, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Helper to extract preview text from topic content
function getContentPreview(content: any): string {
  if (typeof content === 'string') {
    return content.substring(0, 100)
  }
  
  // If it's our JSON block structure, try to get text from first text block
  if (content && typeof content === 'object' && Array.isArray(content.blocks)) {
    const textBlock = content.blocks.find((b: any) => b.type === 'text')
    if (textBlock?.content) {
      // Strip HTML tags and get plain text
      const plainText = textBlock.content.replace(/<[^>]*>/g, ' ').trim()
      return plainText.substring(0, 100)
    }
  }
  
  return "Contenido multimedia disponible"
}

// Helper to check if topic has content for the given profile
function hasContentForProfile(content: any, profileName: string): boolean {
  if (!content || typeof content !== 'object' || !Array.isArray(content.blocks)) {
    return true // If no blocks structure, assume it has content
  }
  
  // Check if any block includes the student's profile
  return content.blocks.some((block: any) => 
    Array.isArray(block.profiles) && block.profiles.includes(profileName)
  )
}

interface CourseDetails {
  id: string
  title: string
  description: string | null
  topics: {
    id: string
    title: string
    content: any
    order: number
  }[]
  teacher: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  _count?: {
    enrollments: number
  }
}

interface CourseViewProps {
  course: CourseDetails
  courseId: string
  studentProfile?: string
}

export function CourseViewAdapter({ course, courseId, studentProfile = "Visual" }: CourseViewProps) {
  const router = useRouter()
  
  // Filter topics that have content for the student's profile
  const availableTopics = course.topics.filter(topic => 
    hasContentForProfile(topic.content, studentProfile)
  )
  
  // Mock progress calculation - in a real app you'd track this per user
  const courseProgress = 0 // This should come from enrollment data

  const handleSelectTopic = (topicId: string) => {
    router.push(`/student/courses/${courseId}/topics/${topicId}`)
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
          <h1 className="mb-2 font-display text-2xl font-bold text-foreground">{course.title}</h1>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            {course.description || "Explora el contenido de este curso y desarrolla nuevas habilidades."}
          </p>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              {availableTopics.length} temas disponibles
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              Instructor: {course.teacher.name || "Sin nombre"}
            </div>
            {course._count && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                {course._count.enrollments} estudiantes inscritos
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center gap-3">
            <Progress value={courseProgress} className="h-2 flex-1 max-w-xs" />
            <span className="text-sm font-medium text-primary">{courseProgress}% completado</span>
          </div>
        </div>

        <h2 className="mb-6 font-display text-lg font-semibold text-foreground">Contenido del Curso</h2>

        <div className="relative">
          <div className="absolute left-6 top-0 h-full w-0.5 bg-border" aria-hidden="true" />
          
          <div className="space-y-4">
            {availableTopics
              .sort((a, b) => a.order - b.order)
              .map((topic, index) => {
                const isCompleted = false // This should come from user progress
                const isCurrentTopic = !isCompleted && index === 0 // First incomplete topic is current
                const isLocked = !isCompleted && !isCurrentTopic

                return (
                  <Card
                    key={topic.id}
                    className={`relative ml-14 cursor-pointer border-0 shadow-sm transition-all hover:shadow-md ${
                      isCurrentTopic ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    onClick={() => !isLocked && handleSelectTopic(topic.id)}
                  >
                    <div className="absolute -left-14 top-1/2 -translate-y-1/2">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? "border-success bg-success text-success-foreground"
                          : isCurrentTopic
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-background text-muted-foreground"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isLocked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className={`font-display font-semibold ${
                            isLocked ? "text-muted-foreground" : "text-foreground"
                          }`}>
                            {topic.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {getContentPreview(topic.content)}...
                          </p>
                          
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Tema {index + 1} de {availableTopics.length}</span>
                            {isCompleted && (
                              <span className="flex items-center gap-1 text-success">
                                <CheckCircle2 className="h-3 w-3" />
                                Completado
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {!isLocked && (
                          <div className="ml-4">
                            <Button size="sm" variant={isCurrentTopic ? "default" : "ghost"}>
                              {isCompleted ? "Revisar" : isCurrentTopic ? "Continuar" : "Comenzar"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </div>

        {availableTopics.length === 0 && (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Sin contenido disponible para tu perfil</h3>
              <p className="text-muted-foreground text-center max-w-md">
                No hay temas disponibles para tu perfil de aprendizaje <strong>{studentProfile}</strong>. 
                Por favor, espera a que el profesor suba contenido adaptado para tu estilo de aprendizaje.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
  )
}