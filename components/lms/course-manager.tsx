"use client"

import {
  Calculator,
  Code,
  Atom,
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  Lock,
  Circle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { courses } from "@/lib/lms-data"

const iconMap: Record<string, React.ElementType> = {
  Calculator,
  Code,
  Atom,
}

export function CourseManager() {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">Course Manager</h1>
          <p className="text-muted-foreground">
            Manage your courses, topics, and content for each learning profile.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="font-display text-xl font-bold text-card-foreground">{courses.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <p className="font-display text-xl font-bold text-card-foreground">
                  {courses.reduce((acc, c) => acc + c.studentsEnrolled, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Topics</p>
                <p className="font-display text-xl font-bold text-card-foreground">
                  {courses.reduce((acc, c) => acc + c.topics.length, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {courses.map((course) => {
            const IconComponent = iconMap[course.icon] || BookOpen
            const isExpanded = expandedCourse === course.id
            const completedTopics = course.topics.filter((t) => t.status === "completed").length
            const courseProgress = Math.round((completedTopics / course.topics.length) * 100)

            return (
              <Card key={course.id} className="border-0 shadow-sm">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="font-display text-base">{course.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {course.topics.length} topics &middot; {course.studentsEnrolled} students
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden items-center gap-2 sm:flex">
                        <Progress value={courseProgress} className="h-2 w-24" />
                        <span className="text-sm text-muted-foreground">{courseProgress}%</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t border-border pt-4">
                    <p className="mb-4 text-sm text-muted-foreground">{course.description}</p>
                    <div className="flex flex-col gap-3">
                      {course.topics.map((topic, index) => (
                        <div
                          key={topic.id}
                          className="flex items-center gap-4 rounded-lg bg-muted/50 px-4 py-3"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                            {topic.status === "completed" ? (
                              <CheckCircle2 className="h-5 w-5 text-success" />
                            ) : topic.status === "current" ? (
                              <Circle className="h-5 w-5 text-primary fill-primary" />
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-card-foreground">
                              {index + 1}. {topic.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {topic.description}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-xs text-muted-foreground">{topic.duration}</span>
                            <div className="flex gap-1">
                              {topic.videoUrl && (
                                <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                                  Video
                                </span>
                              )}
                              {topic.audioUrl && (
                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                  Audio
                                </span>
                              )}
                              {topic.textContent && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  Text
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
