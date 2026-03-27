"use client"

import { QuizBlock } from "@/types/content"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileQuestion } from "lucide-react"

interface QuizBlockEditorProps {
  block: QuizBlock
  onChange: (block: QuizBlock) => void
}

export function QuizBlockEditor({ block, onChange }: QuizBlockEditorProps) {
  // En una versión más avanzada, esto sería un Select que obtiene
  // las preguntas del topic actual usando SWR o pasando los datos como props.
  // Por ahora, usaremos un Input para el ID de la pregunta.
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <FileQuestion className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor={`question-${block.id}`}>ID de la Pregunta</Label>
          <Input
            id={`question-${block.id}`}
            placeholder="Pega el ID de la pregunta a insertar..."
            value={block.questionId || ""}
            onChange={(e) => onChange({ ...block, questionId: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            El estudiante podrá responder a esta pregunta directamente mientras lee. No afecta su calificación.
          </p>
        </div>
      </div>
    </div>
  )
}
