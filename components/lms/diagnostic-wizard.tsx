"use client"

import { useState } from "react"
import { ArrowRight, ArrowLeft, Brain, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { diagnosticQuestions, type StudyProfile } from "@/lib/lms-data"

interface DiagnosticWizardProps {
  onComplete: (profile: StudyProfile) => void
}

export function DiagnosticWizard({ onComplete }: DiagnosticWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, StudyProfile>>({})
  const [showResult, setShowResult] = useState(false)

  const totalSteps = diagnosticQuestions.length
  const progress = ((currentStep + 1) / totalSteps) * 100
  const currentQuestion = diagnosticQuestions[currentStep]
  const hasAnswered = currentQuestion && answers[currentQuestion.id]

  const handleAnswer = (questionId: string, profile: StudyProfile) => {
    setAnswers((prev) => ({ ...prev, [questionId]: profile }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setShowResult(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const getResult = (): StudyProfile => {
    const counts: Record<StudyProfile, number> = { Visual: 0, Auditory: 0, Kinesthetic: 0 }
    Object.values(answers).forEach((profile) => {
      counts[profile]++
    })
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as StudyProfile
  }

  if (showResult) {
    const result = getResult()
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-lg border-0 shadow-lg">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h2 className="mb-2 font-display text-2xl font-bold text-card-foreground">
              Assessment Complete!
            </h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              Based on your responses, we&apos;ve identified your learning style.
            </p>
            <div className="mb-8 rounded-xl bg-primary/5 px-8 py-6">
              <p className="mb-1 text-sm font-medium text-muted-foreground">Your Study Profile</p>
              <p className="font-display text-3xl font-bold text-primary">{result}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {result === "Visual" && "You learn best through images, diagrams, and visual demonstrations."}
                {result === "Auditory" && "You learn best through listening, discussions, and verbal explanations."}
                {result === "Kinesthetic" && "You learn best through hands-on practice and physical engagement."}
              </p>
            </div>
            <Button size="lg" className="gap-2" onClick={() => onComplete(result)}>
              Start Learning
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mb-1 font-display text-2xl font-bold text-foreground">
            Learning Style Assessment
          </h1>
          <p className="text-muted-foreground">
            Answer a few questions so we can personalize your experience.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-sm font-medium text-muted-foreground">
            {currentStep + 1}/{totalSteps}
          </span>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <h2 className="mb-6 text-lg font-semibold text-card-foreground leading-relaxed">
              {currentQuestion?.question}
            </h2>

            <div className="flex flex-col gap-3">
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQuestion.id, option.profile)}
                  className={`flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                    answers[currentQuestion.id] === option.profile
                      ? "border-primary bg-primary/5 text-card-foreground"
                      : "border-border bg-card text-card-foreground hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      answers[currentQuestion.id] === option.profile
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-sm font-medium leading-relaxed">{option.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!hasAnswered} className="gap-2">
                {currentStep === totalSteps - 1 ? "See Results" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
