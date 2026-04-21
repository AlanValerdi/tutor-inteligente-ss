import { getCourseTopics } from "@/lib/actions/teacher"
import { TopicCreatorData } from "@/components/teacher/topic-creator-data"
import { notFound } from "next/navigation"

export default async function CourseTopicsPage({ params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params
    const data = await getCourseTopics(courseId)
    
    return (
      <TopicCreatorData 
        course={data.course}
        topics={data.topics.map(t => ({ ...t, content: t.content as any }))}
      />
    )
  } catch (error) {
    notFound()
  }
}
