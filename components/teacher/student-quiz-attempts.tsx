"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, ChevronDown } from "lucide-react"

interface QuizAttempt {
  id: string
  score: number
  passed: boolean
  tabSwitches: number
  consecutiveClicks: number
  missedClicks: number
  idleTimeSeconds: number
  scrollReversals: number
  timeSpent: number | null
  quiz: {
    title: string
    topic: { id: string; courseId: string } | null
    course?: { id: string } | null
  }
  user: { id: string; name: string | null; email: string }
  startedAt: Date
}

interface Course {
  id: string
  title: string
}

interface StudentQuizAttemptsProps {
  quizAttempts: QuizAttempt[]
  courses: Course[]
}

export function StudentQuizAttempts({ quizAttempts, courses }: StudentQuizAttemptsProps) {
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null)
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null)

  // Calculate anxiety level
  const getAnxietyLevel = (attempt: QuizAttempt) => {
    const { tabSwitches, consecutiveClicks, missedClicks, scrollReversals } = attempt
    const score = 
      (tabSwitches > 5 ? 2 : tabSwitches > 2 ? 1 : 0) +
      (consecutiveClicks > 3 ? 2 : consecutiveClicks > 1 ? 1 : 0) +
      (missedClicks > 5 ? 2 : missedClicks > 2 ? 1 : 0) +
      (scrollReversals > 10 ? 2 : scrollReversals > 5 ? 1 : 0)

    if (score >= 6) return { level: "Alto", color: "text-red-600", bgColor: "bg-red-100" }
    if (score >= 3) return { level: "Medio", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    return { level: "Bajo", color: "text-green-600", bgColor: "bg-green-100" }
  }

  // Format time
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Group attempts by student
  const attemptsByStudent = quizAttempts.reduce((acc, attempt) => {
    const key = attempt.user.id
    if (!acc[key]) {
      acc[key] = { user: attempt.user, attempts: [] }
    }
    acc[key].attempts.push(attempt)
    return acc
  }, {} as Record<string, { user: any; attempts: QuizAttempt[] }>)

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {Object.entries(attemptsByStudent).map(([studentId, { user, attempts }]) => (
          <Card key={studentId}>
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedAttempt(expandedAttempt === studentId ? null : studentId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <div className="text-right pr-4">
                  <div className="text-sm font-medium mb-1">
                    {attempts.filter(a => a.passed).length}/{attempts.length} Aprobados
                  </div>
                  <Badge variant="outline">
                    {attempts.length} intentos
                  </Badge>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 transition-transform ${expandedAttempt === studentId ? 'rotate-180' : ''}`}
                />
              </div>
            </CardHeader>

            {expandedAttempt === studentId && (
              <CardContent className="space-y-3 pt-0">
                {attempts.map((attempt) => {
                  const anxiety = getAnxietyLevel(attempt)
                  return (
                    <div 
                      key={attempt.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">{attempt.quiz.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(attempt.startedAt).toLocaleDateString()} - {formatTime(attempt.timeSpent)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={attempt.passed ? "default" : "destructive"}>
                            {attempt.score}%
                          </Badge>
                          <Badge className={anxiety.bgColor + " " + anxiety.color}>
                            {anxiety.level}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedAttempt(attempt)}
                          >
                            Ver Métricas
                          </Button>
                        </div>
                      </div>

                      {/* Quick metrics preview */}
                      <div className="grid grid-cols-5 gap-2 text-xs bg-muted/30 p-2 rounded">
                        <div className="text-center">
                          <div className="font-medium">{attempt.tabSwitches}</div>
                          <div className="text-muted-foreground">Cambios Tab</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{attempt.consecutiveClicks}</div>
                          <div className="text-muted-foreground">Clicks Cons.</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{attempt.missedClicks}</div>
                          <div className="text-muted-foreground">Clicks Perdidos</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{attempt.idleTimeSeconds}s</div>
                          <div className="text-muted-foreground">Inactivo</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{attempt.scrollReversals}</div>
                          <div className="text-muted-foreground">Scroll Rev.</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Detailed Metrics Modal */}
      {selectedAttempt && (
        <Dialog open={!!selectedAttempt} onOpenChange={() => setSelectedAttempt(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Métricas Detalladas</DialogTitle>
              <DialogDescription>
                {selectedAttempt.quiz.title} - {selectedAttempt.user.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedAttempt.score}%</div>
                  <div className="text-sm text-muted-foreground">Puntuación</div>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold">{formatTime(selectedAttempt.timeSpent)}</div>
                  <div className="text-sm text-muted-foreground">Tiempo</div>
                </div>
              </div>

              {/* Anxiety Metrics */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Indicadores de Ansiedad
                </h4>
                <div className="space-y-2">
                  <MetricRow 
                    label="Cambios de Pestaña" 
                    value={selectedAttempt.tabSwitches}
                    threshold={5}
                  />
                  <MetricRow 
                    label="Clicks Consecutivos" 
                    value={selectedAttempt.consecutiveClicks}
                    threshold={3}
                  />
                  <MetricRow 
                    label="Clicks Perdidos" 
                    value={selectedAttempt.missedClicks}
                    threshold={5}
                  />
                  <MetricRow 
                    label="Tiempo Inactivo" 
                    value={selectedAttempt.idleTimeSeconds}
                    unit="s"
                    threshold={30}
                  />
                  <MetricRow 
                    label="Reversiones de Scroll" 
                    value={selectedAttempt.scrollReversals}
                    threshold={10}
                  />
                </div>
              </div>

              {/* Anxiety Level */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Nivel de Ansiedad</h4>
                <Badge className={getAnxietyLevel(selectedAttempt).bgColor + " " + getAnxietyLevel(selectedAttempt).color + " text-base py-2"}>
                  {getAnxietyLevel(selectedAttempt).level}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function MetricRow({ label, value, unit = "", threshold }: { label: string; value: number; unit?: string; threshold: number }) {
  const isHigh = value > threshold
  return (
    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
      <span className="text-sm">{label}</span>
      <span className={`font-medium ${isHigh ? 'text-red-600' : 'text-green-600'}`}>
        {value}{unit}
      </span>
    </div>
  )
}
