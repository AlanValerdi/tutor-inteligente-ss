"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function getTeacherDashboardData() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const teacherId = session.user.id

  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: {
            topics: true,
            enrollments: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.enrollment.findMany({
      where: {
        course: {
          teacherId
        }
      },
      select: {
        progress: true
      }
    })
  ])

  const totalStudents = enrollments.length
  const averageProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
    : 0

  const publishedCourses = courses.filter(c => c.isPublished).length
  const totalTopics = courses.reduce((acc, c) => acc + c._count.topics, 0)

  return {
    stats: {
      totalCourses: courses.length,
      publishedCourses,
      totalStudents,
      averageProgress,
      totalTopics
    },
    recentCourses: courses.slice(0, 5).map(course => ({
      id: course.id,
      title: course.title,
      isPublished: course.isPublished,
      topicsCount: course._count.topics,
      studentsCount: course._count.enrollments,
      createdAt: course.createdAt
    })),
    allCourses: courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      isPublished: course.isPublished,
      enrollKey: course.enrollKey,
      topicsCount: course._count.topics,
      studentsCount: course._count.enrollments,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }))
  }
}

function generateEnrollKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let key = ""
  for (let i = 0; i < 14; i++) {
    if (i === 4 || i === 9) {
      key += "-"
    } else {
      key += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }
  return key
}

export async function createCourse(data: {
  title: string
  description?: string
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  // Generar clave única — reintentar si hay colisión
  let enrollKey = generateEnrollKey()
  let attempts = 0
  while (attempts < 5) {
    const existing = await prisma.course.findUnique({ where: { enrollKey } })
    if (!existing) break
    enrollKey = generateEnrollKey()
    attempts++
  }

  const course = await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      enrollKey,
      teacherId: session.user.id
    }
  })

  return course
}

export async function updateCourse(
  courseId: string,
  data: {
    title?: string
    description?: string
    isPublished?: boolean
  }
) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId }
  })

  if (!course || course.teacherId !== session.user.id) {
    throw new Error("Curso no encontrado o no autorizado")
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data
  })

  return updatedCourse
}

export async function deleteCourse(courseId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId }
  })

  if (!course || course.teacherId !== session.user.id) {
    throw new Error("Curso no encontrado o no autorizado")
  }

  await prisma.course.delete({
    where: { id: courseId }
  })

  return { success: true }
}

export async function getStudentAnalytics() {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const teacherId = session.user.id

  // Get all enrollments for this teacher's courses
  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: {
        teacherId
      }
    },
    select: {
      id: true,
      userId: true,
      courseId: true,
      progress: true,
      completedTopics: true,
      enrolledAt: true,
      studyProfile: true,
      anxietyLevel: true,
      averageScore: true,
      visualScore: true,
      auditivoScore: true,
      kinestesicoScore: true,
      tabSwitches: true,
      consecutiveClicks: true,
      missedClicks: true,
      timePerQuestion: true,
      idleTime: true,
      scrollReversals: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      course: {
        select: {
          id: true,
          title: true
        }
      }
    }
  })

  // Transform data for the analytics component
  const students = enrollments.map(enrollment => ({
    id: enrollment.user.id,
    name: enrollment.user.name || enrollment.user.email,
    avatar: enrollment.user.name 
      ? enrollment.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : enrollment.user.email.slice(0, 2).toUpperCase(),
    profile: enrollment.studyProfile || 'Visual',
    anxietyLevel: enrollment.anxietyLevel,
    averageScore: enrollment.averageScore,
    progress: enrollment.progress,
    enrolledCourses: [enrollment.course.id],
    profileScores: {
      Visual: enrollment.visualScore,
      Auditivo: enrollment.auditivoScore,
      Kinestesico: enrollment.kinestesicoScore
    },
    anxietyMetrics: {
      tabSwitches: enrollment.tabSwitches ? (enrollment.tabSwitches as number[]) : Array(10).fill(0),
      consecutiveClicks: enrollment.consecutiveClicks ? (enrollment.consecutiveClicks as number[]) : Array(10).fill(0),
      missedClicks: enrollment.missedClicks ? (enrollment.missedClicks as number[]) : Array(10).fill(0),
      timePerQuestion: enrollment.timePerQuestion ? (enrollment.timePerQuestion as number[]) : Array(10).fill(0),
      idleTime: enrollment.idleTime ? (enrollment.idleTime as number[]) : Array(10).fill(0),
      scrollReversals: enrollment.scrollReversals ? (enrollment.scrollReversals as number[]) : Array(10).fill(0)
    }
  }))

  // Group students by unique user ID to avoid duplicates
  const uniqueStudents = Array.from(
    new Map(students.map(s => [s.id, s])).values()
  )

  // Aggregate enrolled courses for each student
  const studentMap = new Map<string, typeof students[0]>()
  
  enrollments.forEach(enrollment => {
    const existing = studentMap.get(enrollment.user.id)
    if (existing) {
      if (!existing.enrolledCourses.includes(enrollment.course.id)) {
        existing.enrolledCourses.push(enrollment.course.id)
      }
    } else {
      const student = students.find(s => s.id === enrollment.user.id)
      if (student) {
        studentMap.set(enrollment.user.id, { ...student })
      }
    }
  })

  const finalStudents = Array.from(studentMap.values())

  return {
    students: finalStudents,
    courses: await prisma.course.findMany({
      where: { teacherId },
      select: {
        id: true,
        title: true
      }
    })
  }
}

