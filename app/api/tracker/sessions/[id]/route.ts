import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { ApiError } from '@/types/tracker.types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params

  const session = await prisma.interactionSession.findUnique({
    where: { id },
    include: {
      resources: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          studyProfile: true,
          createdAt: true,
        },
      },
    },
  })

  if (!session) {
    return NextResponse.json<ApiError>(
      { error: 'Session not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(session)
}
