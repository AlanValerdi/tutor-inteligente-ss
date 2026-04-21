"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, CheckCircle2, Copy, Check } from "lucide-react"
import { createCourse } from "@/lib/actions/teacher"

export function CreateCourseForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      setError("El título es obligatorio")
      return
    }

    setLoading(true)
    setError("")

    try {
      const course = await createCourse({
        title: formData.title,
        description: formData.description || undefined,
      })

      setCreatedKey(course.enrollKey)

      setTimeout(() => {
        router.push(`/teacher/courses/${course.id}/topics`)
      }, 4000)
    } catch (err: any) {
      setError(err.message || "Error al crear el curso")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!createdKey) return
    navigator.clipboard.writeText(createdKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-1 font-display text-2xl font-bold text-foreground">Crear Nuevo Curso</h1>
            <p className="text-muted-foreground">
              Completa los detalles del curso. Podrás agregar temas después de crearlo.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/teacher")}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Panel
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {createdKey && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">¡Curso creado exitosamente!</p>
                  <p className="text-xs text-green-700">Comparte esta clave con tus estudiantes para que puedan inscribirse.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-white border border-green-200 px-4 py-2 font-mono text-lg font-semibold tracking-widest text-center text-green-900">
                  {createdKey}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0 border-green-200 hover:bg-green-100"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-green-600" />}
                </Button>
              </div>
              <p className="text-xs text-green-700 text-center">Redirigiendo a gestión de temas…</p>
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
                disabled={loading || !!createdKey}
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
                disabled={loading || !!createdKey}
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !!createdKey || !formData.title}
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
            Después de crear el curso, recibirás una clave de inscripción generada automáticamente.
            Compártela con tus estudiantes para que puedan unirse.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
