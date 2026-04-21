"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react"
import { updateCourse } from "@/lib/actions/teacher"

interface EditCourseFormProps {
  courseId: string
  initialTitle: string
  initialDescription: string | null
}

export function EditCourseForm({ courseId, initialTitle, initialDescription }: EditCourseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: initialTitle,
    description: initialDescription ?? "",
  })

  const hasChanges =
    formData.title !== initialTitle ||
    formData.description !== (initialDescription ?? "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError("El título es obligatorio")
      return
    }

    setLoading(true)
    setError("")

    try {
      await updateCourse(courseId, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
      })
      setSuccess(true)
      setTimeout(() => router.push("/teacher"), 1500)
    } catch (err: any) {
      setError(err.message || "Error al guardar los cambios")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">Editar Curso</h1>
          <p className="text-muted-foreground">Modifica el título y la descripción del curso.</p>
        </div>
        <Button variant="ghost" className="gap-2" onClick={() => router.push("/teacher")}>
          <ArrowLeft className="h-4 w-4" />
          Volver al Panel
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">¡Cambios guardados!</p>
                <p className="text-xs text-green-700">Volviendo al panel…</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
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

            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || success || !hasChanges || !formData.title.trim()}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? "Guardando..." : "Guardar Cambios"}
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
    </div>
  )
}
