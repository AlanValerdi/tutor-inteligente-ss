import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { QuizTaker } from "@/components/student/quiz-taker"

interface QuizTakePageProps {
  params: Promise<{
    courseId: string
    topicId: string
    quizId: string
  }>
}

export default async function StudentQuizTakePage({ params }: QuizTakePageProps) {
  const { courseId, topicId, quizId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId
      }
    }
  })
  
  if (!enrollment) {
    redirect("/student/courses")
  }

  // Get quiz with questions
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      topic: {
        include: {
          course: true
        }
      },
      questions: {
        orderBy: { order: "asc" }
      }
    }
  })

  if (!quiz || !quiz.isPublished || quiz.topicId !== topicId) {
    redirect(`/student/courses/${courseId}/topics/${topicId}`)
  }

  // Check attempts
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: session.user.id,
      quizId: quizId
    }
  })

  const attemptCount = attempts.length
  const canAttempt = quiz.maxAttempts === null || attemptCount < quiz.maxAttempts

  if (!canAttempt) {
    redirect(`/student/courses/${courseId}/topics/${topicId}`)
  }

  // Transform questions (hide correct answers)
  const questionsData = quiz.questions.map((q) => ({
    id: q.id,
    type: q.type,
    questionText: q.questionText,
    imageUrl: q.imageUrl,
    order: q.order,
    points: q.points,
    options: q.options, // Client will handle showing options
    explanation: null // Don't show until submitted
  }))

  return (
    <QuizTaker
      quiz={{
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        shuffleQuestions: quiz.shuffleQuestions
      }}
      questions={questionsData}
      courseId={courseId}
      topicId={topicId}
      userId={session.user.id}
    />
  )
}
