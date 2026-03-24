import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesión" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId es requerido" },
        { status: 400 }
      )
    }

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

    const topics = await prisma.topic.findMany({
      where: { courseId },
      orderBy: { order: "asc" }
    })

    return NextResponse.json(topics)

  } catch (error) {
    console.error("Topics fetch error:", error)
    return NextResponse.json(
      { error: "Error al obtener temas" },
      { status: 500 }
    )
  }
}
