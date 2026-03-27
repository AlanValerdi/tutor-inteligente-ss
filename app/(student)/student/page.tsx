import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { StudentDashboard } from "@/components/dashboard/student-dashboard"

export default async function StudentDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard") // Redirect to general dashboard for other roles
  }

  // Fetch dashboard stats
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          topics: {
            select: {
              id: true,
              title: true,
              order: true
            },
            orderBy: { order: "asc" }
          },
          _count: {
            select: { 
              topics: true,
              enrollments: true 
            }
          }
        }
      }
    },
    orderBy: { enrolledAt: "desc" }
  })

  // Calculate stats
  const stats = {
    enrolledCourses: enrollments.length,
    totalTopics: enrollments.reduce((acc, e) => acc + e.course._count.topics, 0),
    averageProgress: enrollments.length > 0 
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length) 
      : 0,
    completedCourses: enrollments.filter(e => e.progress === 100).length
  }

  // Transform enrollments for dashboard
  const enrolledCourses = enrollments.map(enrollment => ({
    id: enrollment.id,
    course: {
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      teacher: {
        name: enrollment.course.teacher.name,
        image: enrollment.course.teacher.image
      },
      topics: enrollment.course.topics,
      topicsCount: enrollment.course._count.topics,
      studentsEnrolled: enrollment.course._count.enrollments
    },
    progress: enrollment.progress,
    enrolledAt: enrollment.enrolledAt
  }))

  return (
    <div className="flex-1 overflow-auto">
      <StudentDashboard
        stats={stats}
        enrolledCourses={enrolledCourses}
        studentName={session.user.name || "Estudiante"}
      />
    </div>
  )
}