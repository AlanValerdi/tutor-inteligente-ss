import { z } from 'zod'
import { ResourceInteractionSchema } from './resource.schema'

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

  resources: z.array(ResourceInteractionSchema),
})

export type InteractionSessionInput = z.infer<typeof InteractionSessionSchema>
