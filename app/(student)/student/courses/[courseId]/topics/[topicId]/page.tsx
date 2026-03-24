import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { TopicDetailAdapter } from "@/components/dashboard/topic-detail-adapter"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TopicPageProps {
  params: {
    courseId: string
    topicId: string
  }
}

export default async function StudentTopicPage({ params }: TopicPageProps) {
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
        courseId: params.courseId
      }
    }
  })
  
  if (!enrollment) {
    redirect("/student/courses") // User not enrolled
  }

  // Get course with topics
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      topics: {
        orderBy: { order: "asc" }
      }
    }
  })

  if (!course) {
    redirect("/student/courses") // Course not found
  }

  const topic = course.topics.find(t => t.id === params.topicId)
  if (!topic) {
    redirect(`/student/courses/${params.courseId}`) // Topic not found
  }

  const topicIndex = course.topics.findIndex(t => t.id === params.topicId)

  // Transform topic data for adapter
  const topicData = {
    id: topic.id,
    title: topic.title,
    content: topic.content,
    order: topic.order
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="gap-2">
              <Link href={`/student/courses/${params.courseId}`}>
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
      <div className="flex-1 overflow-hidden">
        <TopicDetailAdapter
          topic={topicData}
          topicIndex={topicIndex}
          totalTopics={course.topics.length}
          profile="Visual" // This could come from user profile
          onBack={() => {
            // Navigate back to course
            window.location.href = `/student/courses/${params.courseId}`
          }}
          onComplete={() => {
            // Navigate to next topic or back to course
            const nextTopic = course.topics[topicIndex + 1]
            
            if (nextTopic) {
              window.location.href = `/student/courses/${params.courseId}/topics/${nextTopic.id}`
            } else {
              window.location.href = `/student/courses/${params.courseId}`
            }
          }}
        />
      </div>
    </div>
  )
}