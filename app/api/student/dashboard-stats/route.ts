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

    // Get dashboard stats
    const enrolledCoursesCount = await prisma.enrollment.count({
      where: { userId: session.user.id }
    })

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            topics: true
          }
        }
      }
    })

    const totalTopics = enrollments.reduce((acc, enrollment) => {
      return acc + enrollment.course.topics.length
    }, 0)

    // Calculate average progress (mock for now - would need topic completion tracking)
    const averageProgress = enrollments.length > 0 ? 75 : 0 // Mock data

    // Count completed courses (mock for now)
    const completedCourses = 0 // Mock data

    const stats = {
      enrolledCourses: enrolledCoursesCount,
      totalTopics,
      averageProgress,
      completedCourses,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}