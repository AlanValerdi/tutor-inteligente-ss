import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            teacher: {
              select: { id: true, name: true, image: true }
            },
            topics: {
              select: { id: true, title: true, order: true }
            },
            _count: {
              select: { enrollments: true }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })

    // Transform the data to match the expected interface
    const coursesWithProgress = enrollments.map(enrollment => ({
      id: enrollment.id,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        teacher: enrollment.course.teacher,
        topics: enrollment.course.topics,
        topicsCount: enrollment.course.topics.length,
        studentsEnrolled: enrollment.course._count.enrollments,
      },
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt,
    }))

    return NextResponse.json(coursesWithProgress)
  } catch (error) {
    console.error("Error fetching enrolled courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch enrolled courses" },
      { status: 500 }
    )
  }
}