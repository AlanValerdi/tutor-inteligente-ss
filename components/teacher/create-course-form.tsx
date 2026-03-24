"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, CheckCircle2 } from "lucide-react"
import { createCourse } from "@/lib/actions/teacher"

export function CreateCourseForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    enrollKey: ""
  })

  const generateEnrollKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let key = ""
    for (let i = 0; i < 12; i++) {
      if (i === 4 || i === 8) {
        key += "-"
      } else {
        key += chars.charAt(Math.floor(Math.random() * chars.length))
      }
    }
    setFormData({ ...formData, enrollKey: key })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.enrollKey) {
      setError("El título y la clave de inscripción son obligatorios")
      return
    }

    setLoading(true)
    setError("")
    
    try {
      const course = await createCourse({
        title: formData.title,
        description: formData.description || undefined,
        enrollKey: formData.enrollKey
      })
      
      setSuccess(true)
      
      // Redirect to topic management after 1.5 seconds
      setTimeout(() => {
        router.push(`/teacher/courses/${course.id}/topics`)
      }, 1500)
      
    } catch (err: any) {
      setError(err.message || "Error al crear el curso")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        variant="ghost"
        className="gap-2 mb-6"
        onClick={() => router.push("/teacher")}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Panel
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Crear Nuevo Curso</CardTitle>
          <CardDescription>
            Completa los detalles del curso. Podrás agregar temas después de crearlo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-6 flex items-center gap-3 p-4 rounded-lg border border-success/30 bg-success/5">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-success">
                  ¡Curso creado exitosamente!
                </p>
                <p className="text-xs text-success/80">
                  Redirigiendo a la gestión de temas...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Título del Curso <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Introducción a la Programación"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading || success}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente de qué trata el curso..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading || success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollKey">
                Clave de Inscripción <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="enrollKey"
                  placeholder="XXXX-XXXX-XXXX"
                  value={formData.enrollKey}
                  onChange={(e) => setFormData({ ...formData, enrollKey: e.target.value.toUpperCase() })}
                  disabled={loading || success}
                  required
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateEnrollKey}
                  disabled={loading || success}
                >
                  Generar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Los estudiantes usarán esta clave para inscribirse en el curso
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || success || !formData.title || !formData.enrollKey}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {loading ? "Creando..." : "Crear Curso"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/teacher")}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-sm mb-2">💡 Siguiente paso</h3>
          <p className="text-sm text-muted-foreground">
            Después de crear el curso, serás redirigido automáticamente a la página de gestión de temas 
            donde podrás agregar contenido para tus estudiantes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
