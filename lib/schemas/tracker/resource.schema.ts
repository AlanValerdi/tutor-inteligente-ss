import { z } from 'zod'

export const ResourceTypeEnum = z.enum([
  'Video',
  'Audio',
  'Diapositiva',
  'JuegoInteractivo',
  'ImagenInteractiva',
  'Simulacion',
  'DiapositivaAdicional',
])

export const ResourceInteractionSchema = z.object({
  resourceType: ResourceTypeEnum,
  resourceId: z.string().min(1),
  timeOnResource: z.number().min(0),
  completed: z.boolean(),

  // ── Video / Audio ──────────────────────────────────────────────
  percentageWatched: z.number().min(0).max(100).optional(),
  timeWatched: z.number().min(0).optional(),
  timesPaused: z.number().int().min(0).optional(),
  timesReplayed: z.number().int().min(0).optional(),

  // ── Diapositiva ────────────────────────────────────────────────
  totalSlides: z.number().int().min(0).optional(),
  slidesViewed: z.number().int().min(0).optional(),
  percentageViewed: z.number().min(0).max(100).optional(),
  timesReviewed: z.number().int().min(0).optional(),
  zoomUsed: z.boolean().optional(),

  // ── Juego interactivo ──────────────────────────────────────────
  gameCompleted: z.boolean().optional(),
  timesPlayed: z.number().int().min(0).optional(),
  helpUsed: z.boolean().optional(),
  correctResponses: z.number().int().min(0).optional(),
  incorrectResponses: z.number().int().min(0).optional(),
  completionPercent: z.number().min(0).max(100).optional(),

  // ── Imagen interactiva ─────────────────────────────────────────
  zonesMarked: z.number().int().min(0).optional(),
  visualAidsUsed: z.boolean().optional(),
  attemptsImage: z.number().int().min(0).optional(),
  correctIdentifications: z.number().int().min(0).optional(),

  // ── Simulación ─────────────────────────────────────────────────
  dataSelected: z.record(z.string(), z.unknown()).optional(),
  simulationChanges: z.number().int().min(0).optional(),
  attempts: z.number().int().min(0).optional(),
  toolsUsed: z.array(z.string()).optional(),
  solutionPrecision: z.number().min(0).max(100).optional(),

  // ── Diapositiva adicional ──────────────────────────────────────
  modifiedCaseResolved: z.boolean().optional(),
  visualSupportUsed: z.boolean().optional(),
  reflectionTime: z.number().min(0).optional(),
  errorsIdentified: z.number().int().min(0).optional(),
  reflectionLevel: z.number().int().min(1).max(3).optional(),
})

export type ResourceInteractionInput = z.infer<typeof ResourceInteractionSchema>
