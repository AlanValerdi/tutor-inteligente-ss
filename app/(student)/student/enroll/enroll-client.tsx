"use client"

import { useRouter } from "next/navigation"
import { EnrollByKey } from "@/components/student/enroll-by-key"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Key } from "lucide-react"

export function EnrollClientPage() {
  const router = useRouter()

  const handleEnrollSuccess = () => {
    // Redirect to enrolled courses after successful enrollment
    router.push("/student/courses")
    router.refresh()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
    

      <div className="grid gap-6">
        {/* Enrollment Card */}
        <EnrollByKey onEnrollSuccess={handleEnrollSuccess} />
      </div>
    </div>
  )
}
