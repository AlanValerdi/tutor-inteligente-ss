"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { ExtractedQuestion, ParseDocxResponse } from "@/lib/types/docx"
import { DocxPreviewModal } from "./docx-preview-modal"

interface DocxUploadFormProps {
  topicId?: string
  courseId?: string
  onClose?: () => void
}

export function DocxUploadForm({ topicId, courseId, onClose }: DocxUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]

    setError(null)
    setQuestions([])

    if (!selectedFile) return

    // Validar extensión
    if (!selectedFile.name.endsWith(".docx")) {
      setError("El archivo debe ser formato DOCX (.docx)")
      return
    }

    // Validar tamaño (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("El archivo no puede exceder 5MB")
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/teacher/quizzes/parse-docx", {
        method: "POST",
        body: formData,
      })

      const data: ParseDocxResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.errors?.[0] || "Error al procesar DOCX")
      }

      if (data.questions.length === 0) {
        throw new Error("No se encontraron preguntas válidas en el DOCX")
      }

      setQuestions(data.questions)
      setShowPreview(true)
    } catch (err: any) {
      setError(err.message || "Error al procesar el archivo")
      console.error("Upload error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (showPreview && questions.length > 0) {
    return (
      <DocxPreviewModal
        questions={questions}
        topicId={topicId}
        courseId={courseId}
        onClose={() => {
          setShowPreview(false)
          setFile(null)
          setQuestions([])
          onClose?.()
        }}
      />
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle>Cargar Cuestionario desde DOCX</CardTitle>
        <CardDescription>
          Sube un archivo Word con tabla de preguntas. Debe contener columnas: Pregunta, Tipo,
          Opciones, Respuesta Correcta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {file && !showPreview && (
          <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div className="flex-1">
              <p className="font-medium text-sm text-success">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            onChange={handleFileSelect}
            disabled={loading}
            className="cursor-pointer"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="gap-2 flex-1"
            >
              <FileUp className="h-4 w-4" />
              {loading ? "Procesando..." : "Procesar DOCX"}
            </Button>

            {file && (
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setError(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
                disabled={loading}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>
            <strong>Formato esperado:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Columnas: <code className="bg-muted px-1">Pregunta</code>,{" "}
              <code className="bg-muted px-1">Tipo</code>, <code className="bg-muted px-1">Opción A/B/C/D</code>,{" "}
              <code className="bg-muted px-1">Respuesta Correcta</code>,{" "}
              <code className="bg-muted px-1">Explicación</code>, <code className="bg-muted px-1">Puntos</code>
            </li>
            <li>
              Tipos válidos: <code className="bg-muted px-1">MC</code> (opción múltiple),{" "}
              <code className="bg-muted px-1">VF</code> (verdadero/falso),{" "}
              <code className="bg-muted px-1">SA</code> (respuesta corta)
            </li>
            <li>Máximo 100 preguntas por archivo</li>
            <li>Tamaño máximo: 5MB</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
