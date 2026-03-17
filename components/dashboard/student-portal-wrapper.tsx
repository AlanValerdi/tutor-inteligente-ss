"use client"

import { StudentPortal } from "./student-portal"
import { handleSignOut } from "@/lib/actions/auth"
import { useRouter } from "next/navigation"

interface StudentPortalWrapperProps {
  studentName: string
  studentId: string
}

export function StudentPortalWrapper({ studentName, studentId }: StudentPortalWrapperProps) {
  const router = useRouter()

  const handleExit = async () => {
    try {
      await handleSignOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      // Fallback to client-side redirect
      router.push("/login")
    }
  }

  return (
    <StudentPortal
      onExit={handleExit}
      studentName={studentName}
      studentId={studentId}
    />
  )
}