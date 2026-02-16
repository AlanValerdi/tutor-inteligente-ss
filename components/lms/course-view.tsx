"use client"

import { ArrowLeft, CheckCircle2, Lock, Circle, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Course } from "@/lib/lms-data"

interface CourseViewProps {
  course: Course
  onBack: () => void
  onSelectTopic: (topicId: string) => void
}

export function CourseView({ course, onBack, onSelectTopic }: CourseViewProps) {
  const completed = course.topics.filter((t) => t.status === "completed").length
  const courseProgress = Math.round((completed / course.topics.length) * 100)

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="mb-2 font-display text-2xl font-bold text-foreground">{course.title}</h1>
          <p className="mb-4 text-muted-foreground leading-relaxed">{course.description}</p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              {course.topics.length} topics
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {course.topics.reduce((acc, t) => acc + parseInt(t.duration), 0)} min total
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Progress value={courseProgress} className="h-2 flex-1 max-w-xs" />
            <span className="text-sm font-medium text-primary">{courseProgress}% complete</span>
          </div>
        </div>

        <h2 className="mb-6 font-display text-lg font-semibold text-foreground">Course Timeline</h2>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 h-full w-0.5 bg-border" aria-hidden="true" />

          <div className="flex flex-col gap-1">
            {course.topics.map((topic, index) => {
              const isCompleted = topic.status === "completed"
              const isCurrent = topic.status === "current"
              const isLocked = topic.status === "locked"

              return (
                <div key={topic.id} className="relative flex gap-4">
                  {/* Timeline node */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center">
                    {isCompleted ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success">
                        <CheckCircle2 className="h-5 w-5 text-success-foreground" />
                      </div>
                    ) : isCurrent ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-card">
                        <Circle className="h-5 w-5 text-primary fill-primary" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Topic card */}
                  <Card
                    className={`mb-4 flex-1 transition-all ${
                      isLocked
                        ? "border-border opacity-60"
                        : isCurrent
                        ? "border-primary/30 shadow-md cursor-pointer hover:shadow-lg"
                        : "border-success/20 cursor-pointer hover:shadow-md"
                    }`}
                    onClick={() => !isLocked && onSelectTopic(topic.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              Topic {index + 1}
                            </span>
                            {isCompleted && (
                              <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                                Completed
                              </span>
                            )}
                            {isCurrent && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                In Progress
                              </span>
                            )}
                            {isLocked && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                Locked
                              </span>
                            )}
                          </div>
                          <h3 className="mb-1 font-display text-base font-semibold text-card-foreground">
                            {topic.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {topic.description}
                          </p>
                        </div>
                        <span className="ml-4 shrink-0 text-sm text-muted-foreground">
                          {topic.duration}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
