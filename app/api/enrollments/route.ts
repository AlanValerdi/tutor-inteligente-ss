import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const enrollmentSchema = z.object({
  enrollKey: z.string().min(1, "La clave de inscripción es requerida")
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
    const { enrollKey } = enrollmentSchema.parse(body)

    // Find course by enrollment key
    const course = await prisma.course.findUnique({
      where: { enrollKey: enrollKey.trim() },
      include: {
        _count: {
          select: { topics: true }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Clave de inscripción inválida. Verifica que esté correcta e intenta nuevamente." },
        { status: 404 }
      )
    }

    if (!course.isPublished) {
      return NextResponse.json(
        { error: "Este curso aún no está disponible para inscripción" },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Ya estás inscrito en este curso" },
        { status: 400 }
      )
    }

    // Get user's study profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { studyProfile: true }
    })

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        studyProfile: user?.studyProfile
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
