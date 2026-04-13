import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Solo estudiantes pueden marcar temas como leídos" },
        { status: 403 }
      )
    }

    const { topicId, courseId } = await request.json()

    if (!topicId || !courseId) {
      return NextResponse.json(
        { error: "topicId y courseId son requeridos" },
        { status: 400 }
      )
    }

    // Verify student is enrolled in this course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "No estás inscrito en este curso" },
        { status: 403 }
      )
    }

    // Verify topic exists in this course
    const topic = await prisma.topic.findUnique({
      where: { id: topicId }
    })

    if (!topic || topic.courseId !== courseId) {
      return NextResponse.json(
        { error: "Tema no encontrado" },
        { status: 404 }
      )
    }

    // Create or update topic completion
    const completion = await prisma.topicCompletion.upsert({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId: topicId
        }
      },
      update: {
        isRead: true,
        completedAt: new Date()
      },
      create: {
        userId: session.user.id,
        topicId: topicId,
        isRead: true,
        completedAt: new Date()
      }
    })

    // Calculate course progress
    const totalTopics = await prisma.topic.count({
      where: { courseId: courseId }
    })

    const completedTopics = await prisma.topicCompletion.count({
      where: {
        userId: session.user.id,
        topic: { courseId: courseId },
        isRead: true
      }
    })

    const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

    // Update enrollment progress
    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      },
      data: {
        progress: progress,
        completedTopics: completedTopics
      }
    })

    return NextResponse.json({
      success: true,
      completion,
      progress,
      completedTopics,
      totalTopics
    })
  } catch (error) {
    console.error("Error marking topic as read:", error)
    return NextResponse.json(
      { error: "Error al marcar tema como leído" },
      { status: 500 }
    )
  }
}
