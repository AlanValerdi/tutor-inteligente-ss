import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { QuizResults } from "@/components/student/quiz-results"

interface QuizResultsPageProps {
  params: Promise<{
    courseId: string
    topicId: string
    quizId: string
    attemptId: string
  }>
}

export default async function QuizResultsPage({ params }: QuizResultsPageProps) {
  const { courseId, topicId, quizId, attemptId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  // Get quiz attempt with quiz and questions
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" }
          }
        }
      }
    }
  })

  if (!attempt || attempt.userId !== session.user.id || attempt.quizId !== quizId) {
    redirect(`/student/courses/${courseId}/topics/${topicId}`)
  }

  // Check if student can retry
  const allAttempts = await prisma.quizAttempt.findMany({
    where: {
      userId: session.user.id,
      quizId: quizId
    }
  })

  const canRetry = attempt.quiz.maxAttempts === null || 
                   allAttempts.length < attempt.quiz.maxAttempts

  return (
    <QuizResults
      attempt={{
        id: attempt.id,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        maxPoints: attempt.maxPoints,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        completedAt: attempt.completedAt,
        answers: attempt.answers as Array<{
          questionId: string
          selectedAnswer: string | null
          isCorrect: boolean
          pointsEarned: number
        }>,
        anxietyMetrics: {
          tabSwitches: attempt.tabSwitches,
          consecutiveClicks: attempt.consecutiveClicks,
          missedClicks: attempt.missedClicks,
          idleTimeSeconds: attempt.idleTimeSeconds,
          scrollReversals: attempt.scrollReversals
        }
      }}
      quiz={{
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        passingScore: attempt.quiz.passingScore,
        questions: attempt.quiz.questions.map(q => ({
          id: q.id,
          type: q.type,
          questionText: q.questionText,
          imageUrl: q.imageUrl,
          points: q.points,
          options: q.options,
          explanation: q.explanation
        }))
      }}
      canRetry={canRetry}
      courseId={courseId}
      topicId={topicId}
    />
  )
}
