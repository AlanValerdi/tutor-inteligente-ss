import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { StudentDashboard } from "@/components/student/student-dashboard"

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


  const enrolledCoursesData = enrollments.map(e => {
    const totalTopics = e.course._count.topics;
    const realProgress = totalTopics > 0 
      ? Math.min(100, Math.round((e.completedTopics / totalTopics) * 100)) 
      : 0;
    return { ...e, realProgress };
  });

  const stats = {
    enrolledCourses: enrollments.length,
    totalTopics: enrollments.reduce((acc, e) => acc + e.course._count.topics, 0),
    averageProgress: enrolledCoursesData.length > 0 
      ? Math.round(enrolledCoursesData.reduce((acc, e) => acc + e.realProgress, 0) / enrolledCoursesData.length) 
      : 0,
    completedCourses: enrolledCoursesData.filter(e => e.realProgress === 100).length
  }

  // Transform enrollments for dashboard
  const enrolledCourses = enrolledCoursesData.map(enrollment => ({
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
    progress: enrollment.realProgress, // <--- Aquí usamos el progreso real calculado
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