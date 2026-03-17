"use server"

import { auth, signOut } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isAdminEmail } from "@/lib/admin"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function register(data: RegisterInput) {
  const validated = registerSchema.parse(data)

  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email },
  })

  if (existingUser) {
    throw new Error("Email already registered")
  }

  const hashedPassword = await hash(validated.password, 12)

  const user = await prisma.user.create({
    data: {
      email: validated.email,
      name: validated.name,
      password: hashedPassword,
      role: isAdminEmail(validated.email) ? "ADMIN" : "STUDENT",
    },
  })

  revalidatePath("/login")
  return { success: true, userId: user.id }
}

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
    },
  })

  return user
}

export async function handleSignOut() {
  await signOut()
}
