"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { enrollSchema, type EnrollInput } from "@/lib/validations/course"
import { revalidatePath } from "next/cache"

export async function enrollInCourse(data: EnrollInput) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("You must be logged in to enroll")
  }

  const validated = enrollSchema.parse(data)

  const course = await prisma.course.findUnique({
    where: { id: validated.courseId },
  })

  if (!course) {
    throw new Error("Course not found")
  }

  if (!course.isPublished) {
    throw new Error("This course is not available for enrollment")
  }

  if (course.enrollKey !== validated.enrollKey) {
    throw new Error("Invalid enrollment key")
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: validated.courseId,
      },
    },
  })

  if (existingEnrollment) {
    throw new Error("You are already enrolled in this course")
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: session.user.id,
      courseId: validated.courseId,
    },
    include: {
      course: {
        select: { id: true, title: true },
      },
    },
  })

  revalidatePath("/student/courses")
  return enrollment
}

export async function getStudentEnrollments() {
  const session = await auth()
  
  if (!session?.user) {
    return []
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          teacher: {
            select: { id: true, name: true, image: true },
          },
          topics: {
            select: { id: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })

  return enrollments
}

export async function getEnrollmentProgress(courseId: string) {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
  })

  return enrollment
}

export async function updateProgress(courseId: string, progress: number) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const enrollment = await prisma.enrollment.update({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
    data: {
      progress: Math.min(100, Math.max(0, progress)),
    },
  })

  revalidatePath(`/student/courses/${courseId}`)
  return enrollment
}

// Nuevas funciones para el dashboard del estudiante
export async function getStudentDashboardStats() {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  // Obtener cursos inscritos
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          topics: {
            select: { id: true },
          },
        },
      },
    },
  })

  // Calcular estadísticas
  const enrolledCoursesCount = enrollments.length
  const totalTopics = enrollments.reduce((sum, enrollment) => sum + enrollment.course.topics.length, 0)
  const averageProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / enrollments.length)
    : 0

  return {
    enrolledCourses: enrolledCoursesCount,
    totalTopics,
    averageProgress,
    completedCourses: enrollments.filter(e => e.progress >= 100).length,
  }
}

export async function getStudentEnrolledCoursesWithProgress() {
  const session = await auth()
  
  if (!session?.user) {
    return []
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          teacher: {
            select: { id: true, name: true, image: true },
          },
          topics: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })

  return enrollments.map(enrollment => ({
    ...enrollment,
    course: {
      ...enrollment.course,
      topicsCount: enrollment.course.topics.length,
      studentsEnrolled: enrollment.course._count.enrollments,
    },
  }))
}