export async function updateStudentProfile(
  userId: string,
  courseId: string,
  profile: 'Visual' | 'Auditivo' | 'Kinestesico'
) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const teacherId = session.user.id

  // Verify the course belongs to this teacher
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  })

  if (!course || course.teacherId !== teacherId) {
    throw new Error("Curso no encontrado o no autorizado")
  }

  // Update the enrollment
  const enrollment = await prisma.enrollment.update({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    },
    data: {
      studyProfile: profile
    }
  })

  return enrollment
}

export async function getCourseTopics(courseId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      topics: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!course || course.teacherId !== session.user.id) {
    throw new Error("Curso no encontrado o no autorizado")
  }

  return {
    course: {
      id: course.id,
      title: course.title,
      description: course.description
    },
    topics: course.topics
  }
}

export async function createTopic(data: {
  courseId: string
  title: string
  content: any
  order: number
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const course = await prisma.course.findUnique({
    where: { id: data.courseId }
  })

  if (!course || course.teacherId !== session.user.id) {
    throw new Error("Curso no encontrado o no autorizado")
  }

  const topic = await prisma.topic.create({
    data: {
      title: data.title,
      content: data.content,
      order: data.order,
      courseId: data.courseId
    }
  })

  return topic
}

export async function updateTopic(
  topicId: string,
  data: {
    title?: string
    content?: any
    order?: number
  }
) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { course: true }
  })

  if (!topic || topic.course.teacherId !== session.user.id) {
    throw new Error("Tema no encontrado o no autorizado")
  }

  const updatedTopic = await prisma.topic.update({
    where: { id: topicId },
    data
  })

  return updatedTopic
}

export async function deleteTopic(topicId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { course: true }
  })

  if (!topic || topic.course.teacherId !== session.user.id) {
    throw new Error("Tema no encontrado o no autorizado")
  }

  await prisma.topic.delete({
    where: { id: topicId }
  })

  return { success: true }
}

// ============================================
// QUIZ CRUD OPERATIONS
// ============================================

export async function getTopicQuizzes(topicId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { 
      course: true,
      quizzes: {
        include: {
          _count: {
            select: { questions: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!topic || topic.course.teacherId !== session.user.id) {
    throw new Error("Tema no encontrado o no autorizado")
  }

  return {
    topic: {
      id: topic.id,
      title: topic.title,
      courseId: topic.courseId
    },
    quizzes: topic.quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      isPublished: quiz.isPublished,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      timeLimit: quiz.timeLimit,
      questionsCount: quiz._count.questions,
      createdAt: quiz.createdAt
    }))
  }
}

export async function createQuiz(data: {
  topicId?: string
  courseId?: string
  title: string
  description?: string
  passingScore?: number
  maxAttempts?: number
  timeLimit?: number
  shuffleQuestions?: boolean
  requireAllTopics?: boolean
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  // Validate: must have either topicId or courseId, but not both
  if (!data.topicId && !data.courseId) {
    throw new Error("Un cuestionario debe estar ligado a un tema o a un curso")
  }

  if (data.topicId && data.courseId) {
    throw new Error("Un cuestionario no puede estar ligado a ambos, tema y curso")
  }

  // If it's a topic-level quiz
  if (data.topicId) {
    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
      include: { course: true }
    })

    if (!topic || topic.course.teacherId !== session.user.id) {
      throw new Error("Tema no encontrado o no autorizado")
    }
  }

  // If it's a course-level quiz
  if (data.courseId) {
    const course = await prisma.course.findUnique({
      where: { id: data.courseId }
    })

    if (!course || course.teacherId !== session.user.id) {
      throw new Error("Curso no encontrado o no autorizado")
    }
  }

  const quiz = await prisma.quiz.create({
    data: {
      topicId: data.topicId,
      courseId: data.courseId,
      title: data.title,
      description: data.description,
      passingScore: data.passingScore ?? 70,
      maxAttempts: data.maxAttempts,
      timeLimit: data.timeLimit,
      shuffleQuestions: data.shuffleQuestions ?? false,
      requireAllTopics: data.requireAllTopics ?? false,
      isPublished: false
    }
  })

  return quiz
}

