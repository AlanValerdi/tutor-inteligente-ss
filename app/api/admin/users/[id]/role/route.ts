import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const RoleSchema = z.object({
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = RoleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 422 })
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Prevent admin from changing their own role
  if (target.id === session.user.id) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json(updated)
}
