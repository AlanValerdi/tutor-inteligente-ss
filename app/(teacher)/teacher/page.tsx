import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTeacherDashboardData } from "@/lib/actions/teacher"
import { TeacherStats } from "@/components/teacher/teacher-stats"
import { TeacherCoursesList } from "@/components/teacher/teacher-courses-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function TeacherDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "TEACHER") {
    redirect("/dashboard")
  }

  const dashboardData = await getTeacherDashboardData()

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-1 font-display text-2xl font-bold text-foreground">Panel del Profesor</h1>
            <p className="text-muted-foreground">Bienvenido, {session.user.name}</p>
          </div>
          <Link href="/teacher/courses/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Curso
            </Button>
          </Link>
        </div>

        <TeacherStats stats={dashboardData.stats} />

        <div className="mt-8">
          <TeacherCoursesList courses={dashboardData.allCourses} />
        </div>
      </div>
    </div>
  )
}
