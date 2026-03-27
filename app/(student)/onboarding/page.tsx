import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { OnboardingClient } from "./onboarding-client"

export default async function OnboardingPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { studyProfile: true }
  })

  // If already has profile, skip onboarding
  if (user?.studyProfile) {
    redirect("/student")
  }

  return <OnboardingClient />
}
