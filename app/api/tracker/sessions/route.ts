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
    copyAttempts,
    rightClickCount,
    windowBlurs,
    timePerQuestion,
    attemptsPerQuestion,
    backNavigations,
    timeToFirstAnswer,
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
      copyAttempts,
      rightClickCount,
      windowBlurs,
      timePerQuestion: timePerQuestion ?? undefined,
      attemptsPerQuestion: attemptsPerQuestion ?? undefined,
      backNavigations,
      timeToFirstAnswer: timeToFirstAnswer ?? undefined,
    },
  })

  // Crear recursos asociados (solo contenido de aprendizaje, no quizzes)
  if (resources.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.resourceInteraction.createMany({
      data: resources.map((r: ResourceInteractionInput) =>
        buildResourceData(newSession.id, r)
      ) as any,
    })
  }

  // Actualizar nivel de ansiedad del enrollment a partir de las sesiones registradas
  await updateEnrollmentAnxiety(userId, courseId).catch(e =>
    console.error('[Tracker] updateEnrollmentAnxiety failed', e)
  )

  return NextResponse.json(
    {
      sessionId: newSession.id,
      userId,
      sessionNumber,
    },
    { status: 201 }
  )
}

// ── Anxiety update ────────────────────────────────────────────────────────────
// Lee las últimas 10 InteractionSessions del estudiante en el curso y recalcula
// el nivel de ansiedad y los arrays de métricas en el Enrollment.
async function updateEnrollmentAnxiety(userId: string, courseId: string) {
  const sessions = await prisma.interactionSession.findMany({
    where: { userId, courseId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      tabSwitches: true,
      consecutiveClicks: true,
      missedClicks: true,
      idleTime: true,
      scrollReversals: true,
    },
  })

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })

  if (!enrollment || sessions.length === 0) return

  const avg = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / arr.length

  const tabSwitchesArr    = sessions.map(s => s.tabSwitches)
  const consecutiveArr    = sessions.map(s => s.consecutiveClicks)
  const missedClicksArr   = sessions.map(s => s.missedClicks)
  const idleTimeArr       = sessions.map(s => Math.round(s.idleTime))
  const scrollReversalsArr = sessions.map(s => s.scrollReversals)

  let score = 0
  if (avg(tabSwitchesArr) > 5)    score += 2
  else if (avg(tabSwitchesArr) > 2) score += 1

  if (avg(consecutiveArr) > 3)    score += 2
  else if (avg(consecutiveArr) > 1) score += 1

  if (avg(missedClicksArr) > 5)   score += 2
  else if (avg(missedClicksArr) > 2) score += 1

  if (avg(scrollReversalsArr) > 10) score += 2
  else if (avg(scrollReversalsArr) > 5) score += 1

  const anxietyLevel = score >= 6 ? 'Alto' : score >= 3 ? 'Medio' : 'Bajo'

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      anxietyLevel,
      tabSwitches:      tabSwitchesArr,
      consecutiveClicks: consecutiveArr,
      missedClicks:     missedClicksArr,
      idleTime:         idleTimeArr,
      scrollReversals:  scrollReversalsArr,
    },
  })
}

// ── Resource builder ──────────────────────────────────────────────────────────
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
