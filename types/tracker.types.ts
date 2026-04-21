export type { InteractionSessionInput } from '@/lib/schemas/tracker/session.schema'
export type { ResourceInteractionInput } from '@/lib/schemas/tracker/resource.schema'

export interface CreateSessionResponse {
  sessionId: string
  userId: string
  sessionNumber: number
}

export interface ApiError {
  error: string
  details?: unknown
}
