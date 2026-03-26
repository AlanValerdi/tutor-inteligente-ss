import { getTopicQuizzes } from "@/lib/actions/teacher"
import { QuizManager } from "@/components/teacher/quiz-manager"
import { notFound } from "next/navigation"

export default async function TopicQuizzesPage({ params }: { params: Promise<{ topicId: string }> }) {
  try {
    const { topicId } = await params
    const data = await getTopicQuizzes(topicId)
    
    return (
      <QuizManager 
        topic={data.topic}
        quizzes={data.quizzes}
      />
    )
  } catch (error) {
    notFound()
  }
}