export async function updateQuiz(quizId: string, data: {
  title?: string
  description?: string
  passingScore?: number
  maxAttempts?: number
  timeLimit?: number
  shuffleQuestions?: boolean
  isPublished?: boolean
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { topic: { include: { course: true } } }
  })

  if (!quiz || quiz.topic.course.teacherId !== session.user.id) {
    throw new Error("Cuestionario no encontrado o no autorizado")
  }

  const updated = await prisma.quiz.update({
    where: { id: quizId },
    data
  })

  return updated
}

export async function deleteQuiz(quizId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { topic: { include: { course: true } } }
  })

  if (!quiz || quiz.topic.course.teacherId !== session.user.id) {
    throw new Error("Cuestionario no encontrado o no autorizado")
  }

  await prisma.quiz.delete({
    where: { id: quizId }
  })

  return { success: true }
}

// ============================================
// QUESTION CRUD OPERATIONS
// ============================================

export async function getQuizQuestions(quizId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { 
      topic: { include: { course: true } },
      questions: {
        orderBy: { order: "asc" }
      }
    }
  })

  if (!quiz || quiz.topic.course.teacherId !== session.user.id) {
    throw new Error("Cuestionario no encontrado o no autorizado")
  }

  return {
    quiz: {
      id: quiz.id,
      title: quiz.title,
      topicId: quiz.topicId
    },
    questions: quiz.questions
  }
}

export async function createQuestion(data: {
  quizId: string
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
  questionText: string
  imageUrl?: string
  options: any // JSON structure depends on question type
  points?: number
  explanation?: string
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: data.quizId },
    include: { 
      topic: { include: { course: true } },
      questions: true
    }
  })

  if (!quiz || quiz.topic.course.teacherId !== session.user.id) {
    throw new Error("Cuestionario no encontrado o no autorizado")
  }

  const nextOrder = quiz.questions.length > 0
    ? Math.max(...quiz.questions.map(q => q.order)) + 1
    : 1

  const question = await prisma.question.create({
    data: {
      quizId: data.quizId,
      type: data.type,
      questionText: data.questionText,
      imageUrl: data.imageUrl,
      options: data.options,
      points: data.points ?? 1,
      explanation: data.explanation,
      order: nextOrder
    }
  })

  return question
}

export async function updateQuestion(questionId: string, data: {
  questionText?: string
  imageUrl?: string
  options?: any
  points?: number
  explanation?: string
  order?: number
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: { include: { topic: { include: { course: true } } } } }
  })

  if (!question || question.quiz.topic.course.teacherId !== session.user.id) {
    throw new Error("Pregunta no encontrada o no autorizada")
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data
  })

  return updated
}

export async function deleteQuestion(questionId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: { include: { topic: { include: { course: true } } } } }
  })

  if (!question || question.quiz.topic.course.teacherId !== session.user.id) {
    throw new Error("Pregunta no encontrada o no autorizada")
  }

  await prisma.question.delete({
    where: { id: questionId }
  })

  return { success: true }
}


export async function changeStudentLearningProfile(
  studentId: string,
  newProfile: "Visual" | "Auditivo" | "Kinestesico"
) {
  const { revalidatePath } = await import('next/cache')
  
  const session = await auth()
  
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("No autorizado")
  }

  // Verify the teacher has at least one course with this student
  const studentEnrollment = await prisma.enrollment.findFirst({
    where: {
      userId: studentId,
      course: {
        teacherId: session.user.id
      }
    }
  })

  if (!studentEnrollment) {
    throw new Error("No tienes acceso a este estudiante")
  }

  // Update the student's profile globally
  const updatedUser = await prisma.user.update({
    where: { id: studentId },
    data: {
      studyProfile: newProfile
    }
  })

  // Revalidate the student's course pages to refresh the session
  revalidatePath(`/student/courses`, 'layout')

  return updatedUser
}
