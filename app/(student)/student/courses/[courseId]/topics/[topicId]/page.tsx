import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { TopicDetailAdapter } from "@/components/dashboard/topic-detail-adapter"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TopicPageProps {
  params: Promise<{
    courseId: string
    topicId: string
  }>
}

export default async function StudentTopicPage({ params }: TopicPageProps) {
  const { courseId, topicId } = await params
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
    redirect("/student/courses") // User not enrolled
  }

  // Get the student's current profile from database (fresh data)
  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { studyProfile: true }
  })

  const currentProfile = student?.studyProfile || "Visual"

  // Get course with topics
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      topics: {
        orderBy: { order: "asc" }
      }
    }
  })

  if (!course) {
    redirect("/student/courses") // Course not found
  }

  const topicFromArray = course.topics.find(t => t.id === topicId)
  if (!topicFromArray) {
    redirect(`/student/courses/${courseId}`) // Topic not found
  }
  
  // CRITICAL FIX: We need to fetch the topic directly from the database
  // to get the full JSON content. When using `include: { topics: true }`,
  // Prisma may return a stripped-down version of JSON fields.
  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  })
  
  if (!topic) {
    redirect(`/student/courses/${courseId}`)
  }

  // Get published quizzes for this topic with questions
  const quizzes = await prisma.quiz.findMany({
    where: {
      topicId: topicId,
      isPublished: true
    },
    include: {
      questions: {
        orderBy: { order: "asc" }
      },
      _count: {
        select: { questions: true }
      }
    },
    orderBy: { createdAt: "asc" }
  })

  // Get student's quiz attempts
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: session.user.id,
      quiz: {
        topicId: topicId
      }
    },
    orderBy: { startedAt: "desc" }
  })

  const topicIndex = course.topics.findIndex(t => t.id === topicId)

  // Serialize JSON safely for Server-to-Client component boundary
  const serializedContent = JSON.parse(JSON.stringify(topic.content))

  // Transform topic data for adapter
  const topicData = {
    id: topic.id,
    title: topic.title,
    content: serializedContent,
    order: topic.order
  }

  // Transform quiz data
  const quizzesData = quizzes.map(quiz => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    passingScore: quiz.passingScore,
    maxAttempts: quiz.maxAttempts,
    timeLimit: quiz.timeLimit,
    questionsCount: quiz._count.questions,
    // Get student's best attempt for this quiz
    bestAttempt: attempts
      .filter(a => a.quizId === quiz.id && a.completedAt)
      .sort((a, b) => b.score - a.score)[0] || null,
    // Count total attempts
    attemptCount: attempts.filter(a => a.quizId === quiz.id).length
  }))

  return (
    <div className="flex flex-col h-full">
      {/* Header with navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="gap-2">
              <Link href={`/student/courses/${courseId}`}>
                <ArrowLeft className="h-4 w-4" />
                Volver al Curso
              </Link>
            </Button>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{course.title}</span> • 
              Tema {topicIndex + 1} de {course.topics.length}
            </div>
          </div>
        </div>
      </div>

       {/* Topic content */}
       <div className="flex-1 overflow-auto">
         <TopicDetailAdapter
           topic={topicData}
           topicIndex={topicIndex}
           totalTopics={course.topics.length}
           profile={currentProfile}
           courseId={courseId}
           quizzes={quizzesData}
           backUrl={`/student/courses/${courseId}`}
           nextTopicUrl={course.topics[topicIndex + 1] 
             ? `/student/courses/${courseId}/topics/${course.topics[topicIndex + 1].id}` 
             : null}
         />
       </div>
    </div>
  )
}
