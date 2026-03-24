"use client"

import { useState } from "react"
import { Upload, FileText, Video, Headphones, Plus, CheckCircle2, ArrowLeft, Edit2, Trash2, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { createTopic, updateTopic, deleteTopic } from "@/lib/actions/teacher"
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

interface TopicCreatorDataProps {
  course: {
    id: string
    title: string
    description: string | null
  }
  topics: {
    id: string
    title: string
    content: string
    order: number
  }[]
}

export function TopicCreatorData({ course, topics: initialTopics }: TopicCreatorDataProps) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Edit state
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  
  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = async () => {
    if (title && content) {
      setLoading(true)
      try {
        await createTopic({
          courseId: course.id,
          title,
          content,
          order: initialTopics.length + 1
        })
        
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          setTitle("")
          setContent("")
          router.refresh()
        }, 2000)
      } catch (error) {
        console.error("Error creating topic:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEditStart = (topic: typeof initialTopics[0]) => {
    setEditingTopicId(topic.id)
    setEditTitle(topic.title)
    setEditContent(topic.content)
  }

  const handleEditCancel = () => {
    setEditingTopicId(null)
    setEditTitle("")
    setEditContent("")
  }

  const handleEditSave = async (topicId: string) => {
    if (!editTitle || !editContent) return
    
    setLoading(true)
    try {
      await updateTopic(topicId, {
        title: editTitle,
        content: editContent
      })
      setEditingTopicId(null)
      router.refresh()
    } catch (error) {
      console.error("Error updating topic:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTopic = async () => {
    if (!topicToDelete) return

    setIsDeleting(true)
    try {
      await deleteTopic(topicToDelete)
      router.refresh()
    } catch (error) {
      console.error("Error deleting topic:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setTopicToDelete(null)
    }
  }

  return (
    <>
      <div className="flex-1 overflow-auto">
        <div className="px-8 py-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              className="gap-2 mb-4"
              onClick={() => router.push("/teacher")}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Panel
            </Button>
            
            <h1 className="mb-1 font-display text-2xl font-bold text-foreground">
              Gestionar Temas - {course.title}
            </h1>
            <p className="text-muted-foreground">
              {course.description || "Agrega y gestiona temas para este curso."}
            </p>
          </div>

          {/* Existing Topics List */}
          {initialTopics.length > 0 && (
            <Card className="mb-6 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg">Temas Existentes ({initialTopics.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {initialTopics.map((topic) => (
                    <div 
                      key={topic.id}
                      className="flex flex-col gap-2 p-3 rounded-lg border bg-card"
                    >
                      {editingTopicId === topic.id ? (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`edit-title-${topic.id}`} className="text-xs">Título</Label>
                            <Input
                              id={`edit-title-${topic.id}`}
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-content-${topic.id}`} className="text-xs">Contenido</Label>
                            <Textarea
                              id={`edit-content-${topic.id}`}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={4}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleEditCancel}
                              disabled={loading}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancelar
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleEditSave(topic.id)}
                              disabled={loading || !editTitle || !editContent}
                            >
                              <Save className="h-3 w-3 mr-1" />
                              {loading ? "Guardando..." : "Guardar"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{topic.order}. {topic.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {topic.content}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditStart(topic)}
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setTopicToDelete(topic.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mx-auto max-w-2xl">
            {submitted && (
              <Card className="mb-6 border-success/30 bg-success/5">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <p className="text-sm font-medium text-success">
                    Tema creado exitosamente. Se ha agregado al curso.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg">Crear Nuevo Tema</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title">Titulo del Tema</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Introduccion a las Derivadas"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="content">Contenido</Label>
                  <Textarea
                    id="content"
                    placeholder="Contenido del tema (puede incluir texto, enlaces, etc.)..."
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg">Contenido por Perfil de Aprendizaje</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sube medios distintos para cada perfil de aprendizaje. Los estudiantes veran
                  el contenido que corresponda a su estilo detectado.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Visual Profile Upload */}
                <div className="rounded-xl border border-dashed border-accent/40 bg-accent/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Video className="h-5 w-5 text-accent" />
                    <h3 className="text-sm font-semibold text-card-foreground">
                      Perfil Visual
                    </h3>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Sube contenido en video, diagramas o infografias para aprendices visuales.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent" disabled>
                      <Upload className="h-3.5 w-3.5" />
                      Subir Video (Próximamente)
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent" disabled>
                      <FileText className="h-3.5 w-3.5" />
                      Subir PDF (Próximamente)
                    </Button>
                  </div>
                </div>

                {/* Auditory Profile Upload */}
                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Headphones className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold text-card-foreground">
                      Perfil Auditivo
                    </h3>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Sube clases en audio, podcasts o contenido narrado para aprendices auditivos.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary" disabled>
                      <Upload className="h-3.5 w-3.5" />
                      Subir Audio (Próximamente)
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary" disabled>
                      <FileText className="h-3.5 w-3.5" />
                      Subir Transcripcion (Próximamente)
                    </Button>
                  </div>
                </div>

                {/* Kinesthetic Profile Upload */}
                <div className="rounded-xl border border-dashed border-warning/40 bg-warning/5 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-5 w-5 text-warning" />
                    <h3 className="text-sm font-semibold text-card-foreground">
                      Perfil Kinestesico
                    </h3>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">
                    Sube ejercicios interactivos, hojas de trabajo o guias de actividades practicas.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 border-warning/30 text-warning-foreground hover:bg-warning/10 hover:text-warning-foreground" disabled>
                      <Upload className="h-3.5 w-3.5" />
                      Subir Ejercicio (Próximamente)
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-warning/30 text-warning-foreground hover:bg-warning/10 hover:text-warning-foreground" disabled>
                      <FileText className="h-3.5 w-3.5" />
                      Subir PDF (Próximamente)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg">Cuestionario del Tema</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Agrega preguntas de cuestionario que todos los estudiantes deben aprobar para continuar.
                </p>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                  <Plus className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-card-foreground mb-1">Agregar Preguntas</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Crea preguntas de opcion multiple para este tema (Próximamente).
                  </p>
                  <Button variant="outline" size="sm" className="gap-2" disabled>
                    <Plus className="h-3.5 w-3.5" />
                    Agregar Pregunta
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-3 pb-8">
              <Button variant="outline" disabled>Guardar como Borrador</Button>
              <Button 
                className="gap-2" 
                onClick={handleSubmit}
                disabled={loading || !title || !content}
              >
                <Plus className="h-4 w-4" />
                {loading ? "Creando..." : "Crear Tema"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tema?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el tema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTopicToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTopic}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
