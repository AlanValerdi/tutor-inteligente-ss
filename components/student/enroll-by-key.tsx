"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface EnrollByKeyProps {
  onEnrollSuccess: () => void
  isEnrolling?: boolean
}

export function EnrollByKey({ onEnrollSuccess, isEnrolling: externalIsEnrolling = false }: EnrollByKeyProps) {
  const [enrollKey, setEnrollKey] = useState("")
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enrollmentInProgress = externalIsEnrolling || isEnrolling

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!enrollKey.trim()) {
      setError("Por favor ingresa una clave de inscripción")
      return
    }

    setIsEnrolling(true)
    setError(null)

    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollKey: enrollKey.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al inscribirse en el curso")
      }

      toast.success(`¡Inscripción exitosa en ${data.course.title}!`)
      setEnrollKey("")
      onEnrollSuccess()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al inscribirse"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsEnrolling(false)
    }
  }

  const formatKey = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    
    // Add dashes every 4 characters (format: XXXX-XXXX-XXXX)
    const parts = []
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.slice(i, i + 4))
    }
    
    return parts.join('-').slice(0, 14) // Max length: XXXX-XXXX-XXXX
  }

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatKey(e.target.value)
    setEnrollKey(formatted)
    setError(null)
  }

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Key className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Inscribirse a un Curso</CardTitle>
            <CardDescription className="text-base">
              Ingresa la clave de inscripción proporcionada por tu instructor
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleEnroll} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="enrollKey" className="text-base">
                  Clave de Inscripción
                </Label>
                <Input
                  id="enrollKey"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={enrollKey}
                  onChange={handleKeyChange}
                  disabled={enrollmentInProgress}
                  className="text-center text-lg font-mono tracking-wider h-12"
                  maxLength={14}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Formato: 4 grupos de 4 caracteres separados por guiones
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={enrollmentInProgress || !enrollKey.trim()}
              >
                {enrollmentInProgress ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Inscribiendo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Inscribirse al Curso
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                ¿Cómo obtener una clave?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Tu instructor te proporcionará una clave única para su curso</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>La clave tiene el formato: XXXX-XXXX-XXXX (12 caracteres)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Cada clave es válida para un solo curso específico</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Si no tienes una clave, contacta a tu instructor</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
