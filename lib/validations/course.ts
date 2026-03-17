import { z } from "zod"

export const createCourseSchema = z.object({
  title: z.string().min(3, "El titulo debe tener al menos 3 caracteres").max(100),
  description: z.string().max(500).optional(),
  enrollKey: z.string().min(4, "La clave de inscripción debe tener al menos 4 caracteres").max(20),
  isPublished: z.boolean().default(false),
})

export const updateCourseSchema = z.object({
  title: z.string().min(3, "El titulo debe tener al menos 3 caracteres").max(100).optional(),
  description: z.string().max(500, "La descripción debe tener como máximo 500 caracteres").optional(),
  enrollKey: z.string().min(4, "La clave de inscripción debe tener al menos 4 caracteres").max(20).optional(),
  isPublished: z.boolean().optional(),
})

export const enrollSchema = z.object({
  courseId: z.string(),
  enrollKey: z.string(),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type EnrollInput = z.infer<typeof enrollSchema>
