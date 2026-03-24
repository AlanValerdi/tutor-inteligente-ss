import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const enrollmentSchema = z.object({
  courseId: z.string(),
  enrollKey: z.string()
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para inscribirte" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { courseId, enrollKey } = enrollmentSchema.parse(body)

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }

    if (course.enrollKey !== enrollKey) {
      return NextResponse.json(
        { error: "Clave de inscripción incorrecta" },
        { status: 400 }
      )
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Ya estás inscrito en este curso" },
        { status: 400 }
      )
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId
      },
      include: {
        course: {
          include: {
            _count: {
              select: { topics: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      id: enrollment.id,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      progress: enrollment.progress,
      course: enrollment.course
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      )
    }

    console.error("Enrollment error:", error)
    return NextResponse.json(
      { error: "Error al inscribirse en el curso" },
      { status: 500 }
    )
  }
}
