import { getCourseTopics } from "@/lib/actions/teacher"
import { TopicCreatorData } from "@/components/teacher/topic-creator-data"
import { notFound } from "next/navigation"

export default async function CourseTopicsPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await getCourseTopics(id)
    
    return (
      <TopicCreatorData 
        course={data.course}
        topics={data.topics}
      />
    )
  } catch (error) {
    notFound()
  }
}
