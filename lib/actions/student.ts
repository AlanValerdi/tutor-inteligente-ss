"use server"

import { prisma } from "@/lib/db"
import { QuestionType } from "@prisma/client"
import { checkAnswer as sharedCheckAnswer } from "@/lib/quiz-helpers"

interface SubmitQuizAnswer {
  questionId: string
  selectedAnswer: string
}

interface SubmitQuizAttemptParams {
  quizId: string
  userId: string
  answers: SubmitQuizAnswer[]
  timeSpent: number
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
    const { quizId, userId, answers, timeSpent } = params

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

    const correctAnswers   = gradedAnswers.filter(a => a.isCorrect).length
    const incorrectAnswers = gradedAnswers.filter(a => !a.isCorrect).length

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
        correctAnswers,
        incorrectAnswers,
        completedAt: new Date(),
      }
    })

    // Actualizar progreso del curso
    if (courseId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } }
      })
      if (enrollment) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { lastAccessedAt: new Date() }
        })
        await updateEnrollmentProgress(userId, courseId)
      }
    }

    return {
      success: true,
      attemptId: attempt.id,
      score,
      passed,
      correctAnswers,
      incorrectAnswers,
    }
  } catch (error) {
    console.error("Error submitting quiz attempt:", error)
    return { success: false, error: "Error al enviar el cuestionario" }
  }
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