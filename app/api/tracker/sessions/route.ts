import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { InteractionSessionSchema } from '@/lib/schemas/tracker/session.schema'
import type { CreateSessionResponse, ApiError } from '@/types/tracker.types'
import type { ResourceInteractionInput } from '@/lib/schemas/tracker/resource.schema'

export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateSessionResponse | ApiError>> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  let parsed: ReturnType<typeof InteractionSessionSchema.parse>

  try {
    parsed = InteractionSessionSchema.parse(body)
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.flatten() },
        { status: 422 }
      )
    }
    throw err
  }

  const {
    topicId,
    courseId,
    totalTime,
    idleTime,
    tabSwitches,
    missedClicks,
    scrollReversals,
    consecutiveClicks,
    resources,
  } = parsed

  // Calcular sessionNumber
  const previousSessions = await prisma.interactionSession.count({
    where: { userId, topicId },
  })
  const sessionNumber = previousSessions + 1

  // Crear sesión
  const newSession = await prisma.interactionSession.create({
    data: {
      userId,
      topicId,
      courseId,
      sessionNumber,
      totalTime,
      idleTime,
      tabSwitches,
      missedClicks,
      scrollReversals,
      consecutiveClicks,
    },
  })

  // Crear recursos asociados
  if (resources.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.resourceInteraction.createMany({
      data: resources.map((r: ResourceInteractionInput) =>
        buildResourceData(newSession.id, r)
      ) as any,
    })
  }

  return NextResponse.json(
    {
      sessionId: newSession.id,
      userId,
      sessionNumber,
    },
    { status: 201 }
  )
}

function buildResourceData(sessionId: string, r: ResourceInteractionInput) {
  return {
    sessionId,
    resourceType: r.resourceType,
    resourceId: r.resourceId,
    timeOnResource: r.timeOnResource,
    completed: r.completed,

    // Video / Audio
    percentageWatched: r.percentageWatched,
    timeWatched: r.timeWatched,
    timesPaused: r.timesPaused,
    timesReplayed: r.timesReplayed,

    // Diapositiva
    totalSlides: r.totalSlides,
    slidesViewed: r.slidesViewed,
    percentageViewed: r.percentageViewed,
    timesReviewed: r.timesReviewed,
    zoomUsed: r.zoomUsed,

    // Quiz
    timePerQuestion: r.timePerQuestion ?? undefined,
    correctAnswers: r.correctAnswers,
    incorrectAnswers: r.incorrectAnswers,
    attemptsPerQuestion: r.attemptsPerQuestion ?? undefined,

    // Juego interactivo
    gameCompleted: r.gameCompleted,
    timesPlayed: r.timesPlayed,
    helpUsed: r.helpUsed,
    correctResponses: r.correctResponses,
    incorrectResponses: r.incorrectResponses,
    completionPercent: r.completionPercent,

    // Imagen interactiva
    zonesMarked: r.zonesMarked,
    visualAidsUsed: r.visualAidsUsed,
    attemptsImage: r.attemptsImage,
    correctIdentifications: r.correctIdentifications,

    // Simulación
    dataSelected: r.dataSelected ?? undefined,
    simulationChanges: r.simulationChanges,
    attempts: r.attempts,
    toolsUsed: r.toolsUsed ?? undefined,
    solutionPrecision: r.solutionPrecision,

    // Diapositiva adicional
    modifiedCaseResolved: r.modifiedCaseResolved,
    visualSupportUsed: r.visualSupportUsed,
    reflectionTime: r.reflectionTime,
    errorsIdentified: r.errorsIdentified,
    reflectionLevel: r.reflectionLevel,
  }
}
