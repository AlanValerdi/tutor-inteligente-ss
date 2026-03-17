"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const topicSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  order: z.number().int().positive(),
})

export async function createTopic(courseId: string, data: { title: string; content: string; order: number }) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course) {
    throw new Error("Course not found")
  }

  if (course.teacherId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("You can only add topics to your own courses")
  }

  const validated = topicSchema.parse(data)

  const topic = await prisma.topic.create({
    data: {
      title: validated.title,
      content: validated.content,
      order: validated.order,
      courseId,
    },
  })

  revalidatePath(`/teacher/courses/${courseId}`)
  revalidatePath(`/student/courses/${courseId}`)
  return topic
}

export async function updateTopic(topicId: string, data: { title?: string; content?: string; order?: number }) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { course: true },
  })

  if (!topic) {
    throw new Error("Topic not found")
  }

  if (topic.course.teacherId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("You can only edit topics in your own courses")
  }

  const validated = topicSchema.partial().parse(data)

  const updated = await prisma.topic.update({
    where: { id: topicId },
    data: validated,
  })

  revalidatePath(`/teacher/courses/${topic.courseId}`)
  revalidatePath(`/student/courses/${topic.courseId}`)
  return updated
}

export async function deleteTopic(topicId: string) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { course: true },
  })

  if (!topic) {
    throw new Error("Topic not found")
  }

  if (topic.course.teacherId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("You can only delete topics in your own courses")
  }

  await prisma.topic.delete({
    where: { id: topicId },
  })

  revalidatePath(`/teacher/courses/${topic.courseId}`)
  revalidatePath(`/student/courses/${topic.courseId}`)
  return { success: true }
}
