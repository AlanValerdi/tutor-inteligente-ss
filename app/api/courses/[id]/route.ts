import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
      )
    }

    const { id: courseId } = await params

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "No estás inscrito en este curso" },
        { status: 403 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        topics: {
          orderBy: { order: "asc" }
        },
        _count: {
          select: {
            topics: true,
            enrollments: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...course,
      enrollment: {
        id: enrollment.id,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        completedTopics: 0,
        totalTopics: course.topics.length,
        lastAccessedAt: enrollment.enrolledAt
      }
    })

  } catch (error) {
    console.error("Course fetch error:", error)
    return NextResponse.json(
      { error: "Error al obtener el curso" },
      { status: 500 }
    )
  }
}
