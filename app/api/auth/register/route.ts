import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { isAdminEmail } from "@/lib/admin"
import { hash } from "bcryptjs"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(), // Password is optional for OAuth users
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    // If user exists and tries to register with credentials, return error
    if (existingUser && password) {
      return NextResponse.json(
        { 
          error: "Este email ya está registrado. Por favor, inicia sesión o usa Google para continuar.",
          existingUser: true
        },
        { status: 400 }
      )
    }

    // If user exists, just return the existing user
    if (existingUser) {
      return NextResponse.json({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        created: false
      }, { status: 200 })
    }

    const role = isAdminEmail(email) ? "ADMIN" : "STUDENT"

    // Hash password if provided (for credential-based registration)
    const hashedPassword = password ? await hash(password, 10) : undefined

    const user = await prisma.user.create({
      data: {
        name,
        email,
        ...(hashedPassword && { password: hashedPassword }),
        role
      }
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created: true
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    )
  }
}
