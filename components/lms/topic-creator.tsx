"use client"

import { useState } from "react"
import { Upload, FileText, Video, Headphones, Plus, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { courses } from "@/lib/lms-data"

export function TopicCreator() {
  const [submitted, setSubmitted] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [duration, setDuration] = useState("")

  const handleSubmit = () => {
    if (title && description && selectedCourse && duration) {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setTitle("")
        setDescription("")
        setSelectedCourse("")
        setDuration("")
      }, 3000)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">Crear Nuevo Tema</h1>
          <p className="text-muted-foreground">
            Agrega un nuevo tema a un curso con contenido para cada perfil de aprendizaje.
          </p>
        </div>

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
              <CardTitle className="font-display text-lg">Detalles del Tema</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="course">Curso</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                <Label htmlFor="description">Descripcion</Label>
                <Textarea
                  id="description"
                  placeholder="Breve descripcion de lo que cubre este tema..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="duration">Duracion Estimada</Label>
                <Input
                  id="duration"
                  placeholder="Ej: 45 min"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
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
                  <Button variant="outline" size="sm" className="gap-2 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent">
                    <Upload className="h-3.5 w-3.5" />
                    Subir Video
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 border-accent/30 text-accent hover:bg-accent/10 hover:text-accent">
                    <FileText className="h-3.5 w-3.5" />
                    Subir PDF
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
                  <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
                    <Upload className="h-3.5 w-3.5" />
                    Subir Audio
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
                    <FileText className="h-3.5 w-3.5" />
                    Subir Transcripcion
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
                  <Button variant="outline" size="sm" className="gap-2 border-warning/30 text-warning-foreground hover:bg-warning/10 hover:text-warning-foreground">
                    <Upload className="h-3.5 w-3.5" />
                    Subir Ejercicio
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 border-warning/30 text-warning-foreground hover:bg-warning/10 hover:text-warning-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Subir PDF
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
                  Crea preguntas de opcion multiple para este tema.
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-3.5 w-3.5" />
                  Agregar Pregunta
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-3 pb-8">
            <Button variant="outline">Guardar como Borrador</Button>
            <Button className="gap-2" onClick={handleSubmit}>
              <Plus className="h-4 w-4" />
              Crear Tema
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
