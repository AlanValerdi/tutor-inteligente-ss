import { getQuizQuestions } from "@/lib/actions/teacher"
import { QuestionManager } from "@/components/teacher/question-manager"
import { notFound } from "next/navigation"

export default async function QuizQuestionsPage({ params }: { params: Promise<{ quizId: string }> }) {
  try {
    const { quizId } = await params
    const data = await getQuizQuestions(quizId)
    
    return (
      <QuestionManager 
        quiz={data.quiz}
        questions={data.questions}
      />
    )
  } catch (error) {
    notFound()
  }
}
