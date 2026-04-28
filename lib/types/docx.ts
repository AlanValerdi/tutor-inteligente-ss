export interface ExtractedQuestion {
  id?: string // Generado en preview (uuid temporal)
  rowIndex: number
  pregunta: string
  tipo: "MC" | "VF" | "SA"
  opciones: {
    a?: string
    b?: string
    c?: string
    d?: string
  }
  respuestaCorrecta: string // Para MC: "A", "B", "C", "D"; Para VF: "Verdadero"/"Falso"; Para SA: ""
  explicacion?: string
  puntos?: number
  
  // Estado en preview
  isValid: boolean
  errors: string[]
  isEditing?: boolean
}

export interface ParseDocxResponse {
  success: boolean
  questions: ExtractedQuestion[]
  errors?: string[]
  totalQuestions: number
}

export interface CreateQuizFromDocxInput {
  topicId?: string
  courseId?: string
  title: string
  description?: string
  questions: ExtractedQuestion[]
}

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"

export interface OptionMap {
  [key: string]: string
}

export interface MultipleChoiceOptions {
  text: string
  isCorrect: boolean
}[]

export interface TrueFalseOptions {
  correctAnswer: boolean
}

export interface ShortAnswerOptions {
  acceptedAnswers: string[]
}
