"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createCourseSchema, updateCourseSchema, type CreateCourseInput, type UpdateCourseInput } from "@/lib/validations/course"
import { revalidatePath } from "next/cache"

export async function createCourse(data: CreateCourseInput) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    throw new Error("Only teachers can create courses")
  }

  const validated = createCourseSchema.parse(data)

  const course = await prisma.course.create({
    data: {
      title: validated.title,
      description: validated.description,
      enrollKey: validated.enrollKey,
      isPublished: validated.isPublished,
      teacherId: session.user.id,
    },
    include: {
      teacher: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  revalidatePath("/teacher/courses")
  return course
}

export async function updateCourse(courseId: string, data: UpdateCourseInput) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!existingCourse) {
    throw new Error("Course not found")
  }

  if (existingCourse.teacherId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("You can only edit your own courses")
  }

  const validated = updateCourseSchema.parse(data)

  const course = await prisma.course.update({
    where: { id: courseId },
    data: validated,
    include: {
      teacher: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  revalidatePath("/teacher/courses")
  revalidatePath(`/teacher/courses/${courseId}`)
  return course
}

export async function deleteCourse(courseId: string) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!existingCourse) {
    throw new Error("Course not found")
  }

  if (existingCourse.teacherId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("You can only delete your own courses")
  }

  await prisma.course.delete({
    where: { id: courseId },
  })

  revalidatePath("/teacher/courses")
  return { success: true }
}

export async function getTeacherCourses() {
  const session = await auth()
  
  if (!session?.user) {
    return []
  }

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: {
        select: { enrollments: true, topics: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return courses
}

export async function getCourseById(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teacher: {
        select: { id: true, name: true, email: true, image: true },
      },
      topics: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { enrollments: true },
      },
    },
  })

  return course
}

export async function getPublishedCourses() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      teacher: {
        select: { id: true, name: true, image: true },
      },
      _count: {
        select: { enrollments: true, topics: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return courses
}
