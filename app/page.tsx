"use client"

import { useState } from "react"
import { RoleSelector } from "@/components/lms/role-selector"
import { StudentPortal } from "@/components/lms/student-portal"
import { TeacherPortal } from "@/components/lms/teacher-portal"

type Role = "student" | "teacher" | null

export default function Page() {
  const [role, setRole] = useState<Role>(null)

  if (role === "student") {
    return <StudentPortal onExit={() => setRole(null)} />
  }

  if (role === "teacher") {
    return <TeacherPortal onExit={() => setRole(null)} />
  }

  return <RoleSelector onSelectRole={setRole} />
}
