"use client"

import { useEffect, useState } from "react"
import { getQuestionForPractice } from "@/lib/actions/student"
import { checkAnswer } from "@/lib/quiz-helpers"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle2, XCircle } from "lucide-react"

interface InlineQuizBlockProps {
  questionId: string
}

export function InlineQuizBlock({ questionId }: InlineQuizBlockProps) {
  const [question, setQuestion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [answer, setAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  useEffect(() => {
    async function load() {
      if (!questionId) {
        setLoading(false)
        return
      }
      try {
        const data = await getQuestionForPractice(questionId)
        setQuestion(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [questionId])

  const handleVerify = () => {
    if (!question || !answer) return
    const correct = checkAnswer(question.type, question.options, answer)
    setIsCorrect(correct)
  }

  if (loading) {
    return <div className="p-6 rounded-xl border bg-muted/20 animate-pulse h-32"></div>
  }

  if (!question) {
    return (
      <div className="p-6 rounded-xl border border-dashed border-destructive/50 bg-destructive/5 text-destructive text-sm text-center">
        No se pudo cargar la pregunta (ID inválido o eliminada).
      </div>
    )
  }

  return (
    <div className="my-8 p-6 rounded-xl border-2 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
        <span className="text-lg">🎯</span>
        <span>Pregunta de Práctica</span>
      </div>
      
      <p className="text-card-foreground font-medium mb-4">
        {question.questionText}
      </p>

      <div className="mb-4">
        {question.type === "MULTIPLE_CHOICE" && (
          <RadioGroup value={answer} onValueChange={(val) => { setAnswer(val); setIsCorrect(null) }}>
            {(question.options as any[]).map((opt, i) => (
              <div key={i} className="flex items-center space-x-2 p-2 rounded-md hover:bg-background/50">
                <RadioGroupItem value={opt.text} id={`opt-${i}`} />
                <Label htmlFor={`opt-${i}`} className="cursor-pointer">{opt.text}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "TRUE_FALSE" && (
          <RadioGroup value={answer} onValueChange={(val) => { setAnswer(val); setIsCorrect(null) }}>
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-background/50">
              <RadioGroupItem value="true" id="opt-t" />
              <Label htmlFor="opt-t" className="cursor-pointer">Verdadero</Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-background/50">
              <RadioGroupItem value="false" id="opt-f" />
              <Label htmlFor="opt-f" className="cursor-pointer">Falso</Label>
            </div>
          </RadioGroup>
        )}

        {question.type === "SHORT_ANSWER" && (
          <Input 
            placeholder="Escribe tu respuesta..."
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setIsCorrect(null) }}
          />
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleVerify} disabled={!answer}>
          Verificar Respuesta
        </Button>

        {isCorrect === true && (
          <div className="flex items-center gap-2 text-success font-medium">
            <CheckCircle2 className="h-5 w-5" />
            ¡Correcto!
          </div>
        )}
        
        {isCorrect === false && (
          <div className="flex items-center gap-2 text-destructive font-medium">
            <XCircle className="h-5 w-5" />
            Incorrecto, intenta de nuevo.
          </div>
        )}
      </div>

      {isCorrect !== null && question.explanation && (
        <div className="mt-4 p-4 text-sm bg-background rounded-md border text-muted-foreground">
          <span className="font-semibold text-foreground">Explicación: </span>
          {question.explanation}
        </div>
      )}
    </div>
  )
}
