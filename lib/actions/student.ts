"use server"

import { prisma } from "@/lib/db"
import { QuestionType } from "@prisma/client"
import { checkAnswer as sharedCheckAnswer } from "@/lib/quiz-helpers"

interface SubmitQuizAnswer {
  questionId: string
  selectedAnswer: string
}

interface AnxietyMetrics {
  tabSwitches: number
  consecutiveClicks: number
  missedClicks: number
  idleTimeSeconds: number
  scrollReversals: number
}

interface SubmitQuizAttemptParams {
  quizId: string
  userId: string
  answers: SubmitQuizAnswer[]
  timeSpent: number
  anxietyMetrics: AnxietyMetrics
}

/**
 * Función auxiliar para recalcular y guardar el progreso real del curso
 */
// Asegúrate de que esto esté arriba o abajo de tus otras funciones en student.ts
async function updateEnrollmentProgress(userId: string, courseId: string) {
  const totalTopics = await prisma.topic.count({
    where: { courseId }
  });

  const completedTopicsCount = await prisma.topicCompletion.count({
    where: {
      userId,
      topic: { courseId },
      isRead: true
    }
  });

  const progressPercentage = totalTopics > 0 
    ? Math.round((completedTopicsCount / totalTopics) * 100) 
    : 0;

  await prisma.enrollment.update({
    where: {
      userId_courseId: { userId, courseId }
    },
    data: { 
      progress: progressPercentage,
      completedTopics: completedTopicsCount
    }
  });
}

export async function submitQuizAttempt(params: SubmitQuizAttemptParams) {
  try {
    const { quizId, userId, answers, timeSpent, anxietyMetrics } = params

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        topic: true // Incluimos el topic para saber a qué curso pertenece
      }
    })

    if (!quiz) {
      return { success: false, error: "Cuestionario no encontrado" }
    }

    // Identificar el courseId (puede venir del topic o directamente del quiz)
    const courseId = quiz.courseId || quiz.topic?.courseId

    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0
    const gradedAnswers = []

    for (const question of quiz.questions) {
      totalPoints += question.points
      const userAnswer = answers.find(a => a.questionId === question.id)
      
      let isCorrect = false
      let pointsEarned = 0

      if (userAnswer && userAnswer.selectedAnswer) {
        isCorrect = sharedCheckAnswer(question.type, question.options, userAnswer.selectedAnswer)
        if (isCorrect) {
          pointsEarned = question.points
          earnedPoints += pointsEarned
        }
      }

      gradedAnswers.push({
        questionId: question.id,
        selectedAnswer: userAnswer?.selectedAnswer || null,
        isCorrect,
        pointsEarned
      })
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = score >= quiz.passingScore

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        score,
        totalPoints: earnedPoints,
        maxPoints: totalPoints,
        answers: gradedAnswers,
        passed,
        timeSpent,
        completedAt: new Date(),
        tabSwitches: anxietyMetrics.tabSwitches,
        consecutiveClicks: anxietyMetrics.consecutiveClicks,
        missedClicks: anxietyMetrics.missedClicks,
        idleTimeSeconds: anxietyMetrics.idleTimeSeconds,
        scrollReversals: anxietyMetrics.scrollReversals
      }
    })

    // Update enrollment anxiety metrics and PROGRESS
    if (courseId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId }
        }
      })

      if (enrollment) {
        const updateAnxietyArray = (current: any, newValue: number) => {
          const arr = Array.isArray(current) ? current : []
          const updated = [...arr, newValue]
          return updated.slice(-10)
        }

        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            tabSwitches: updateAnxietyArray(enrollment.tabSwitches, anxietyMetrics.tabSwitches),
            consecutiveClicks: updateAnxietyArray(enrollment.consecutiveClicks, anxietyMetrics.consecutiveClicks),
            missedClicks: updateAnxietyArray(enrollment.missedClicks, anxietyMetrics.missedClicks),
            idleTime: updateAnxietyArray(enrollment.idleTime, anxietyMetrics.idleTimeSeconds),
            scrollReversals: updateAnxietyArray(enrollment.scrollReversals, anxietyMetrics.scrollReversals),
            timePerQuestion: updateAnxietyArray(
              enrollment.timePerQuestion,
              quiz.questions.length > 0 ? Math.round(timeSpent / quiz.questions.length) : 0
            ),
            lastAccessedAt: new Date()
          }
        })

        // 1. Recalcular nivel de ansiedad
        await updateAnxietyLevel(enrollment.id)
        
        // 2. RECALCULAR PROGRESO DEL CURSO (NUEVO)
        await updateEnrollmentProgress(userId, courseId)
      }
    }

    return {
      success: true,
      attemptId: attempt.id,
      score,
      passed
    }
  } catch (error) {
    console.error("Error submitting quiz attempt:", error)
    return { success: false, error: "Error al enviar el cuestionario" }
  }
}

// ... (El resto de funciones auxiliares updateAnxietyLevel, etc., se mantienen igual)


// Helper function to update anxiety level based on metrics
async function updateAnxietyLevel(enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId }
  })

  if (!enrollment) return

  // Calculate average metrics from last 10 sessions
  const getAverage = (data: any): number => {
    if (!Array.isArray(data) || data.length === 0) return 0
    return data.reduce((sum: number, val: number) => sum + val, 0) / data.length
  }

  const avgTabSwitches = getAverage(enrollment.tabSwitches)
  const avgConsecutiveClicks = getAverage(enrollment.consecutiveClicks)
  const avgMissedClicks = getAverage(enrollment.missedClicks)
  const avgScrollReversals = getAverage(enrollment.scrollReversals)

  // Simple scoring system (you can adjust thresholds)
  let anxietyScore = 0

  if (avgTabSwitches > 5) anxietyScore += 2
  else if (avgTabSwitches > 2) anxietyScore += 1

  if (avgConsecutiveClicks > 3) anxietyScore += 2
  else if (avgConsecutiveClicks > 1) anxietyScore += 1

  if (avgMissedClicks > 5) anxietyScore += 2
  else if (avgMissedClicks > 2) anxietyScore += 1

  if (avgScrollReversals > 10) anxietyScore += 2
  else if (avgScrollReversals > 5) anxietyScore += 1

  // Determine anxiety level
  let anxietyLevel: "Bajo" | "Medio" | "Alto"
  if (anxietyScore >= 6) {
    anxietyLevel = "Alto"
  } else if (anxietyScore >= 3) {
    anxietyLevel = "Medio"
  } else {
    anxietyLevel = "Bajo"
  }

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { anxietyLevel }
  })
}

export async function getQuestionForPractice(questionId: string) {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  if (!session?.user) throw new Error("No autorizado")

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      type: true,
      questionText: true,
      options: true,
      explanation: true
    }
  })

  return question
}

export async function saveStudyProfile(profile: "Visual" | "Auditivo" | "Kinestesico") {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  if (!session?.user) throw new Error("No autorizado")

  await prisma.user.update({
    where: { id: session.user.id },
    data: { studyProfile: profile }
  })

  return { success: true }
}