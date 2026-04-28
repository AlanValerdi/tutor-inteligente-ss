"use client"

import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, ImageIcon } from "lucide-react"
import { ExtractedQuestion } from "@/lib/types/docx"

interface DocxQuestionPreviewProps {
  question: ExtractedQuestion
}

export function DocxQuestionPreview({ question }: DocxQuestionPreviewProps) {
  const getQuestionTypeLabel = (type: "MC" | "VF" | "SA"): string => {
    switch (type) {
      case "MC":
        return "Opción Múltiple"
      case "VF":
        return "Verdadero/Falso"
      case "SA":
        return "Respuesta Corta"
    }
  }

  return (
    <div className="space-y-3 overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline">{getQuestionTypeLabel(question.tipo)}</Badge>
            <Badge variant="secondary">
              {question.puntos ?? 1} {question.puntos === 1 ? "punto" : "puntos"}
            </Badge>
          </div>
          <p className="font-medium text-sm mb-2 line-clamp-2">{question.pregunta}</p>
        </div>
      </div>

      {/* Opciones Preview */}
      <div className="pl-4 space-y-2">
        {question.tipo === "MC" && (
          <div className="space-y-2">
            {["a", "b", "c", "d"].map((key) => {
              const text = question.opciones[key]
              if (!text) return null

              const isCorrect = question.respuestaCorrecta === key.toUpperCase()
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 p-2 rounded text-xs overflow-hidden ${
                    isCorrect
                      ? "bg-success/10 border border-success/20"
                      : "bg-muted/30"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isCorrect
                        ? "border-success bg-success"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isCorrect && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <span className="truncate">{text}</span>
                </div>
              )
            })}
          </div>
        )}

        {question.tipo === "VF" && (
          <div className="space-y-2">
            <div
              className={`flex items-center gap-2 p-2 rounded text-xs ${
                question.respuestaCorrecta === "Verdadero"
                  ? "bg-success/10 border border-success/20"
                  : "bg-muted/30"
              }`}
            >
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span>Verdadero</span>
            </div>
            <div
              className={`flex items-center gap-2 p-2 rounded text-xs ${
                question.respuestaCorrecta === "Falso"
                  ? "bg-success/10 border border-success/20"
                  : "bg-muted/30"
              }`}
            >
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span>Falso</span>
            </div>
          </div>
        )}

        {question.tipo === "SA" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Respuesta corta (a editar en la siguiente vista)
            </p>
            <div className="flex items-center gap-2 p-2 rounded text-xs bg-blue-50 border border-blue-200">
              <AlertCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />
              <span className="text-blue-800">
                Deberás agregar las respuestas aceptadas después de crear el cuestionario
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Explicación */}
      {question.explicacion && (
        <div className="pl-4 p-3 rounded-lg bg-blue-50 border border-blue-200 overflow-hidden">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-blue-900">Explicación:</p>
              <p className="text-xs text-blue-800 mt-1 line-clamp-3">
                {question.explicacion}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Errores */}
      {!question.isValid && question.errors.length > 0 && (
        <div className="pl-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <p className="text-xs font-medium text-destructive mb-2">Problemas encontrados:</p>
          <ul className="space-y-1">
            {question.errors.map((error, idx) => (
              <li key={idx} className="text-xs text-destructive">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
