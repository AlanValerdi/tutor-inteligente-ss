"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Play,
  Headphones,
  FileText,
  Eye,
  Ear,
  Hand,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { Topic, StudyProfile } from "@/lib/lms-data"

interface TopicDetailProps {
  topic: Topic
  topicIndex: number
  totalTopics: number
  profile: StudyProfile
  onBack: () => void
  onComplete: () => void
}

export function TopicDetail({ topic, topicIndex, totalTopics, profile, onBack, onComplete }: TopicDetailProps) {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizPassed, setQuizPassed] = useState(false)

  const handleQuizSubmit = () => {
    let correct = 0
    topic.quiz.forEach((q) => {
      if (parseInt(quizAnswers[q.id]) === q.correctAnswer) {
        correct++
      }
    })
    const score = Math.round((correct / topic.quiz.length) * 100)
    setQuizSubmitted(true)
    setQuizPassed(score >= 70)
  }

  const handleRetry = () => {
    setQuizAnswers({})
    setQuizSubmitted(false)
    setQuizPassed(false)
  }

  const allAnswered = topic.quiz.every((q) => quizAnswers[q.id] !== undefined)

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-3xl px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Button>

        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Topic {topicIndex + 1} of {totalTopics}</span>
          <span className="text-border">|</span>
          <span>{topic.duration}</span>
        </div>

        <h1 className="mb-2 font-display text-2xl font-bold text-foreground">{topic.title}</h1>
        <p className="mb-8 text-muted-foreground leading-relaxed">{topic.description}</p>

        {/* Adaptive Content Area */}
        <Card className="mb-8 border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 pb-3">
            <div className="flex items-center gap-2">
              {profile === "Visual" && <Eye className="h-4 w-4 text-primary" />}
              {profile === "Auditory" && <Ear className="h-4 w-4 text-primary" />}
              {profile === "Kinesthetic" && <Hand className="h-4 w-4 text-primary" />}
              <CardTitle className="text-sm font-medium text-primary">
                Content adapted for {profile} learners
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {profile === "Visual" && (
              <div>
                <div className="mb-6 flex aspect-video items-center justify-center rounded-xl bg-foreground/5">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">Video Lesson</p>
                      <p className="text-sm text-muted-foreground">{topic.title}</p>
                    </div>
                  </div>
                </div>
                {topic.textContent && (
                  <div className="prose prose-sm max-w-none">
                    <h3 className="font-display text-base font-semibold text-card-foreground mb-3">Lesson Notes</h3>
                    {topic.textContent.split("\n\n").map((paragraph, i) => (
                      <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {profile === "Auditory" && (
              <div>
                <div className="mb-6 rounded-xl bg-foreground/5 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Headphones className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">Audio Lesson</p>
                      <p className="text-sm text-muted-foreground">{topic.title}</p>
                      <div className="mt-3 h-2 rounded-full bg-border">
                        <div className="h-2 w-1/3 rounded-full bg-primary" />
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                        <span>0:00</span>
                        <span>{topic.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {topic.textContent && (
                  <div className="prose prose-sm max-w-none">
                    <h3 className="font-display text-base font-semibold text-card-foreground mb-3">Transcript</h3>
                    {topic.textContent.split("\n\n").map((paragraph, i) => (
                      <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {profile === "Kinesthetic" && (
              <div>
                <div className="mb-6 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <p className="font-medium text-card-foreground">Interactive Lesson</p>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                    This content is designed for hands-on learning. Work through the material below,
                    then practice with the exercises before taking the quiz.
                  </p>
                </div>
                {topic.textContent && (
                  <div className="prose prose-sm max-w-none">
                    <h3 className="font-display text-base font-semibold text-card-foreground mb-3">Study Material</h3>
                    {topic.textContent.split("\n\n").map((paragraph, i) => (
                      <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mandatory Quiz Section */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              Topic Quiz
              {quizPassed && <CheckCircle2 className="h-5 w-5 text-success" />}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Pass this quiz (70% or higher) to unlock the next topic.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8">
              {topic.quiz.map((question, qIndex) => {
                const isCorrect =
                  quizSubmitted && parseInt(quizAnswers[question.id]) === question.correctAnswer
                const isWrong =
                  quizSubmitted &&
                  quizAnswers[question.id] !== undefined &&
                  parseInt(quizAnswers[question.id]) !== question.correctAnswer

                return (
                  <div key={question.id}>
                    <p className="mb-3 text-sm font-semibold text-card-foreground">
                      <span className="text-muted-foreground">Q{qIndex + 1}. </span>
                      {question.question}
                    </p>
                    <RadioGroup
                      value={quizAnswers[question.id] ?? ""}
                      onValueChange={(val) =>
                        !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [question.id]: val }))
                      }
                      disabled={quizSubmitted}
                    >
                      <div className="flex flex-col gap-2">
                        {question.options.map((option, oIndex) => {
                          const isThisCorrect = quizSubmitted && oIndex === question.correctAnswer
                          const isThisSelected = quizAnswers[question.id] === String(oIndex)

                          return (
                            <Label
                              key={oIndex}
                              htmlFor={`${question.id}-${oIndex}`}
                              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                                quizSubmitted && isThisCorrect
                                  ? "border-success bg-success/5 text-card-foreground"
                                  : quizSubmitted && isThisSelected && !isThisCorrect
                                  ? "border-destructive bg-destructive/5 text-card-foreground"
                                  : isThisSelected
                                  ? "border-primary bg-primary/5 text-card-foreground"
                                  : "border-border text-card-foreground hover:bg-muted/50"
                              }`}
                            >
                              <RadioGroupItem value={String(oIndex)} id={`${question.id}-${oIndex}`} />
                              {option}
                            </Label>
                          )
                        })}
                      </div>
                    </RadioGroup>
                    {quizSubmitted && isCorrect && (
                      <p className="mt-2 text-sm text-success font-medium">Correct!</p>
                    )}
                    {quizSubmitted && isWrong && (
                      <p className="mt-2 text-sm text-destructive font-medium">
                        Incorrect. The correct answer is: {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-8 flex items-center gap-3">
              {!quizSubmitted ? (
                <Button onClick={handleQuizSubmit} disabled={!allAnswered} className="gap-2">
                  Submit Quiz
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              ) : quizPassed ? (
                <Button onClick={onComplete} className="gap-2">
                  {topicIndex < totalTopics - 1 ? "Next Topic" : "Complete Course"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleRetry} variant="outline" className="gap-2">
                  Retry Quiz
                </Button>
              )}

              {quizSubmitted && (
                <span
                  className={`text-sm font-medium ${quizPassed ? "text-success" : "text-destructive"}`}
                >
                  {quizPassed
                    ? "You passed! Great work."
                    : "You need 70% to pass. Try again!"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
