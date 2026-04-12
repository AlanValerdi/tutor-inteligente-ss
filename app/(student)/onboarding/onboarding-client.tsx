"use client"

import { DiagnosticWizard } from "@/components/lms/diagnostic-wizard"
import { saveStudyProfile } from "@/lib/actions/student"
import { StudyProfile } from "@/lib/lms-data"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function OnboardingClient() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleComplete = async (profile: StudyProfile) => {
    setSaving(true)
    try {
      await saveStudyProfile(profile)
      router.push("/student/enroll")
    } catch (error) {
      console.error(error)
      setSaving(false)
    }
  }

  if (saving) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Personalizando tu experiencia...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <DiagnosticWizard onComplete={handleComplete} />
      </div>
    </div>
  )
}
