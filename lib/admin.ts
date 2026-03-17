import { prisma } from "@/lib/db"

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) ?? []

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}

export async function getUserRole(email: string): Promise<string> {
  if (isAdminEmail(email)) return "ADMIN"
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  })
  
  return user?.role ?? "STUDENT"
}
