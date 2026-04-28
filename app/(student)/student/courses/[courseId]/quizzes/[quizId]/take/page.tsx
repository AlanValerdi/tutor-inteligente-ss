import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { QuizTaker } from "@/components/student/quiz-taker"

interface CourseQuizTakePageProps {
  params: Promise<{
    courseId: string
    quizId: string
  }>
}

export default async function StudentCourseQuizTakePage({ params }: CourseQuizTakePageProps) {
  const { courseId, quizId } = await params
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
      course: true,
      questions: {
        orderBy: { order: "asc" }
      }
    }
  })

  // Ensure it is published and belongs to this course
  if (!quiz || !quiz.isPublished || quiz.courseId !== courseId) {
    redirect(`/student/courses/${courseId}`)
  }

  // Check attempts
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: session.user.id,
      quizId: quizId
    }
  })

  const attemptCount = attempts.length
  // For diagnostic quizzes, limit is 1. We handled this during creation, but just to be sure:
  const effectiveMaxAttempts = quiz.isDiagnostic ? 1 : quiz.maxAttempts;
  const canAttempt = effectiveMaxAttempts === null || attemptCount < effectiveMaxAttempts

  if (!canAttempt) {
    redirect(`/student/courses/${courseId}`)
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
        shuffleQuestions: quiz.shuffleQuestions,
        isDiagnostic: quiz.isDiagnostic // Add this so QuizTaker can hide grades
      }}
      questions={questionsData}
      courseId={courseId}
      userId={session.user.id}
    />
  )
}
