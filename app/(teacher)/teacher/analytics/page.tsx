import { getStudentAnalytics } from "@/lib/actions/teacher"
import { StudentAnalyticsData } from "@/components/teacher/student-analytics-data"

export default async function AnalyticsPage() {
  const data = await getStudentAnalytics()
  
  return <StudentAnalyticsData students={data.students} courses={data.courses} />
}
