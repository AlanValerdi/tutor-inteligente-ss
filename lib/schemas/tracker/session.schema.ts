import { z } from 'zod'
import { ResourceInteractionSchema } from './resource.schema'

const TimePerQuestionEntry = z.object({
  questionId: z.string(),
  seconds: z.number().min(0),
})

const AttemptsPerQuestionEntry = z.object({
  questionId: z.string(),
  attempts: z.number().int().min(1),
})

export const InteractionSessionSchema = z.object({
  topicId: z.string().min(1),
  courseId: z.string().min(1),

  // Métricas globales de ansiedad conductual
  totalTime: z.number().min(0),
  idleTime: z.number().min(0),
  tabSwitches: z.number().int().min(0),
  missedClicks: z.number().int().min(0),
  scrollReversals: z.number().int().min(0),
  consecutiveClicks: z.number().int().min(0),
  copyAttempts: z.number().int().min(0),
  rightClickCount: z.number().int().min(0),
  windowBlurs: z.number().int().min(0),

  // Métricas de engagement del quiz (opcionales — null en sesiones de topic)
  timePerQuestion: z.array(TimePerQuestionEntry).optional(),
  attemptsPerQuestion: z.array(AttemptsPerQuestionEntry).optional(),
  backNavigations: z.number().int().min(0).optional(),
  timeToFirstAnswer: z.array(TimePerQuestionEntry).optional(),

  resources: z.array(ResourceInteractionSchema),
})

export type InteractionSessionInput = z.infer<typeof InteractionSessionSchema>
