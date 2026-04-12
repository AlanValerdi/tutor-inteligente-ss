import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { EnrollClientPage } from "./enroll-client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function StudentEnrollPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "STUDENT") {
    redirect("/dashboard")
  }

  // Verify user has completed diagnostic
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { studyProfile: true }
  })

  if (!user?.studyProfile) {
    redirect("/onboarding")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="container mx-auto px-4 py-3">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/student">
              <ArrowLeft className="h-4 w-4" />
              Volver al Panel
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <EnrollClientPage />
      </div>
    </div>
  )
}
